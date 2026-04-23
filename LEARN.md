# 区块链代码学习路线

## 前置知识检查

在开始之前，确认你已经了解：
- JavaScript / Node.js 基础
- HTTP / REST API 基本概念
- 命令行基本操作

不需要提前了解密码学，边学边查即可。

---

## 第一阶段：理解区块链是什么（1-2天）

### 1.1 先跑起来，看看效果

```bash
# 终端 1：启动区块链节点
cd /Users/zyh/Desktop/zuoye/blockchain
node src/index.js

# 终端 2：启动浏览器
cd /Users/zyh/Desktop/zuoye/blockchain-explorer
npm run dev
```

打开 http://localhost:5173 看看界面，点击各个页面感受一下。

### 1.2 用 curl 手动操作，建立直觉

```bash
# 创建一个账户
curl -X POST http://localhost:3000/accounts

# 挖一个块（替换为上面拿到的地址）
curl -X POST http://localhost:3000/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress": "cosmos1你的地址"}'

# 查看区块
curl http://localhost:3000/blocks/latest
```

**目标**：搞清楚"我创建了账户 → 挖矿 → 账户有了余额"这个流程。

---

## 第二阶段：读核心代码（1周）

### 按这个顺序读，不要跳

#### 第1天：密码学基础
**文件**：`src/crypto/keys.js` + `src/crypto/address.js`

重点理解：
- `generateKeyPair()` — 一个账户是怎么生成的
- 助记词 → 私钥 → 公钥 的推导过程（BIP39/BIP32标准）
- `pubKeyToAddress()` — 公钥为什么能变成地址（SHA256 → RIPEMD160 → Bech32）
- `sign()` / `verify()` — 签名和验证是什么意思

**关键问题**：为什么知道公钥推不出私钥？（椭圆曲线单向函数）

```js
// 读这段，理解每一步在做什么
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = bip32.fromSeed(seed);
const child = root.derivePath("m/44'/118'/0'/0/0");
```

#### 第2天：状态存储
**文件**：`src/store/state.js`

重点理解：
- 区块链的"状态"是什么（账户余额、序列号）
- 为什么用 JSON 文件存储（简化版，生产用 LevelDB）
- `getStateRoot()` — 状态根哈希的作用

#### 第3天：账户和代币模块
**文件**：`src/modules/auth.js` + `src/modules/bank.js`

重点理解：
- `sequence`（序列号）为什么能防止重放攻击
- `BigInt` 为什么要用大整数处理余额（浮点数精度问题）
- `mint()` 增发 vs `send()` 转账的区别

**动手实验**：
```bash
# 创建两个账户，记录地址
# 挖矿给账户A充值
# 转账从A到B
# 查询B的余额，验证到账
```

#### 第4天：交易结构
**文件**：`src/core/transaction.js`

重点理解：
- 一笔交易包含哪些字段（body, authInfo, signature）
- `hashTx()` — 为什么要哈希交易内容再签名
- `validateTx()` — 节点收到交易后做哪些验证
- `typeUrl: "/cosmos.bank.v1beta1.MsgSend"` — 这是 Cosmos 的消息路由格式

**对照 Cosmos 文档**：https://docs.cosmos.network/main/build/building-modules/msg-services

#### 第5天：区块结构和挖矿
**文件**：`src/core/block.js` + `src/modules/miner.js`

重点理解：
```js
// PoW 核心逻辑，读懂这个循环
while (true) {
  const hash = hashHeader(header);
  if (hash.startsWith(target)) {   // 找到满足条件的哈希
    return { header, transactions, hash };
  }
  header.nonce += 1;               // 不断尝试不同的 nonce
}
```

- 难度（difficulty）和前导零的关系
- 为什么改变 nonce 就能改变哈希值
- 区块为什么要包含 previousHash（链式结构）

**动手实验**：修改 `.env` 中的 `DIFFICULTY=1`，挖矿变快；改成 `DIFFICULTY=5`，挖矿变慢。

