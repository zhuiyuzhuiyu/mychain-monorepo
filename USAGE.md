# 使用手册

## 启动项目

### 第一步：启动区块链节点

```bash
cd /Users/zyh/Desktop/zuoye/blockchain
node src/index.js
```

首次启动会输出创世账户信息，**务必复制保存**：

```
══════════════════════════════════════════════════════
  创世账户信息（请妥善保存！）
══════════════════════════════════════════════════════
  地址:   cosmos1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  助记词: word1 word2 word3 ... word12
══════════════════════════════════════════════════════
```

节点运行在 **http://localhost:3000**

### 第二步：启动区块链浏览器

```bash
# 新开一个终端
cd /Users/zyh/Desktop/zuoye/blockchain-explorer
npm run dev
```

浏览器打开 **http://localhost:5173**

---

## 完整操作流程

### 流程一：新建账户并获得代币

**步骤 1：创建账户**

在浏览器打开 http://localhost:5173/accounts，点击「生成新账户」。

或用 API：
```bash
curl -X POST http://localhost:3000/accounts
```

返回示例：
```json
{
  "address": "cosmos1d4ngthqaurxtv5pe7wppjahxxd9ne2sty7wquv",
  "mnemonic": "ripple clown cry small device ...",
  "publicKey": "038978608f...",
  "accountNumber": 1,
  "sequence": 0
}
```

> ⚠️ **助记词是你的私钥，必须保存！丢失助记词 = 永远无法动用账户资产**

**步骤 2：挖矿获得代币**

在浏览器打开 http://localhost:5173/miner，填入你的地址，点击「开始挖矿」。

或用 API：
```bash
curl -X POST http://localhost:3000/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "cosmos1你的地址"}'
```

返回示例：
```json
{
  "message": "挖矿成功",
  "block": { "height": 2, "hash": "000e1e...", "nonce": 3756 },
  "reward": "1000000 uatom",
  "minerBalance": { "uatom": "1000001000000" }
}
```

**步骤 3：查询余额**

```bash
curl http://localhost:3000/accounts/cosmos1你的地址
```

---

### 流程二：代币转账

**前提**：发送方账户有余额（先完成流程一）

**步骤 1：准备两个账户**
- 账户A（发送方）：已有余额
- 账户B（接收方）：先用流程一创建好

**步骤 2：提交转账交易**

在浏览器打开 http://localhost:5173/miner，切换到「代币转账」区域：

| 字段 | 填写内容 |
|------|---------|
| 发送方地址 | 账户A的 cosmos1... 地址 |
| 助记词 | 账户A的 12个单词助记词 |
| 接收方地址 | 账户B的 cosmos1... 地址 |
| 金额 | 例如 500000（单位是 uatom） |
| 备注 | 可选，随便填 |

或用 API：
```bash
curl -X POST http://localhost:3000/txs/sign \
  -H "Content-Type: application/json" \
  -d '{
    "from": "cosmos1发送方地址",
    "mnemonic": "发送方的十二个助记词单词",
    "to": "cosmos1接收方地址",
    "amount": "500000",
    "memo": "测试转账"
  }'
```

返回：
```json
{
  "txHash": "b4aadbe...",
  "status": "已加入内存池，等待打包"
}
```

**步骤 3：挖矿打包交易**

交易提交后在内存池中等待，需要挖一个块来打包：

```bash
curl -X POST http://localhost:3000/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "cosmos1矿工地址"}'
```

**步骤 4：验证到账**

```bash
curl http://localhost:3000/accounts/cosmos1接收方地址
```

在浏览器搜索接收方地址，查看「相关交易」和余额。

---

### 流程三：查询区块链数据

**查看最新区块**
```bash
curl http://localhost:3000/blocks/latest
```

**按高度查询区块**
```bash
curl http://localhost:3000/blocks/2
```

**查询某笔交易**
```bash
curl http://localhost:3000/txs/交易哈希
```

**浏览器搜索栏支持**：
- 输入数字 → 跳转对应高度的区块
- 输入 cosmos1... → 跳转账户详情
- 输入 64位哈希 → 跳转交易详情

---

## 代币单位说明

本链使用 **uatom**（micro ATOM）作为最小单位，类比以太坊的 wei：

