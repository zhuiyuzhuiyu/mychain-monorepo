// 矿工模块：协调内存池、区块构造、PoW 挖矿、上链的完整出块流程
require('dotenv').config();
const { flush } = require('../core/mempool');
const { createBlockTemplate, mineBlock } = require('../core/block');
const { addBlock, getLatestBlock, getHeight } = require('../core/blockchain');
const { getStateRoot } = require('../store/state');

const CHAIN_ID = process.env.CHAIN_ID || 'mychain-1';
const DIFFICULTY = parseInt(process.env.DIFFICULTY || '3');

// 执行一次完整的挖矿：取出内存池交易 → 构造模板 → PoW → 上链
function mine(minerAddress) {
  // 第一步：清空内存池，取出所有待确认交易（挖矿后内存池变为空）
  const txs = flush();
  // 第二步：获取前驱区块信息，用于构造区块头
  const prevBlock = getLatestBlock();
  const prevHash = prevBlock ? prevBlock.hash : '0'.repeat(64);  // 若无前驱（不应发生），用全零
  const height = getHeight() + 1;  // 新区块高度 = 当前最高 + 1

  console.log(`[矿工] 开始挖矿: 高度=${height}, 交易数=${txs.length}, 矿工=${minerAddress}`);
  const startTime = Date.now();

  // 第三步：构造区块模板，填写所有区块头字段（nonce 从 0 开始）
  const template = createBlockTemplate({
    height,
    previousHash: prevHash,
    txs,
    proposer: minerAddress,
    stateRoot: getStateRoot(),   // 记录当前状态根（出块前快照）
    chainId: CHAIN_ID,
    difficulty: DIFFICULTY,
  });

  // 第四步：执行 Proof of Work，不断递增 nonce 直到哈希满足前导零要求
  const block = mineBlock(template, DIFFICULTY);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[矿工] 挖矿成功: 高度=${height}, 哈希=${block.hash.slice(0, 16)}..., 耗时=${elapsed}s, nonce=${block.header.nonce}`);

  // 第五步：验证并将区块加入链，执行交易、递增 sequence、铸造出块奖励
  addBlock(block);
  return block;
}

module.exports = { mine };
