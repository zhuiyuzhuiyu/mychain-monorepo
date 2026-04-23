// 区块链主逻辑：区块增删查、交易执行、出块奖励、创世初始化
require('dotenv').config();
const { getState, getStateRoot, save } = require('../store/state');
const { validateBlock } = require('./block');
const { executeTx } = require('./transaction');
const { incrementSequence } = require('../modules/auth');
const { mint } = require('../modules/bank');

// 从环境变量读取链配置
const CHAIN_ID = process.env.CHAIN_ID || 'mychain-1';
const DENOM = process.env.DENOM || 'uatom';
const BLOCK_REWARD = process.env.BLOCK_REWARD || '1000000';  // 每块奖励 1,000,000 uatom
const DIFFICULTY = parseInt(process.env.DIFFICULTY || '3');  // PoW 前导零个数

// 返回所有区块（按高度升序）
function getBlocks() {
  return getState().blocks;
}

// 返回最新区块（链尾），链为空时返回 null
function getLatestBlock() {
  const blocks = getBlocks();
  return blocks.length > 0 ? blocks[blocks.length - 1] : null;
}

// 按高度查找区块，不存在返回 null
function getBlock(height) {
  return getBlocks().find(b => b.header.height === height) || null;
}

// 返回当前链高度（最新区块高度），链为空时返回 0
function getHeight() {
  const latest = getLatestBlock();
  return latest ? latest.header.height : 0;
}

// 将已挖出的区块加入链：验证 → 执行交易 → 铸造奖励 → 持久化
function addBlock(block) {
  const state = getState();
  const prevBlock = getLatestBlock();
  // 校验区块合法性（PoW、哈希、前驱、高度）
  validateBlock(block, prevBlock, DIFFICULTY);

  // 逐笔执行区块内的交易
  for (const tx of block.transactions) {
    executeTx(tx);                                        // 调用 bank.send 完成资金转移
    incrementSequence(tx.body.from);                      // 发送方 sequence+1，防重放
    state.txIndex[tx.hash] = { blockHeight: block.header.height, tx };  // 写入交易索引
  }

  // 向矿工铸造出块奖励（新增代币，增加总供应量）
  mint(block.header.proposer, DENOM, BLOCK_REWARD);

  // 追加区块并持久化
  state.blocks.push(block);
  save();
  return block;
}

// 初始化创世块（仅在链为空时调用一次）
function initGenesis(genesisAddress) {
  const state = getState();
  // 幂等保护：已有区块时不重复初始化
  if (state.blocks.length > 0) return null;

  // 向创世地址铸造初始代币
  const genesisSupply = process.env.GENESIS_SUPPLY || '1000000000000';
  mint(genesisAddress, DENOM, genesisSupply);

  // 创世块无需 PoW，哈希和 previousHash 均为全零占位
  const genesisBlock = {
    header: {
      height: 1,
      chainId: CHAIN_ID,
      timestamp: new Date().toISOString(),
      previousHash: '0'.repeat(64),        // 无前驱，用全零表示
      transactionsRoot: '0'.repeat(64),    // 创世块无交易
      stateRoot: getStateRoot(),           // 记录创世状态快照
      proposer: genesisAddress,
      difficulty: DIFFICULTY,
      nonce: 0,
    },
    transactions: [],
    hash: '0'.repeat(64),  // 创世块哈希固定为全零
  };

  state.blocks.push(genesisBlock);
  save();
  console.log(`[链] 创世块已初始化，创世地址: ${genesisAddress}`);
  console.log(`[链] 创世代币: ${genesisSupply} ${DENOM}`);
  return genesisBlock;
}

// 按交易哈希查询已确认交易，返回 { blockHeight, tx } 或 null
function getTxByHash(hash) {
  return getState().txIndex[hash] || null;
}

module.exports = { addBlock, getBlock, getLatestBlock, getHeight, getBlocks, initGenesis, getTxByHash };
