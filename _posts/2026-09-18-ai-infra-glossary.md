---
layout: post
title:  "附录：术语与符号表"
date:   2026-09-17 15:00:00 +0800
categories: AI-Infra
tags: [术语表, 符号约定]
---


## 术语

| 术语（中文） | 英文 | 定义/约定 | 首次出现章节 |
|---|---|---|---|
| 虚拟文件系统 | VFS (Virtual File System) | Linux 文件系统抽象层，统一所有 FS 接口，应用只与 VFS 打交道 | 1 |
| 目录项缓存 | dentry (directory entry cache) | 缓存目录项以加速路径查找 | 1 |
| 索引节点 | inode | 文件元数据（大小/权限/块列表），一个文件全局唯一 | 1 |
| 页缓存 | page cache | 内核把读过的文件内容缓存在内存（4 KB/页）的统一缓冲 | 1 |
| 脏页 | dirty page | 已写入 page cache 但尚未刷盘的页 | 1 |
| 写回 | writeback | 后台线程把 dirty page 刷到磁盘的机制 | 1 |
| 直接 IO | O_DIRECT | 绕过 page cache 直接读写设备，用于测硬件真实能力 | 1 |
| 块 IO 单元 | bio (block I/O) | block layer 的一次 IO 请求单元 | 1 |
| IO 等待时间 | await | iostat 中 IO 请求从入队到完成的平均等待 | 1 |
| 放置组 | PG (Placement Group) | 对象与 OSD 之间的中间层，聚合成组后作为一个放置单位 | 2 |
| 纠删码 | EC (Erasure Coding) | 数据切 k 块 + m 块校验，任意 m 块丢失可恢复 | 2 |
| 副本 | replica | 数据多份复制以抗故障，空间利用率 1/副本数 | 2 |
| 写放大 | write amplification | 实际写入量 / 有效数据量（副本3=3，EC(4,2)=6） | 2 |
| 可控可扩展哈希 | CRUSH | Ceph 的数据分布算法，基于集群拓扑的分层放置 | 2 |
| 聚合带宽 | aggregate bandwidth | 集群所有节点并行读的总吞吐，厂商宣传口径；与单客户端带宽相对 | 3 |
| 单客户端带宽 | single-client bandwidth | 单个客户端进程实际能分到的读带宽，训练 worker 的真实体验 | 3 |
| 流式 IO | streaming I/O | 大块顺序读写的 IO 模式，训练数据集典型 | 3 |
| 突发 IO | bursty I/O | 短时高并发读、稳态几乎为 0 的 IO 模式，推理冷启动典型 | 3 |
| 远程直接内存访问 | RDMA | 网卡直接读写远端内存/显存，绕过 CPU 与内核 | 4 |
| 无损网络 | lossless network | PFC/ECN 保证不丢包的网络，RDMA 的前提 | 4 |
| 优先级流控 | PFC | 按优先级独立暂停上游发送的链路层机制 | 4 |
| 显式拥塞通知 | ECN | 交换机在 IP 头标记拥塞，端到端软降速 | 4 |
| 拥塞通知包 | CNP | ECN 标记后接收端回给发送端的通知包 | 4 |
| 数据中心量化拥塞控制 | DCQCN | ECN 的端到端算法，RP/NP/CP 三角色 | 4 |
| 集合通信 | collective communication | 多对多的数据交换操作（AllReduce/AllGather 等） | 5 |
| 归约 | AllReduce | 所有 rank 的数据求和后分发回每个 rank | 5 |
| 全收集 | AllGather | 每个 rank 拿到所有 rank 的数据 | 5 |
| 归约-散播 | ReduceScatter | 每个 rank 拿到求和结果的 1/N 部分 | 5 |
| 广播 | Broadcast | 根 rank 的数据发送给所有 rank | 5 |
| 全交换 | AllToAll | 每个 rank 给其他每个 rank 各发一份数据 | 5 |
| 算法带宽 | algbw | size/time，算法视角吞吐 | 5 |
| 总线带宽 | busbw | algbw × 2(N-1)/N（AllReduce），与硬件峰值可比 | 5 |
| 环算法 | Ring algorithm | 带宽最优的 AllReduce，两阶段 N-1 步 | 5 |
| 流式多处理器 | SM (Streaming Multiprocessor) | GPU 的计算单元，util 指标统计的是 SM 活跃占比 | 6 |
| 显存利用率 | FB_USED | 已用显存（MB），DCGM 指标 | 6 |
| 双比特纠错 | Double Bit ECC | 不可纠正的显存错误，Xid 48 | 6 |
| 掉线 | fall off the bus | GPU 从 PCIe 总线消失，Xid 79 | 6 |
| 张量并行 | TP (Tensor Parallel) | 把模型权重切分到多卡并行计算 | 6 |
| KV 缓存 | KV cache | 注意力机制的 K/V 中间结果缓存，随 token 生成增长 | 7 |
| 分页注意力 | PagedAttention | 把 KV cache 切成 block 按需分配，消除显存碎片 | 7 |
| 连续批处理 | Continuous Batching | 请求完成即让位，GPU 保持满载的调度方式 | 7 |
| 静态批处理 | static batching | 攒满一批再处理，batch 内最慢请求拖累整批 | 7 |
| 首 token 延迟 | TTFT | 从发请求到收到第一个 token 的时间 | 7 |
| 单 token 延迟 | TPOT | 每生成一个 token 的耗时 | 7 |
| 成组调度 | Gang scheduling | 一整组资源同时可用才调度，避免半启动 hang | 8 |
| 公平分享 | Fair-share | 按历史用量比例分配资源 | 8 |
| 抢占 | Preemption | 高优先级 job 驱逐低优先级 job 以获取资源 | 8 |
| 放置组 | PodGroup | Volcano 的成组调度资源，声明 minMember | 8 |
| 集群队列 | ClusterQueue | Kueue 的资源配额队列 | 8 |
| 队列组 | cohort | Kueue 中共享配额池的 ClusterQueue 分组 | 8 |
| 名义配额 | nominalQuota | ClusterQueue 声明的基准配额 | 8 |
| 拉取 | scrape | Prometheus 主动从 exporter 采集指标 | 9 |
| 计数器 | Counter | 只增不减的指标，看速率用 rate/increase | 9 |
| 仪表 | Gauge | 可增可减的当前值指标 | 9 |
| 直方图 | Histogram | 分桶分布，用于算 p99 | 9 |
| 记录规则 | recording rule | 预聚合高频查询为新指标 | 9 |
| 待触发 | Pending | 告警条件满足但 for 计时中 | 9 |
| 触发中 | Firing | 告警条件持续满足 for 时长后正式报警 | 9 |
| 混沌工程 | chaos engineering | 受控环境主动注入故障以验证系统韧性 | 10 |
| 平均检测时间 | MTTD | 故障发生到被发现的时间，由监控质量决定 | 10 |
| 平均恢复时间 | MTTR | 故障被发现到恢复的时间，由预案与 runbook 决定 | 10 |
| 情境-任务-行动-结果 | STAR | 面试讲故事的 Situation/Task/Action/Result 结构 | 10 |

