# MyChain Monorepo

一个用于演示 Cosmos 风格区块链基础能力的单仓库项目，包含：

- Node.js 区块链节点与 REST API
- `explorer` 区块浏览器
- `wallet-app` 网页钱包
- `wallet-extension` 浏览器扩展钱包源码

## Project Structure

```text
.
├── src/                # 区块链节点与 API
├── data/               # 本地链状态持久化目录（运行时生成，不提交）
├── explorer/           # React + Vite 区块浏览器
├── wallet-app/         # React + Vite 网页钱包
├── wallet-extension/   # 浏览器扩展钱包源码
├── LEARN.md            # 学习记录
└── USAGE.md            # 功能使用说明
```

## Apps

### 1. Node.js Blockchain Node

- 入口：`src/index.js`
- 默认端口：`3000`
- 提供账户、区块、交易、挖矿和链信息接口
- Swagger 文档地址：`/api-docs`

### 2. Explorer

- 路径：`explorer/`
- 用于浏览区块、交易、地址和链状态
- 开发时通过 Vite 代理访问后端节点
- 生产环境可通过 `VITE_NODE_URL` 显式指定后端地址，或与后端挂到同域反向代理

### 3. Wallet App

- 路径：`wallet-app/`
- 用于查看账户与余额、发起转账
- 开发时通过 Vite 代理访问后端节点
- 生产环境可通过 `VITE_NODE_URL` 显式指定后端地址，或与后端挂到同域反向代理

### 4. Wallet Extension

- 路径：`wallet-extension/`
- 作为浏览器扩展源码发布，不属于服务器部署内容
- 默认节点地址仍回退到 `http://localhost:3000`
- 如需连接线上节点，需要在扩展设置页配置节点地址，或后续调整默认值与 `manifest.json` 的匹配域名

## Environment Variables

根目录节点服务使用：

```bash
PORT=3000
CHAIN_ID=mychain-1
DENOM=uatom
BLOCK_REWARD=1000000
DIFFICULTY=3
GENESIS_SUPPLY=1000000000000
DATA_FILE=./data/chain.json
```

前端可选变量：

```bash
VITE_NODE_URL=https://your-node.example.com
```

- 如果未设置 `VITE_NODE_URL`：
  - `explorer` 和 `wallet-app` 开发环境会通过 Vite 代理访问本地节点
  - 生产环境默认请求同源路径

## Local Development

### Install dependencies

```bash
npm install
cd explorer && npm install
cd ../wallet-app && npm install
cd ../wallet-extension && npm install
```

### Start the blockchain node

```bash
npm run dev
```

节点默认运行在 `http://localhost:3000`。

### Start the explorer

```bash
cd explorer
npm run dev
```

默认地址：`http://localhost:5173`

### Start the wallet app

```bash
cd wallet-app
npm run dev
```

默认地址：`http://localhost:5174`

### Build the browser extension

```bash
cd wallet-extension
npm run build
```

构建产物位于 `wallet-extension/dist/`，目录本身不会提交到 GitHub。

## Deployment Notes

- 真正需要部署到服务器/托管平台的是：
  - 区块链节点服务
  - `explorer`
  - `wallet-app`
- `wallet-extension` 只作为源码仓库内容保留，不部署到服务器
- `data/chain.json` 是运行时数据，不提交到仓库；部署时应改为服务器持久化目录或挂载卷
- `.env` 不提交到仓库，服务器环境变量单独配置
