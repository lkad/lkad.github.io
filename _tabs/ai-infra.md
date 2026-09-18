---
layout: page
title: AI Infra 教材
icon: fas fa-book
order: 1
---

> 这是一份面向 **有 5–8 年 Linux / 存储 / 网络运维背景、准备转型 AI Infra（GPU 集群方向）的工程师** 的系统性教材。  
> 主线：**数据怎么走 → 算力怎么用 → 故障怎么办**。每个结论都配数字、每个机制都配命令，所有判断都可被复算、可被复现。

## 全书主线

- **数据通路**（Ch1–Ch5）：IO 栈 → Ceph → 存储选型 → RDMA → NCCL
- **算力使用**（Ch6–Ch8）：GPU/CUDA → vLLM/PagedAttention → 调度（Slurm/Volcano/Kueue）
- **可靠运行**（Ch9–Ch10）：可观测性 → 故障演练与 STAR 叙事
- **综合与迁移**（Ch11–Ch13）：综合实战 → 面试冲刺 → 自动化运维

## 章节目录

| # | 章节 | 主题 |
|---|---|---|
| 0 | [序章]({{ '/posts/ai-infra-00-preface/' | relative_url }}) | 教材怎么用 + 全书主线 |
| 1 | [第 1 章 Linux 内核 IO 栈与 VFS]({{ '/posts/ai-infra-01-linux-io-vfs/' | relative_url }}) | 数据从磁盘到进程的底层心智 |
| 2 | [第 2 章 分布式存储：Ceph 核心]({{ '/posts/ai-infra-02-ceph/' | relative_url }}) | CRUSH / PG / BlueStore |
| 3 | [第 3 章 存储选型：JuiceFS / 3FS / Lustre]({{ '/posts/ai-infra-03-storage-choice/' | relative_url }}) | 用框架做选型 |
| 4 | [第 4 章 RDMA 与无损网络]({{ '/posts/ai-infra-04-rdma/' | relative_url }}) | IB / RoCE / PFC / ECN / DCQCN |
| 5 | [第 5 章 NCCL 与集合通信]({{ '/posts/ai-infra-05-nccl/' | relative_url }}) | AllReduce 数学与 hang 排查 |
| 6 | [第 6 章 GPU 硬件与 CUDA/DCGM]({{ '/posts/ai-infra-06-gpu-cuda-dcgm/' | relative_url }}) | 利用率之谜与 Xid 故障 |
| 7 | [第 7 章 推理框架：vLLM 与 PagedAttention]({{ '/posts/ai-infra-07-vllm-pagedattention/' | relative_url }}) | KV cache 与连续批处理 |
| 8 | [第 8 章 调度与多租户：Slurm / Volcano / Kueue]({{ '/posts/ai-infra-08-scheduler/' | relative_url }}) | Gang / Fair-share / Preemption |
| 9 | [第 9 章 可观测性与告警]({{ '/posts/ai-infra-09-observability/' | relative_url }}) | Prometheus / PromQL / 告警设计 |
| 10 | [第 10 章 故障演练与 STAR 叙事]({{ '/posts/ai-infra-10-chaos-star/' | relative_url }}) | 混沌工程 / 复盘 / 面试叙事 |
| 11 | [第 11 章 综合实战：集群故障排查演练]({{ '/posts/ai-infra-11-troubleshooting/' | relative_url }}) | 分层假设法把全书串成排障流程 |
| 12 | [第 12 章 面试冲刺：高频题与答题框架]({{ '/posts/ai-infra-12-interview/' | relative_url }}) | 三段式 + 对比框架 |
| 13 | [第 13 章 自动化运维与版本管理]({{ '/posts/ai-infra-13-automation/' | relative_url }}) | 健康巡检 + 驱动/CUDA/NCCL 版本对齐 |
| 附 | [术语与符号表]({{ '/posts/ai-infra-glossary/' | relative_url }}) | 全书术语、符号、缩写约定 |

## 学习建议

1. **每章先看"本章学习目标"**，学完用章末自检清单确认。
2. **示范例题要跟着算一遍**：每题都有完整推导和验证代码。
3. **独立习题做完再翻参考答案**：参考答案与所有计算过程留作自检。
4. **最后一章是综合检验**：用真实（或高度仿真的）案例把全书串成排障闭环。

---

> 📌 配套归档：所有章节位于 [`/categories/ai-infra/`](/categories/ai-infra/)。