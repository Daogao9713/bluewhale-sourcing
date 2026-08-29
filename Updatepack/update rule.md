# Blue Whale 项目版本命名规则

本规则从 **V0.12** 起正式采用，用于 `bluewhale-sourcing` 后续官网、业务系统、AI、数据库与功能升级的统一编号。

---

## 1. 基本格式

版本号采用：

`V0.XX`

当前第二个正式升级版本为：

`V0.12`

在进入更成熟阶段后，可升级到 `V1.00`，但 V1 之前继续采用 `V0.XX`。

---

## 2. 偶数版本：前端 / 页面 / 信息架构升级

**末两位为偶数**时，代表以视觉与前端体验为主的升级。

例如：

- `V0.12`
- `V0.14`
- `V0.16`
- `V0.18`
- `V0.20`

归入偶数版本的内容包括：

- 官网首页视觉重构
- UI / UX 设计调整
- 品牌视觉与颜色系统
- 响应式布局改进
- 导航与页脚设计
- 新增二级页面
- 新增公司介绍、业务、技术、案例、联系等公开页面
- 信息架构调整
- 前端动效
- SEO 页面结构与页面 metadata 调整
- 不改变核心业务逻辑的前端组件重构

### 示例

`V0.12 - Company Website Frontend`

内容：

- 首页由采购站升级为公司官网
- 采购调整为二级业务页面
- 新增 About / Business / Technology / Contact
- 建立统一 Header / Footer / Design System

---

## 3. 奇数版本：功能 / AI / 后端 / 数据升级

**末两位为奇数**时，代表以功能与系统能力为主的升级。

例如：

- `V0.13`
- `V0.15`
- `V0.17`
- `V0.19`
- `V0.21`

归入奇数版本的内容包括：

- AI Agent / Copilot
- Tool Calling
- RAG / Embedding / 向量检索
- Supabase 数据结构
- 数据库 migration
- API
- 登录 / 权限
- CRM
- 自动化
- 邮件工作流
- 项目管理逻辑
- 报价与 RFQ 功能
- 文件管理
- 第三方服务接入
- 安全与权限升级
- 性能架构调整
- 内部 Sourcing OS 功能

### 示例

`V0.13 - Sourcing OS Agent Upgrade`

可能包含：

- AI 可以生成 RFQ Draft
- AI 可以读取项目与供应商
- 加入受控 write tools
- 加入长期记忆
- 新增供应商比较功能

---

## 4. 混合升级如何编号

如果一个版本同时包含前端和后端：

### 规则

按照**主要升级目标**确定奇偶。

如果升级主要是：

> “新增一个业务页面，并做少量 API 配合”

则使用偶数版本。

如果升级主要是：

> “新增 Agent 工具与数据能力，同时顺便增加一个操作按钮”

则使用奇数版本。

不要为了同时包含前后端而跳两个版本。

---

## 5. 推荐版本节奏

当前：

- `V0.10` / `V0.1`：早期基础版本
- `V0.12`：公司官网前端体系

建议后续：

- `V0.13`：AI / Sourcing OS 功能升级
- `V0.14`：官网视觉、案例与业务页面升级
- `V0.15`：CRM / 项目 / AI 工具升级
- `V0.16`：移动端、页面动效、品牌内容升级
- `V0.17`：数据库、供应商知识库与自动化升级
- `V0.18`：官网内容与国际化前端升级

---

## 6. Git 命名建议

### Branch

前端：

`frontend/v0.12-company-site`

功能：

`feature/v0.13-agent-tools`

### Commit

前端：

`feat(frontend): release company website v0.12`

功能：

`feat(agent): add sourcing tools v0.13`

### Tag

`v0.12`

`v0.13`

---

## 7. 版本说明文件

建议每个升级包至少保留：

- `VERSIONING.md`
- `INSTALL.md`
- `CHANGELOG.md`

其中：

`VERSIONING.md` = 永久规则  
`INSTALL.md` = 当前版本安装方式  
`CHANGELOG.md` = 当前版本改了什么  

---

## 8. 当前基准

**当前前端版本：V0.12**

名称：

**Blue Whale Company Website Frontend**

核心变化：

1. 官网从“采购服务落地页”升级为“公司官网”。
2. 采购业务降为二级页面 `/business/sourcing`。
3. 新增 About / Business / Technology / Contact。
4. 建立统一 Site Header / Footer。
5. 保留 `/inquiry` 现有询价流程。
6. 保留 `/workspace` Sourcing OS。
7. 后续公开页面可以继续独立扩展，而不必重写首页。


---

## V0.16 Release Record

**Version:** V0.16  
**Category:** Even / Frontend-led mixed upgrade  
**Name:** Global Website, News CMS & AI Concierge

V0.16 remains an even release because its primary goal is the public website and content experience, even though it adds supporting API and AI capabilities.

Major scope:

- full-site Chinese / Japanese / English switching
- company news stream on homepage
- public news index and detail pages
- internal company news CMS
- public AI website Concierge
- preserved internal Sourcing OS and sourcing-specific AI separation
