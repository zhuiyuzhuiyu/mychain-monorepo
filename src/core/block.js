// 区块核心：区块头哈希、交易根、区块模板构造、PoW 挖矿、区块验证
const crypto = require('crypto');

// 对区块头做 SHA256，得到区块哈希（PoW 目标就是让此哈希满足前导零要求）
function hashHeader(header) {
  return crypto.createHash('sha256').update(JSON.stringify(header)).digest('hex');
}

// 计算交易根：将所有交易哈希拼接后再做 SHA256（简化版 Merkle Root）
function txsRoot(txs) {
  // 空区块（如创世块）用全零哈希占位
  if (txs.length === 0) return '0'.repeat(64);
  // 拼接所有交易哈希后取 SHA256，确保任意交易被篡改都会导致根哈希变化
  const hashes = txs.map(tx => tx.hash).join('');
  return crypto.createHash('sha256').update(hashes).digest('hex');
}

// 构造待挖矿的区块模板（填写区块头所有字段，nonce 从 0 开始）
function createBlockTemplate({ height, previousHash, txs, proposer, stateRoot, chainId, difficulty }) {
  const header = {
    height,           // 区块高度，从 1 开始
    chainId,          // 链 ID，标识所属网络
    timestamp: new Date().toISOString(),  // 出块时间戳
    previousHash,     // 前驱区块哈希，创世块为 64 个 "0"
    transactionsRoot: txsRoot(txs),       // 交易根，承诺本块包含的所有交易
    stateRoot,        // 状态根，承诺出块前的全链状态快照
    proposer,         // 矿工地址，接收出块奖励
    difficulty,       // PoW 难度：哈希前导零个数
    nonce: 0,         // PoW 随机数，从 0 开始递增直到满足难度
  };
  return { header, transactions: txs };
}

// Proof of Work 挖矿：不断递增 nonce 直到哈希满足难度目标
function mineBlock(template, difficulty) {
  // 难度目标：哈希必须以 difficulty 个 "0" 开头
  const target = '0'.repeat(difficulty);
  // 复制区块头避免修改原模板
  const header = { ...template.header };

  while (true) {
    const hash = hashHeader(header);
    // 哈希满足前导零要求，挖矿成功
    if (hash.startsWith(target)) {
      return {
        header: { ...header },
        transactions: template.transactions,
        hash,  // 记录满足条件的最终哈希
      };
    }
    // 不满足则递增 nonce，下一轮哈希结果完全不同（雪崩效应）
    header.nonce += 1;
  }
}

// 验证区块合法性：PoW 目标 + 哈希一致 + 前驱关系 + 高度连续
function validateBlock(block, prevBlock, difficulty) {
  const target = '0'.repeat(difficulty);

  // 验证 PoW：哈希必须满足前导零要求
  if (!block.hash.startsWith(target)) throw new Error('PoW 验证失败');

  // 防篡改：重新计算区块头哈希，与 block.hash 比对
  const recomputedHash = hashHeader(block.header);
  if (recomputedHash !== block.hash) throw new Error('区块哈希不匹配');

  // 验证链接：previousHash 必须等于前驱区块的哈希
  if (prevBlock && block.header.previousHash !== prevBlock.hash) {
    throw new Error('previousHash 不匹配');
  }

  // 验证高度连续：新区块高度必须是前驱高度 +1
  if (prevBlock && block.header.height !== prevBlock.header.height + 1) {
    throw new Error('区块高度不连续');
  }

  return true;
}

module.exports = { createBlockTemplate, mineBlock, validateBlock, hashHeader };
