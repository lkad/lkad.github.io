---
layout: post
title:  "traefik使用Let’sEncrypt和阿里云的dns验证使用ssl证书同时使用docker自动发现和配置文件动态配置进行内网服务反代"
date:  2023.3.29
categories: traefik使用Let’sEncrypt和阿里云的dns验证使用ssl证书同时使用docker自动发现和配置文件动态配置进行内网服务反代
---

现在浏览器已经将没有证书的网站标记为不安全，为了访问方便现在使用traefik 在前面做一层反代，将家中的docker里面的一些服务自动代理出来，且自动配置https的证书，这样就不需要单独去每个服务配置对应的证书，减少很多麻烦。traefik会在证书自动到期之前自动续期。
# 1.创建traefik服务
下面的教程，创建了服务，将443的端口映射到主机的9443端口。我们后续访问所有的服务，就通过9443访问了。
```
services:
  traefik:
    image: "traefik:v2.8"
    container_name: "traefik"
    command:
      #- "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"

      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=alidns"
      - "--accesslog=true"
        #- '--log.level=DEBUG'
      # provider 按照实际的填。
      #- "--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
      - "--certificatesresolvers.myresolver.acme.email=postmaster@lkad.net"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--providers.file.directory=/config"
      - "--providers.file.watch=true"
    ports:
      - "980:80"
      - "9443:443"
      - "9081:8080"
    environment:
    #根据对应的provider进行更改。文档里面有连接. 下面会说这个aksk怎么获取.
      - "ALICLOUD_ACCESS_KEY=ak"
      - "ALICLOUD_SECRET_KEY=sk"
    #   - "OVH_APPLICATION_SECRET=xxx"
    #   - "OVH_CONSUMER_KEY=xxx"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./config:/config"
  whoami:
    image: "traefik/whoami"
    container_name: "simple-service"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.docker.lkad.net`)"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls.certresolver=myresolver"
```

以上就是traefik安装和自带了一个http的服务，我们通过标签的方式通知traefik自动将whoami.docker.lkad.net配置为https证书，同时此域名直接指向simple-service的服务。这里whoami.docker.lkad.net修改为大家自己的域名。
上面的letsencrypt的配置一些说明:
```
      - "--certificatesresolvers.myresolver.acme.dnschallenge=true"

      - "--certificatesresolvers.myresolver.acme.dnschallenge.provider=alidns"
```
这是开启acme的dns通道，简单来说，就是通过 acme的dns通道自动去letsencrypt去签发我们需要的证书，然后letencrypt通过验证dns txt的信息确认这个域名的所有权是否为申请者的，如果是，则签发证书..原理是可以通过不同运营商的api接口去修改dns解析的内容，提供给lesencrypt验证.
# 配置阿里云单独使用三级域名做解析
这里我们配置的的dns通道使用的是alidns。那么下面我们就需要在阿里云上进行一定的操作。例如我现在使用的是三级域名*.docker.lkad.net 那么整个*.docker.lkad.net的dns要能被traefik进行修改，这样会带来一个很严重的问题*.lkad.net也一并可以被修改，存在dns权限泄漏的问题，所以我们要在阿里云上配置docker.lkad.net为单独的解析域，并且配置traefik可以访问阿里云的账号的权限，只能解析*.docker.lkad.net,这里我们在阿里云配置的解析域名为docker.lkad.net
同时将*.docker.lkad.net的解析ip地址为安装 traefik的主机地址.



![[Pasted image 20230329092920.png]]




然后再阿里云新建了一个子账号dns

给这个账号的权限配置为：这两个策略，都为账号级别.
```
[docker.lkad.net.edit](https://ram.console.aliyun.com/policies/docker.lkad.net.edit/Custom/content)  
自定义策略
[AliyunDNSReadOnlyAccess](https://ram.console.aliyun.com/policies/AliyunDNSReadOnlyAccess/System/content)  
系统策略
```

其中自定义策略的内容为:docker.lkad.net.edit
```
{
    "Version": "1",
    "Statement": [
        {
            "Action": "alidns:*",
            "Resource": "acs:alidns:*:*:domain/docker.lkad.net",
            "Effect": "Allow"
        },
        {
            "Action": [
                "alidns:DescribeSiteMonitorIspInfos",
                "alidns:DescribeSiteMonitorIspCityInfos",
                "alidns:DescribeSupportLines",
                "alidns:DescribeDomains",
                "alidns:DescribeDomainNs",
                "alidns:DescribeDomainGroups"
            ],
            "Resource": "acs:alidns:*:*:*",
            "Effect": "Allow"
        }
    ]
}
```
上面的"Resource": "acs:alidns:*:*:domain/docker.lkad.net", 就是大家在阿里云解析上面单独配置的三级域名的解析名称.将docker.lkad.net改成你自己的三级域名即可.

然后将此账号的ak,sk配置到docker-compose中的 ak.sk
```
      - "ALICLOUD_ACCESS_KEY=ak"
      - "ALICLOUD_SECRET_KEY=sk"
```
即可
# 验证配置是否正确
```
C:\Users\lou_k>curl https://whoami.docker.lkad.net:9443 -L
Hostname: 8ae6df8b4660
IP: 127.0.0.1
IP: 172.19.0.4
RemoteAddr: 172.19.0.5:43410
GET / HTTP/1.1
Host: whoami.docker.lkad.net:9443
User-Agent: curl/7.83.1
Accept: */*
Accept-Encoding: gzip
X-Forwarded-For: 111.181.88.131
X-Forwarded-Host: whoami.docker.lkad.net:9443
X-Forwarded-Port: 9443
X-Forwarded-Proto: https
X-Forwarded-Server: 6d940859ea14
X-Real-Ip: 111.181.88.131
```
有返回请求头的信息就代表配置成功.

# 如何发布其他的服务
## 发布docker服务
我们这里想发布一个其他的docker服务，这里我们创建了一个nexus的服务，并且通过https 去访问.
docker-compose.yaml
```
version: '3'
services:
  nexus:
    image: 'sonatype/nexus3'
    container_name: nexus
    restart: always
    environment:
      - TZ=Asia/Shanghai
    ports:
      - '5000:5000'
      - '8081:8081'
      - '8005:8005'
      - '8001:8001'
    volumes:
      - './docker-nexus/data:/nexus-data'
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nexus.rule=Host(`xxx.docker.lkad.net`)"
      - "traefik.http.routers.nexus.entrypoints=websecure"
      - "traefik.http.routers.nexus.tls.certresolver=myresolver"
    networks:
      - traefik_default
networks:
  traefik_default:
    external: true
```
就可以直接使用了
## 发布非docker服务
在traefik docker-compose 的config目录下 新建一个a.yaml的文件
输入里面的内容
```
http:
  routers:
    kubeflow:
      rule: "Host(`kubeflow.kubeflow.minikube.docker.lkad.net`)"
      service: kubeflow
      entrypoints: websecure
      tls:
        certResolver: myresolver
        domains:
          - sans:
              - "*.kubeflow.minikube.docker.lkad.net"
  services:
    kubeflow:
      loadBalancer:
       servers:
         - url: "http://192.168.8.162:32265"
```
这里实现了一个四级的泛域名证书*.kubeflow.minikube.docker.lkad.net,同时将kubeflow.kubeflow.minikube.docker.lkad.net 域名转发到内网http://192.168.8.162:32265 ，这样访问https://kubeflow.kubeflow.minikube.docker.lkad.net 则为http://192.168.8.162:32265
