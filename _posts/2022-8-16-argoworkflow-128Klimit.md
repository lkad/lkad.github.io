---
layout: post
title:  "argo workflow  模板 128K限制情况"
date:   2022-08-10 14:22:17 +0800
categories: jekyll update
---
今天在生产环境中使用argo workflow 的时候出现了一个limit的错误 
具体argo workflow 版本为 3.3.5 
报错产生的原因是有一步需要通过input/output传递几百个参数的一个json格式，然后超过了128K的限制，后来查官网文档，发现有这么一段。
错误产生的代码如下：
```
envVarTemplateValue := wfv1.MustMarshallJSON(tmpl)
	templateSize := len(envVarTemplateValue)
	if templateSize > 128000 {
		err = fmt.Errorf("workflow templates are limited to 128KB, this workflow is %d bytes", templateSize)
		return nil, err
	}
``` 
触发条件：使用argo的脚本模式，在脚本里面不停的复制print("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
超过128K即可触发
后来此限制在以后的版本中删除了，具体的pr信息为：
```
https://github.com/argoproj/argo-workflows/pull/8796
```
随后我们升级了argo workflow 到最新3.3.9版本
升级后这个错误确实已经不在了，但是会引发另外一个错误:
argo的init容器报 standard_init_linux.go:228: exec user process caused: argument list too long错误
。以下是init的内容
```
 initContainers:
    - name: init
      image: 'quay.io/argoproj/argoexec:v3.3.9'
      command:
        - argoexec
        - init
        - '--loglevel'
        - info
      env:
        - name: ARGO_POD_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.name
        - name: ARGO_POD_UID
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.uid
        - name: ARGO_CONTAINER_RUNTIME_EXECUTOR
          value: emissary
        - name: GODEBUG
          value: x509ignoreCN=0
        - name: ARGO_WORKFLOW_NAME
          value: scripts-python-fxv48
        - name: ARGO_CONTAINER_NAME
          value: init
        - name: ARGO_TEMPLATE
          value: >-
            {"name":"gen-random-int","inputs":{},"outputs":{},"metadata":{},"script":{"name":"","image":"python:alpine3.6","command":["python"],"resources":{},"source":"import
            random\ni = random.randint(1, # 这里是我脚本的内容。很长，超过了128K。
```
这个错误是shell的arg太长的报错，跟内核参数相关。
具体连接看这个：
https://github.com/argoproj/argo-workflows/issues/7586
因为从debian的基础镜像切换到aphine 导致 getconf ARG_MAX 的值只有128K，所以环境变量不能超过128K。故而导致单个模板里面的环境变量+输入输出+模板脚本内容不能超过128K，超过了就会报错 .
然后有人提交了一个 pr 
```
https://github.com/argoproj/argo-workflows/pull/8169
```
增加了128K限制的友好说明 也在test里面新增了一些用例。。。然而下面来了一个牛逼的操作.
有人直接把128K限制的友好说明的代码给删除了同时修改了测试用例。。。
```
https://github.com/argoproj/argo-workflows/pull/8796


@dpadhiar
feat: remove size limit of 128kb for workflow templates
8106db9
@dpadhiar
test: removed unnecessary test case for large workflows 
```
我表示 我看到8796的时候没有深入的了解，以为解决了，花了一天时间升级，测试。。结果还是有问题，后来直接用共享存储来传递的数据。
开源界合并代码前感觉还是需要谨慎一下