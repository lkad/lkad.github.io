---
layout: post
title:  "argo cd 本地用户管理"
date:   2022-08-10 14:22:17 +0800
categories: jekyll update
---
# argo cd本地用户管理
先看下官网的用户说明：
> The local users/accounts feature serves two main use-cases:
>  - Auth tokens for Argo CD management automation. It is possible to configure an API account with limited permissions and generate an authentication token. Such token can be used to automatically create applications, projects etc.
> - Additional users for a very small team where use of SSO integration might be considered an overkill. The local users don't provide advanced features such as groups, login history etc. So if you need such features it is strongly recommended to use SSO.

其实我们使用本地用户主要的也是需要通过使用api来创建对应的工作流的相应的参数，通过gitlab ci 来进行远程hook调用.
首先安装一个argocd的server端，一般通过helm或者官方提供的install 脚本进行安装，我这里则不做演示。
### 官方支持的用户种类
local
  Auth0
- SSO
- Microsoft
- Okta
- OneLogin
- Keycloak
- OpenUnison
- Google
我们这里主要讲一下local模式的使用方法.
本地用户添加时通过argocd-cm来添加的，我们先添加一个api用户用来使用argocdapi , #accounts.api.enabled: "false" 注释掉，默认是具有
```
apiVersion: v1
kind: ConfigMap
metadata:

  labels:
    app.kubernetes.io/name: argocd-cm
    app.kubernetes.io/part-of: argocd
  name: argocd-cm
  namespace: argocd
  resourceVersion: "19398610"
  uid: 302b99bc-666e-46d5-b0ed-0dcdbff9f383
data:
  # add an additional local user with apiKey and login capabilities
  #   apiKey - allows generating API keys
  #   login - allows to login using UI
  accounts.api: apiKey, login
  # disables user. User is enabled by default
  #accounts.alice.enabled: "false"
```
安装argocd  cli 
```
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd

```
cli的配置
Environment Variables¶

The following environment variables can be used with argocd CLI:
Environment Variable 	Description
 - ARGOCD_SERVER 	the address of the ArgoCD server without https:// prefix
(instead of specifying --server for every command)
eg. ARGOCD_SERVER=argocd.mycompany.com if served through an ingress with DNS
- ARGOCD_AUTH_TOKEN 	the ArgoCD apiKey for your ArgoCD user to be able to authenticate
- ARGOCD_OPTS 	command-line options to pass to argocd CLI
eg. ARGOCD_OPTS="--grpc-web"
先输入我们的argoserver
```
export ARGOCD_SERVER=xxxx.xxx.xxx
```

首先我们去获取admin的登陆token. 说明：
https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/
```
$ curl $ARGOCD_SERVER/api/v1/session -d $'{"username":"admin","password":"password"}'

#这个是返回的token，上面的账号密码是管理员的账号密码.{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1Njc4MTIzODcsImlzcyI6ImFyZ29jZCIsIm5iZiI6MTU2NzgxMjM4Nywic3ViIjoiYWRtaW4ifQ.ejyTgFxLhuY9mOBtKhcnvobg3QZXJ4_RusN_KIdVwao"} 
```
我们将上面的ARGOCD_AUTH_TOKEN = 我们获取的token 设置到环境变量里面就可以了。
```
export ARGOCD_AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1Njc4MTIzODcsImlzcyI6ImFyZ29jZCIsIm5iZiI6MTU2NzgxMjM4Nywic3ViIjoiYWRtaW4ifQ.ejyTgFxLhuY9mOBtKhcnvobg3QZXJ4_RusN_KIdVwao"

```
同时如果你使用的不是https协议 记得加上关闭验证的开关.
```
export ARGOCD_OPTS="--insecure --plaintext"
```
就可以看到能不能拿到我们刚才申请的账号了 
```
root@26efeaec08d6:/home/coder/project/lkad.github.io# argocd account  list
WARN[0000] Failed to invoke grpc call. Use flag --grpc-web in grpc calls. To avoid this warning message, use flag --grpc-web. 
NAME   ENABLED  CAPABILITIES
admin  true     login
api    true     apiKey, login
```
我们先设置一个api 的token 
```
root@26efeaec08d6:/home/coder/project/lkad.github.io# argocd account generate-token --account  api
WARN[0000] Failed to invoke grpc call. Use flag --grpc-web in grpc calls. To avoid this warning message, use flag --grpc-web. 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcmdvY2QiLCJzdWIiOiJhcGk6YXBpS2V5IiwibmJmIjoxNjYwMTg1NTk4LCJpYXQiOjE2NjAxODU1OTgsImp0aSI6ImIwNmIyMTdkLWVlZWMtNGVhNi1hMGU0LWFiNzA5ZTU4YjUxZiJ9.Sk4ZDDdvJ4kzhQzFutlrULZ4eNdjBDm5tKwA-1ct9CQ

```
下面就可以拿这个token做测试，看能不能获取到信息。
将token覆盖上面的ARGOCD_AUTH_TOKEN 然后再使用。即可 。
同时可以配置密码等操作：
```

```
