

argocd 的项目token维护，这样在gitlabci或者其他的ci项目中可以远程调用argocd,达到自动化的目的
先新增一个 proj级别的role，然后给一些修改的权限，然后再生成token 。
```

Argocd proj role create token
argocd proj role create-token¶

Create a project token

argocd proj role create-token PROJECT ROLE-NAME [flags]

Options¶

  -e, --expires-in string   Duration before the token will expire, e.g. "12h", "7d". (Default: No expiration)
  -h, --help                help for create-token
  -i, --id string           Token unique identifier. (Default: Random UUID)
  -t, --token-only          Output token only - for use in scripts.

Options inherited from parent commands¶

      --auth-token string               Authentication token
      --client-crt string               Client certificate file
      --client-crt-key string           Client certificate key file
      --config string                   Path to Argo CD config (default "/home/user/.config/argocd/config")
      --core                            If set to true then CLI talks directly to Kubernetes instead of talking to Argo CD API server
      --grpc-web                        Enables gRPC-web protocol. Useful if Argo CD server is behind proxy which does not support HTTP2.
      --grpc-web-root-path string       Enables gRPC-web protocol. Useful if Argo CD server is behind proxy which does not support HTTP2. Set web root.
  -H, --header strings                  Sets additional header to all requests made by Argo CD CLI. (Can be repeated multiple times to add multiple headers, also supports comma separated headers)
具体配置role的权限 参考使用UI 来创建。具体cli的命令展示不熟悉。