| 分层假设法 | layered hypothesis method | 先看监控归层、再用该层命令验证、逐层排除的排障方法 | 11 |
| 连锁故障 | cascading failure | 一个层的故障引发另一层症状（如网络拥塞→GPU 利用率下降） | 11 |
| 三段式作答 | three-part answer | 结论先行 + 原理支撑 + 量化示例的面试答题结构 | 12 |
| 对比框架 | comparison framework | 把方案放同一维度比较（性能/成本/复杂度）以应对"为什么不用 X" | 12 |
| 版本对齐 | version alignment | 全集群驱动/CUDA/NCCL 版本一致，避免跨节点不匹配故障 | 13 |
| 健康巡检 | health check | 定期自动检查驱动/链路/温度/ECC 等健康指标 | 13 |
| 幂等 | idempotent | 重复执行结果相同的操作特性，脚本可安全重跑 | 13 |
## 符号约定

| 符号 | 读法 | 含义与约定 | 首次出现章节 |
|---|---|---|---|
| $t$ | t | 时间 | 1 |
| $t_1, t_2$ | t 一、t 二 | 第 1/2 阶段耗时（本教材用下标区分不同阶段时间） | 1 |
| GB/s | 吉字节每秒 | 数据传输速率单位（本书统一用十进制 GB） | 1 |
| IOPS | 每秒输入输出次数 | 每秒 IO 操作数（随机读基准的常用指标） | 1 |
| $k$ | k | EC 中数据块数 | 2 |
| $m$ | m | EC 中校验块数 | 2 |
| $R$ | R | DCQCN 中发送端当前速率 | 4 |
| $\alpha$ | alpha | DCQCN 降速比例参数（第 4 章）；每步通信延迟（第 5 章） | 4 |
| $N$ | N | 集合通信的 rank（GPU）总数 | 5 |
| $T$ | T | Ring AllReduce 总时间（$T = 2(N-1)\alpha + 2(N-1)/N \cdot \text{size}/\beta$） | 5 |
| $\beta$ | beta | 链路带宽 | 5 |
