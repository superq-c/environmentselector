# DevEnv Launcher

开发环境启动器 —— 一站式管理项目配置、环境变量与启动工具，一键启动开发环境。

## 功能特性

- **启动面板** — 以卡片形式展示所有项目配置，按分组筛选，一键启动开发工具
- **项目分组** — 支持为项目配置自定义分组，启动面板可按分组过滤并记住上次选择
- **分组管理** — 独立的分组管理页面，支持新建、重命名、删除分组
- **环境管理** — 集中管理多套环境变量（Java、Node、Python、Go 等），支持添加到 PATH
- **工具管理** — 配置启动工具路径及可用参数（flag），支持危险参数标记
- **项目配置** — 将环境、工具、参数组合为项目配置，支持额外环境变量

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite |
| UI 组件 | Naive UI |
| 状态管理 | Pinia |
| 桌面框架 | Tauri 2 (Rust) |
| 数据存储 | JSON 文件 (`~/.devenv-launcher/config.json`) |

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式（同时启动 Vite + Tauri）
npm run tauri dev

# 构建生产包
npm run tauri build
```

## 项目结构

```
src/                          # 前端源码
  views/
    Dashboard.vue             # 启动面板（分组筛选 + 项目卡片）
    Profile.vue               # 项目配置管理
    Group.vue                 # 分组管理（新建/重命名/删除）
    Environment.vue           # 环境变量管理
    Tool.vue                  # 工具管理
  stores/                     # Pinia 状态管理
  types/                      # TypeScript 类型定义
  components/                 # 公共组件

src-tauri/                    # Rust 后端
  src/
    config/                   # 配置读写（JSON 文件）
    commands/                 # Tauri 命令（CRUD + 启动）
    process/                  # 启动逻辑（生成 .bat 并执行）
```