#### 第6天：链管理
**文件**：`src/core/blockchain.js`

重点理解：
- `addBlock()` 做了哪些事（验证 → 执行交易 → 铸造奖励 → 持久化）
- 创世块（genesis block）的特殊性
- `txIndex` 为什么要建索引（加快查询）

#### 第7天：API 层
**文件**：`src/api/routes/` 下的所有文件

这一层比较简单，重点看请求验证和错误处理的写法。

---

## 第三阶段：对比真实的 Cosmos SDK（3-5天）

### 我们的简化版 vs 真实 Cosmos 的对比

| 概念 | 本项目 | 真实 Cosmos |
|------|--------|------------|
| 共识算法 | PoW（工作量证明） | CometBFT（拜占庭容错） |
| 序列化 | JSON | Protobuf |
| 存储 | JSON 文件 | IAVL 树 + LevelDB |
| 验证者 | 单矿工 | 多验证者投票 |
| 跨链 | 无 | IBC 协议 |
| 智能合约 | 无 | CosmWasm |
| 地址格式 | cosmos1... | 任意前缀（atom1, osmo1...） |

### 读 Cosmos 官方文档的顺序

1. [Cosmos 基础概念](https://docs.cosmos.network/main/learn/intro/overview) — 对照我们的代码理解
2. [x/bank 模块](https://docs.cosmos.network/main/build/modules/bank) — 对比 `src/modules/bank.js`
3. [x/auth 模块](https://docs.cosmos.network/main/build/modules/auth) — 对比 `src/modules/auth.js`
4. [交易结构](https://docs.cosmos.network/main/learn/advanced/transactions) — 对比 `src/core/transaction.js`

---

## 第四阶段：动手改造（持续）

### 建议的练习项目（由易到难）

**初级**
- [ ] 给转账加收手续费（修改 `bank.js` 的 `send()`，从发送方扣除 fee）
- [ ] 限制每个块最多包含 10 笔交易（修改 `miner.js`）
- [ ] 给区块添加"叔块"字段（仅记录，不处理）

**中级**
- [ ] 实现多种代币（现在只有 uatom，新增 ustake）
- [ ] 添加账户冻结功能（auth 模块新增 frozen 状态）
- [ ] 实现简单的质押（staking）：锁定代币赚取利息

**高级**
- [ ] 把 JSON 存储换成 LevelDB（`npm install level`）
- [ ] 实现 Merkle 树（真正的 transactionsRoot 而不是哈希串联）
- [ ] 多节点组网（两个节点互相同步区块）

---

## 关键概念速查

### 为什么要有序列号（sequence）？
```
没有序列号的问题：
  Alice 签名了一笔"转给Bob 100"的交易
  攻击者把这笔交易复制，重复广播10次
  Alice 莫名其妙转出了 1000

有序列号之后：
  第一笔用 sequence=0，执行后变成1
  再广播同一笔交易：sequence=0，但链上已经是1，拒绝！
```

### 为什么哈希不可逆？
```
SHA256("hello") = 2cf24dba...  ← 正向很快
已知 2cf24dba... 推出 "hello"  ← 数学上不可行
这就是"单向函数"的含义
```

### PoW 为什么能防止伪造区块？
```
要伪造一个有效区块，必须找到满足难度的 nonce
难度=3 时，需要平均尝试 16^3 = 4096 次哈希
难度=6 时，需要平均尝试 16^6 = 16,777,216 次
计算消耗大量时间和电力，所以攻击成本极高
```

---

## 推荐资源

| 资源 | 用途 |
|------|------|
| [Bitcoin 白皮书](https://bitcoin.org/bitcoin.pdf) | 理解区块链原始设计 |
| [Cosmos 文档](https://docs.cosmos.network) | 对照我们代码的真实实现 |
| [以太坊黄皮书简介](https://ethereum.org/developers/docs) | 了解 EVM 生态 |
| [密码学入门（中文）](https://cryptobook.nakov.com) | 补充密码学基础 |
| [BIP39 标准](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) | 助记词原理 |
