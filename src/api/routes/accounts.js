// 账户路由：创建账户、查询账户信息与余额、查询代币总供应量
const express = require('express');
const router = express.Router();
const { generateKeyPair } = require('../../crypto/keys');
const { createAccount, getAccount } = require('../../modules/auth');
const { getAllBalances, getTotalSupply } = require('../../modules/bank');

// POST /accounts — 服务端生成密钥对，创建新账户并返回助记词
router.post('/', (req, res) => {
  try {
    // 生成 BIP39 助记词 + BIP32 HD 派生密钥对
    const keyPair = generateKeyPair();
    // 将公钥写入链上账户状态，分配 accountNumber 和初始 sequence=0
    const account = createAccount(keyPair.publicKey);
    res.json({
      address: account.address,
      mnemonic: keyPair.mnemonic,      // 只返回一次，客户端必须立即保存
      publicKey: keyPair.publicKey,
      accountNumber: account.accountNumber,
      sequence: account.sequence,
      warning: '请妥善保存助记词，不要泄露私钥！',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /accounts/:address — 查询账户信息（accountNumber、sequence、公钥）和所有代币余额
router.get('/:address', (req, res) => {
  try {
    const account = getAccount(req.params.address);
    // 地址不存在时返回 404
    if (!account) return res.status(404).json({ error: '账户不存在' });

    // 将余额对象 { denom: amount } 转换为数组格式 [{ denom, amount }]
    const balances = getAllBalances(req.params.address);
    const formattedBalances = Object.entries(balances).map(([denom, amount]) => ({ denom, amount }));

    res.json({
      address: account.address,
      accountNumber: account.accountNumber,
      sequence: account.sequence,   // 下一笔交易需使用此值，防重放
      publicKey: account.publicKey,
      balances: formattedBalances,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /accounts/supply/:denom — 查询指定代币的全链总供应量
router.get('/supply/:denom', (req, res) => {
  try {
    // 从全局供应量表读取，创世铸币和每次出块奖励都会增加此值
    const supply = getTotalSupply(req.params.denom);
    res.json({ denom: req.params.denom, totalSupply: supply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
