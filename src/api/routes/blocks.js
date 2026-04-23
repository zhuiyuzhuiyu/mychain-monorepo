// 区块路由：链状态概览、最新区块、区块列表、按高度查询区块
const express = require('express');
const router = express.Router();
const { getBlocks, getLatestBlock, getBlock, getHeight } = require('../../core/blockchain');

// GET /blocks/status — 返回链当前高度和最新区块基本信息（用于监控链运行状态）
router.get('/status', (req, res) => {
  const latest = getLatestBlock();
  res.json({
    height: getHeight(),
    latestHash: latest ? latest.hash : null,       // 链为空时返回 null
    latestTime: latest ? latest.header.timestamp : null,
  });
});

// GET /blocks/latest — 返回最新区块完整信息（含区块头所有字段和交易列表）
router.get('/latest', (req, res) => {
  const block = getLatestBlock();
  if (!block) return res.status(404).json({ error: '暂无区块' });
  res.json(block);
});

// GET /blocks?limit=20 — 返回最近 limit 个区块摘要，按高度降序（最新的在最前）
router.get('/', (req, res) => {
  const blocks = getBlocks();
  const limit = parseInt(req.query.limit) || 20;
  // 取链尾 limit 条，reverse 使最新区块排在最前
  const recent = blocks.slice(-limit).reverse();
  // 只返回摘要字段，减少数据传输量
  const summary = recent.map(b => ({
    height: b.header.height,
    hash: b.hash,
    timestamp: b.header.timestamp,
    proposer: b.header.proposer,   // 矿工地址
    txCount: b.transactions.length,
    nonce: b.header.nonce,         // PoW 找到的随机数
  }));
  res.json({ total: blocks.length, blocks: summary });
});

// GET /blocks/:height — 按高度查询区块完整信息（含全部交易）
router.get('/:height', (req, res) => {
  const height = parseInt(req.params.height);
  // 高度必须是合法数字
  if (isNaN(height)) return res.status(400).json({ error: '高度必须为数字' });

  const block = getBlock(height);
  if (!block) return res.status(404).json({ error: `高度 ${height} 的区块不存在` });

  res.json(block);
});

module.exports = router;