| 单位 | 数量 |
|------|------|
| 1 uatom | 最小单位 |
| 1,000,000 uatom | 相当于 1 ATOM（概念上） |

创世总量：**1,000,000,000,000 uatom**（1 万亿）
每块奖励：**1,000,000 uatom**

---

## 关于钱包

### 为什么不能用 MetaMask？

MetaMask 只支持以太坊（EVM）生态，我们的链使用 Cosmos 架构：

| | 我们的链 | MetaMask 要求 |
|--|---------|--------------|
| 地址格式 | `cosmos1...`（Bech32） | `0x...`（Hex） |
| 签名算法 | secp256k1 ✓ | secp256k1 ✓ |
| API 格式 | REST | JSON-RPC（eth_xxx） |
| 交易格式 | 自定义 JSON | RLP 编码 |

### 用 Keplr 钱包连接（进阶）

Keplr 是 Cosmos 生态最主流的钱包（类比 MetaMask 之于以太坊）。

> 当前项目未集成 Keplr，以下是**如果要集成**的思路：

**第一步**：安装 Keplr 浏览器插件
- 官网：https://www.keplr.app/

**第二步**：在前端代码中注册自定义链

```typescript
// 在 blockchain-explorer/src 中新建 keplr.ts
await window.keplr.experimentalSuggestChain({
  chainId: "mychain-1",
  chainName: "MyChain",
  rpc: "http://localhost:26657",      // 需要实现 Tendermint RPC
  rest: "http://localhost:1317",      // 需要实现 Cosmos REST API
  bip44: { coinType: 118 },          // Cosmos 标准路径
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    // ...
  },
  currencies: [{ coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 }],
  feeCurrencies: [{ coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 }],
  stakeCurrency: { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 },
});
```

**第三步**：让用户用 Keplr 签名（替代现在的助记词输入）

```typescript
// 用 Keplr 签名，不需要用户输入助记词
const offlineSigner = window.keplr.getOfflineSigner("mychain-1");
const accounts = await offlineSigner.getAccounts();
// accounts[0].address 就是用户地址
```

**需要额外实现的接口**（当前项目没有）：
- Tendermint RPC（端口 26657）
- Cosmos REST API（端口 1317，`/cosmos/bank/v1beta1/balances/{address}` 等标准路径）

这两个接口是 Keplr 通信的标准，实现后 Keplr 就能自动连接。

### 现阶段的"钱包"就是助记词

当前项目里，**助记词 = 你的钱包**：
- 助记词存在哪里，钱包就在哪里
- 转账时粘贴助记词到表单，后端用它签名
- 不要把助记词给任何人

---

## 常见问题

**Q：节点重启后数据还在吗？**
A：在。所有数据保存在 `data/chain.json`，重启自动加载。

**Q：怎么重置链，从头开始？**
```bash
rm data/chain.json
node src/index.js   # 重新生成创世块
```

**Q：挖矿很慢怎么办？**
```bash
# 修改 .env 文件，降低难度
DIFFICULTY=2   # 默认是3，改小更快
```

**Q：转账失败，提示"余额不足"？**
- 确认发送方账户有余额（先挖矿充值）
- 转账金额 + 手续费（1000 uatom）不超过余额

**Q：转账提交成功但余额没变？**
- 交易在内存池里，还没打包
- 需要再执行一次挖矿，把交易打包进区块

**Q：sequence（序列号）错误怎么解决？**
- 查看账户当前序列号：`curl http://localhost:3000/accounts/你的地址`
- 如果之前有交易在内存池中失败，序列号可能不同步
- 重启节点会清空内存池（未打包交易丢失），序列号以链上为准

---

## API 接口速查

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/accounts` | 创建新账户 |
| GET | `/accounts/:address` | 查询账户余额 |
| GET | `/blocks` | 区块列表（最新20个） |
| GET | `/blocks/latest` | 最新区块 |
| GET | `/blocks/:height` | 指定高度区块 |
| GET | `/blocks/status` | 链状态（高度、哈希） |
| POST | `/txs/sign` | 签名并提交交易 |
| GET | `/txs/:hash` | 查询交易详情 |
| GET | `/txs/pending` | 内存池待确认交易 |
| POST | `/mine` | 触发挖矿 |
| GET | `/api/info` | 链基本信息 |
