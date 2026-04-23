// 交易路由：服务端签名提交、客户端原始交易提交、内存池查询、交易详情查询
const express = require('express');
const router = express.Router();
const { addTx, getPending } = require('../../core/mempool');
const { getTxByHash } = require('../../core/blockchain');
const { createTx } = require('../../core/transaction');
const { keyPairFromMnemonic } = require('../../crypto/keys');
const { pubKeyToAddress } = require('../../crypto/address');
const { getAccount } = require('../../modules/auth');

// POST /txs/sign — 服务端用助记词签名并提交（适用于 Web App / 插件钱包场景）
router.post('/sign', async (req, res) => {
  try {
    const { from, mnemonic, to, amount, memo = '' } = req.body;
    // 校验必填字段
    if (!from || !mnemonic || !to || !amount) {
      return res.status(400).json({ error: '缺少必填字段: from, mnemonic, to, amount' });
    }

    // 从助记词推导密钥对，验证 from 地址与助记词匹配（防止用他人助记词伪造发送方）
    const keys = keyPairFromMnemonic(mnemonic);
    const derivedAddress = pubKeyToAddress(keys.publicKey);
    if (derivedAddress !== from) {
      return res.status(400).json({ error: `助记词与地址不匹配: 期望 ${from}, 推导出 ${derivedAddress}` });
    }

    // 获取发送方当前 sequence，用于交易签名和防重放校验
    const account = getAccount(from);
    if (!account) return res.status(404).json({ error: '发送方账户不存在' });
    const denom = process.env.DENOM || 'uatom';
    // 构造并签名交易（私钥在服务端临时使用，不落盘）
    const tx = createTx({
      from,
      to,
      amount,
      denom,
      memo,
      fee: '1000',
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      sequence: account.sequence,
    });

    // 验证后写入内存池，等待矿工打包
    const hash = addTx(tx);
    res.json({ txHash: hash, status: '已加入内存池，等待打包', tx });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /txs — 提交客户端已完成签名的原始交易（适用于插件钱包本地签名场景）
router.post('/', (req, res) => {
  try {
    const tx = req.body;
    // 校验交易对象结构完整性
    if (!tx || !tx.hash || !tx.body || !tx.authInfo || !tx.signature || !tx.publicKey) {
      return res.status(400).json({ error: '交易格式不正确' });
    }
    // addTx 内部会做完整的哈希、签名、sequence 验证
    const hash = addTx(tx);
    res.json({ txHash: hash, status: '已加入内存池，等待打包' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /txs/pending — 查询内存池中所有待确认交易
router.get('/pending', (req, res) => {
  res.json({ pending: getPending() });
});

// GET /txs/:hash — 按哈希查询交易：先查已确认索引，再查内存池
router.get('/:hash', (req, res) => {
  // 第一优先：从链上 txIndex 查已确认交易
  const result = getTxByHash(req.params.hash);
  if (!result) {
    // 第二优先：从内存池查待确认交易
    const pending = getPending().find(tx => tx.hash === req.params.hash);
    if (pending) return res.json({ tx: pending, status: '待确认（内存池中）' });
    // 均未找到：交易不存在
    return res.status(404).json({ error: '交易不存在' });
  }
  // 已确认时返回所在区块高度
  res.json({ tx: result.tx, blockHeight: result.blockHeight, status: '已确认' });
});

module.exports = router;
