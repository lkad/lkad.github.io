---
layout: page
title: AI Infra 教材
icon: fas fa-book
order: 1
---

> 写给有 5–8 年 Linux / 存储 / 网络运维经验、想转 AI Infra（GPU 集群方向）的工程师。
> 主线：数据怎么走 → 算力怎么用 → 故障怎么办。

## 章节目录

| # | 章节 | 主题 |
|---|---|---|
| 0 | [序章]({{ '/posts/ai-infra-00-preface/' | relative_url }}) | 教材怎么用 + 全书主线 |
| 1 | [第 1 章 Linux 内核 IO 栈与 VFS]({{ '/posts/ai-infra-01-linux-io-vfs/' | relative_url }}) | 数据从磁盘到进程 |
| 2 | [第 2 章 分布式存储：Ceph 核心]({{ '/posts/ai-infra-02-ceph/' | relative_url }}) | CRUSH / PG / BlueStore |
| 3 | [第 3 章 存储选型]({{ '/posts/ai-infra-03-storage-choice/' | relative_url }}) | JuiceFS / 3FS / Lustre 怎么选 |
| 4 | [第 4 章 RDMA 与无损网络]({{ '/posts/ai-infra-04-rdma/' | relative_url }}) | IB / RoCE / PFC / ECN / DCQCN |
| 5 | [第 5 章 NCCL 与集合通信]({{ '/posts/ai-infra-05-nccl/' | relative_url }}) | AllReduce 数学与 hang 排查 |
| 6 | [第 6 章 GPU 硬件与 CUDA/DCGM]({{ '/posts/ai-infra-06-gpu-cuda-dcgm/' | relative_url }}) | 利用率上不去时怎么查 |
| 7 | [第 7 章 推理框架：vLLM 与 PagedAttention]({{ '/posts/ai-infra-07-vllm-pagedattention/' | relative_url }}) | KV cache 与连续批处理 |
| 8 | [第 8 章 调度与多租户]({{ '/posts/ai-infra-08-scheduler/' | relative_url }}) | Slurm / Volcano / Kueue |
| 9 | [第 9 章 可观测性与告警]({{ '/posts/ai-infra-09-observability/' | relative_url }}) | Prometheus / PromQL / 告警 |
| 10 | [第 10 章 故障演练与 STAR 叙事]({{ '/posts/ai-infra-10-chaos-star/' | relative_url }}) | 混沌工程 / 复盘 / 面试故事 |
| 11 | [第 11 章 综合实战：集群故障排查]({{ '/posts/ai-infra-11-troubleshooting/' | relative_url }}) | 把前面 10 章串起来 |
| 12 | [第 12 章 面试冲刺]({{ '/posts/ai-infra-12-interview/' | relative_url }}) | 高频题 + 答题框架 |
| 13 | [第 13 章 自动化运维与版本管理]({{ '/posts/ai-infra-13-automation/' | relative_url }}) | 健康巡检 + 驱动/CUDA/NCCL 对齐 |
| 附 | [术语与符号表]({{ '/posts/ai-infra-glossary/' | relative_url }}) | 全书术语、符号、缩写约定 |

## 怎么用

每章开头先看"本章学习目标"，学完用章末自检清单逐条确认。例题要照着算一遍，独立习题做完再翻。`/categories/ai-infra/` 里按分类聚合了所有章节。