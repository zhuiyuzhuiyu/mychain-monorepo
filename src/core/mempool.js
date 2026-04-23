// 内存池：缓存已验证但尚未打包进区块的待确认交易
const { validateTx } = require('./transaction');

// 待确认交易队列，按提交顺序排列
const pending = [];
// 已见哈希集合，用于快速去重，防止同一笔交易被重复提交
const seen = new Set();

// 提交新交易到内存池：先去重，再验证，通过后入队
function addTx(tx) {
  // 去重检查：同一哈希的交易只接受一次
  if (seen.has(tx.hash)) throw new Error('交易已存在于内存池');
  // 完整验证：哈希完整性 + 签名 + sequence
  validateTx(tx);
  pending.push(tx);
  seen.add(tx.hash);
  return tx.hash;
}

// 清空内存池并返回所有交易（挖矿时调用，将交易打包进区块）
function flush() {
  const txs = [...pending];   // 复制一份返回给矿工
  pending.length = 0;          // 清空队列
  seen.clear();                // 清空去重集合，允许同地址下笔交易进入
  return txs;
}

// 查询当前内存池中所有待确认交易（只读，不清空）
function getPending() {
  return [...pending];  // 返回副本，防止外部直接修改内部队列
}

// 返回内存池中待确认交易数量
function size() {
  return pending.length;
}

module.exports = { addTx, flush, getPending, size };
