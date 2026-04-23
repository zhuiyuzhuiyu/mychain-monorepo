// 全局状态管理：维护链上所有数据并提供持久化能力
const fs = require('fs');
const path = require('path');
const { hashData } = require('../crypto/keys');

// 持久化文件路径，默认存储在项目根目录的 data/ 下，可通过环境变量覆盖
const DATA_FILE = path.resolve(
  process.env.DATA_FILE || path.join(__dirname, '../../data/chain.json'),
);

// 内存中的全局状态对象，所有模块共享同一引用
const state = {
  accounts: {},  // 账户表：address → { publicKey, accountNumber, sequence }
  balances: {},  // 余额表：address → { denom → amount(字符串) }
  supply: {},    // 代币总供应量：denom → amount(字符串)
  blocks: [],    // 区块链：按高度顺序存储所有区块
  txIndex: {},   // 交易索引：txHash → { blockHeight, tx }，用于快速查询已确认交易
};

// 返回全局状态对象（所有写操作直接修改此引用）
function getState() {
  return state;
}

// 计算当前状态根哈希，写入区块头 stateRoot 字段（证明状态快照）
function getStateRoot() {
  // 只对账户、余额、供应量三个关键状态取哈希，不含区块本身
  const snapshot = {
    accounts: state.accounts,
    balances: state.balances,
    supply: state.supply,
  };
  return hashData(snapshot);
}

// 将当前状态持久化到 chain.json
function save() {
  const serializable = {
    accounts: state.accounts,
    balances: state.balances,
    supply: state.supply,
    blocks: state.blocks,
    txIndex: state.txIndex,
  };
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  // 格式化写入，方便人工查看调试
  fs.writeFileSync(DATA_FILE, JSON.stringify(serializable, null, 2));
}

// 从 chain.json 恢复状态，节点重启时调用
function load() {
  // 文件不存在说明是首次启动，需要初始化创世块
  if (!fs.existsSync(DATA_FILE)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // 逐字段合并到内存状态（不替换引用，保持模块间共享）
    Object.assign(state.accounts, data.accounts || {});
    Object.assign(state.balances, data.balances || {});
    Object.assign(state.supply, data.supply || {});
    state.blocks.push(...(data.blocks || []));
    Object.assign(state.txIndex, data.txIndex || {});
    return true;
  } catch {
    // JSON 解析失败时视为空链重新初始化
    return false;
  }
}

module.exports = { getState, getStateRoot, save, load };
