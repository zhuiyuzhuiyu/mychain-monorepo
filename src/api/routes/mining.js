// 挖矿路由：触发 PoW 挖矿，打包内存池交易，矿工获得出块奖励
const express = require('express');
const router = express.Router();
const { mine } = require('../../modules/miner');
const { getAccount } = require('../../modules/auth');
const { getAllBalances } = require('../../modules/bank');

// POST /mine — 触发一次挖矿，将内存池所有交易打包进新区块
router.post('/', (req, res) => {
  try {
    const { minerAddress } = req.body;
    // 矿工地址为必填，奖励将铸造到此地址
    if (!minerAddress) return res.status(400).json({ error: '需要提供 minerAddress' });

    // 矿工账户必须已通过 POST /accounts 创建，否则无法接收奖励
    const account = getAccount(minerAddress);
    if (!account) return res.status(404).json({ error: '矿工账户不存在，请先创建账户' });

    // 执行完整挖矿流程：取交易 → 构造模板 → PoW → 验证上链 → 铸造奖励
    const block = mine(minerAddress);
    const reward = process.env.BLOCK_REWARD || '1000000';  // 出块奖励数量
    const denom = process.env.DENOM || 'uatom';             // 代币单位
    // 返回挖矿后的矿工最新余额（已包含本次奖励）
    const balances = getAllBalances(minerAddress);

    res.json({
      message: '挖矿成功',
      block: {
        height: block.header.height,
        hash: block.hash,
        timestamp: block.header.timestamp,
        nonce: block.header.nonce,              // PoW 找到的随机数
        txCount: block.transactions.length,     // 本块打包的交易数量
        proposer: block.header.proposer,
      },
      reward: `${reward} ${denom}`,
      minerBalance: balances,  // 格式：{ uatom: '6000000' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
