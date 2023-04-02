---
layout: post
title:  "traefik-rewrit"
date:   2021.12.22
categories: traefik-rewrit
---
今天在公司有前后端项目需要上线，需要把/api开头的路径转发给后端，同时去掉api 。类似于/api/login->后端/login 的rewrite .参考以前的文件 对traefik进行ingress 注解，发现无效。大体如下：
```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: traefik
    kubesphere.io/creator: admin
    traefik.ingress.kubernetes.io/rule-type: PathPrefixStrip
  creationTimestamp: "2021-12-22T09:28:28Z"
  generation: 6
  name: tset
  namespace: default
  resourceVersion: "2108536"
  uid: 8d07fd41-8508-4b6a-8ff0-c6e14e7003d9
spec:
  ingressClassName: traefik
  rules:
  - host: nexus-test.kube-test.lkad.net
    http:
      paths:
      - backend:
          service:
            name: test-svc
            port:
              number: 80
        path: /api
        pathType: ImplementationSpecific
status:
  loadBalancer: {}
```
发现无解，后来查看官方网站 发现 : v1的traefik ingress 是这么实现的 把example.org/admin/ 转发给admin-svc/
```
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: traefik
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/rule-type: PathPrefixStrip
spec:
  rules:
  - host: example.org
    http:
      paths:
      - path: /admin
        backend:
          serviceName: admin-svc
          servicePort: admin
```
v2版本需要用到ingress route 和一些中间件 
```
---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: http-redirect-ingressroute
  namespace: admin-web
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`example.org`) && PathPrefix(`/admin`)
      kind: Rule
      services:
        - name: admin-svc
          port: admin
      middlewares:
        - name: admin-stripprefix
---


apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: admin-stripprefix
spec:
  stripPrefix:
    prefixes:
      - /admin
```
上面的示例就是先配置了一个 ingress route ，匹配到example.org/admin 转发给admin-svc 同时加入了一个中间的处理器admin-stripprefix. 这个处理器西面进行了中间件的定义 采用stripPrefix 对/admin的前缀进行去除。这样就相当于example.org/admin->admin-svc/了。 
下面的示例，定义了一个redirect的规则的middleware ，然后再使用这个middleware 就可以了。
redirect 
```
---
# Redirect with domain replacement
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: test-redirectregex
spec:
  redirectRegex:
    regex: ^http://localhost/(.*)
    replacement: http://mydomain/${1}

---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: http-redirect-ingressroute
  namespace: admin-web
spec:
  entryPoints:
    - web
  routes:
    - match: Host(`localhost`) && PathPrefix(`/admin`)
      kind: Rule
      services:
        - name: admin-svc
          port: admin
      middlewares:
        - name: test-redirectregex
```
同域名下的复杂规则重定向:可以使用ReplacePathRegex 这种就是通过正则替换来实现重定向
```
# Replace path with regex
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: test-replacepathregex
spec:
  replacePathRegex:
    regex: ^/foo/(.*)
    replacement: /bar/$1
```
还能通过正则来匹配进行前缀删除
```
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: test-stripprefixregex
spec:
  stripPrefixRegex:
    regex:
      - "/foo/[a-z0-9]+/[0-9]+/"
```
