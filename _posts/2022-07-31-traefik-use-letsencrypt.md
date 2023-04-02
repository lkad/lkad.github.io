---
layout: post
title:  "traefik use letsencrypt 自动获取https证书"
date:   2022-03-20 23:26:17 +0800
categories: jekyll update
---
### 为什么需要https 
最近使用code-server，发现有些插件无法使用，查询官方说明，如果code-server是在http的协议下运行，则会有一些功能无法使用,所以需要使用https。https则需要域名才能申请证书，正好我有一个域名 example.com 我想把*.docker.example.com专门给docker用，同时按照需要申请https证书.
### 免费https 哪家最流行
随便网上搜了下，免费https 就属letsencrypt 最流行了。所以查询了下使用方法。同时通过traefik的内置功能实现自动获取https的证书。

### traefik 是什么 
Traefik 是一个开源的可以使服务发布变得轻松有趣的边缘路由器。它负责接收你系统的请求，然后使用合适的组件来对这些请求进行处理。

除了众多的功能之外，Traefik 的与众不同之处还在于它会自动发现适合你服务的配置。当 Traefik 在检查你的服务时，会找到服务的相关信息并找到合适的服务来满足对应的请求。

Traefik 兼容所有主流的集群技术，比如 Kubernetes，Docker，Docker Swarm，AWS，Mesos，Marathon，等等；并且可以同时处理多种方式。（甚至可以用于在裸机上运行的比较旧的软件。）
### traefik在docker中的用法 我自己家里面的一个用法。
使用traefik之前是每个docker自己映射host的端口进行访问，这样每个需要发访问的都是一个端口。
后来发现了traefik，可以作为http网关。类似于一个反代服务器。
traefik开放一个入口，通过监听docker server 来识别容器的标签，通过标签自动配置反代规则，所有流量入口从traefik进去。
用户访问--> traefik<-->docker
                |        |
                |        |
                |        |
                V        V
            自动配置反代 -->server1
                    |
                    ---->server2 
### treafik 集成let encrypt 
traefik proxy 集成了acme ,可以选择let's encrypt的provider。这样就相当于traefik集成了let's encrypt。 
因为let's encrypt 一次只能申请90天的证书，所以我们需要配置acme自动到期前申请新证书。具体配置涉及到以下几个方面
1. acme的基本配置，配置let's encrypt.
2. let's encrypt的自动申请配置，由于家里面没有80和443端口，无法使用http和tls的通道。只能使用dns通道 
3. 由于使用nds通道，则需要配置dns api的权限，同时又不想把整个dns的权限暴露出去，所以需要配置只有二级域名权限的子账号来给acme使用
4. 配置对应的申请周期。
#### traefik 配置acme 支持let's encrypt 
申请证书需要验证域名。let's encrypt 提供三种方式来进行验证 http ,tls ,dns . 因为没有80和443 端口，使用dns方式来验证.
参考 https://doc.traefik.io/traefik/user-guides/docker-compose/acme-dns/ 来配置对应的acme的dns 配置
参考 https://doc.traefik.io/traefik/https/acme/#providers 来选择对应的dns providers 。
文件 docker-compose.yaml的内容如下
```bash
version: "3.3"

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
      # provider 按照实际的填。
      #- "--certificatesresolvers.myresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
      - "--certificatesresolvers.myresolver.acme.email=postmaster@example.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    environment:
    #根据对应的provider进行更改。文档里面有连接.
      - "ALICLOUD_ACCESS_KEY=xxx"
      - "ALICLOUD_SECRET_KEY=xxx"
    #   - "OVH_APPLICATION_SECRET=xxx"
    #   - "OVH_CONSUMER_KEY=xxx"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  whoami:
    image: "traefik/whoami"
    container_name: "simple-service"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.docker.example.com`)"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls.certresolver=myresolver"
```
更改上面的acme.email , 同时更改环境变量 ALICLOUD_ACCESS_KEY ，ALICLOUD_SECRET_KEY . 注意这个ak和sk 是阿里云的账号访问权限，必须要有dns的解析更改权限. 下一步就是如何向阿里云申请ak和sk 同时授权dns相关权限.
#### 配置阿里云最小化ram子账户权限，只能修改dns *.docker.example.com的记录 
由于阿里云dns权限的控制没有到某条解析记录的颗粒度，最小的颗粒度就是子域名。所以需要先配置子域docker.example.com，这样就可以单独配置子域的权限了。子域配置方法：  https://help.aliyun.com/document_detail/127149.htm?spm=a2c4g.11186623.0.0.47a55b8eJxq4rE#topic-2035896 这里我们使用 主域和子域都使用阿里云DNS，使用不同账号管理的 方式来配置（实际上都是在一个账号里面）

同时新建授权规则: docker.example.com.edit的规则 
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
然后保存，然后新建子账号，将此权限给子账号.同时新建子账号的ak和sk 下载下来，填充到上面的  ALICLOUD_ACCESS_KEY ，ALICLOUD_SECRET_KEY   中去。然后
#### 验证 https证书是否OK
curl https://whoami.docker.example.com:9443 正常回显 即为正常。
#### 使用其他的容器注意事项
由于docker-compose  默认是使用自己的network，所以如果还有其他的docker-compose需要使用traefik代理的，建议在网络里面直接加上使用traefik 的网络;
```
loony@loony-MS-7C37:/mnt/data3/docker/code-server$ docker network ls 
NETWORK ID     NAME                  DRIVER    SCOPE
801f8dedc366   bridge                bridge    local
c76afc252eaa   code-server_default   bridge    local
49b7ce603ce1   host                  host      local
10f8c066f85e   nextcloud_default     bridge    local
0e4e59d45883   none                  null      local
0133065ad5f6   seafile_seafile-net   bridge    local
25e4b1d7408f   traefik_default       bridge    local
```
上面可以看到 默认的traefik的网络为traefik_default 那么记得将需要的容器配置的时候连接到这个网络即可
```
version: "3"

services:
  code-server:
    image: codeserver-lk
    ports:
      - "19080:8080"
    volumes:
      - "/home/loony/.config/code-server:/home/coder/.config/code-server"
        #      - "$(id -u):$(id -g)" 
      - "/home/loony/code:/home/coder/project"
    environment:
      - "DOCKER_USER=$USER"
    restart: always
    user: "1000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.codeserver.rule=Host(`code.docker.lkad.net`)"
      - "traefik.http.routers.codeserver.entrypoints=websecure"
      - "traefik.http.routers.codeserver.tls.certresolver=myresolver"
    networks:
      - traefik_default
networks:
  traefik_default:
    external: true
```