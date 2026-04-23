// 交易核心：创建、哈希、验证、执行 MsgSend 类型交易
const crypto = require('crypto');
const { sign, verify } = require('../crypto/keys');
const { validateSequence } = require('../modules/auth');
const { send } = require('../modules/bank');

// 计算交易哈希：对消息体和认证信息序列化后做 SHA256
// txHash 既是交易唯一标识，也是签名的原文
function hashTx(body, authInfo) {
  const canonical = JSON.stringify({ body, authInfo });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

// 构造并签名一笔交易，返回完整交易对象
function createTx({ from, to, amount, denom, memo = '', fee = '1000', privateKey, publicKey, sequence }) {
  // 消息体：描述这笔转账的所有业务信息
  const body = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',  // Cosmos SDK 消息类型标识
    from,
    to,
    amount: [{ denom, amount: String(amount) }],  // 金额用数组表示，支持多代币
    memo,
  };
  // 认证信息：sequence 防重放，fee 是手续费（当前固定 1000 uatom）
  const authInfo = {
    sequence,
    fee: { denom, amount: String(fee) },
  };

  // 对 body+authInfo 做哈希，作为签名原文
  const txHash = hashTx(body, authInfo);
  // 用发送方私钥签名，证明交易由私钥持有者发起
  const signature = sign(txHash, privateKey);

  return {
    hash: txHash,
    body,
    authInfo,
    signature,
    publicKey,  // 附带公钥，供验签时使用
    timestamp: new Date().toISOString(),
  };
}

// 验证交易合法性：哈希完整性 → 签名有效 → sequence 正确
function validateTx(tx) {
  const { body, authInfo, signature, publicKey } = tx;

  // 防篡改：重新计算哈希，与 tx.hash 比对
  const expectedHash = hashTx(body, authInfo);
  if (tx.hash !== expectedHash) throw new Error('交易哈希不匹配');

  // 验签：用公钥验证签名，确认私钥持有者确实发起了此交易
  if (!verify(tx.hash, signature, publicKey)) throw new Error('签名验证失败');

  // 防重放：sequence 必须等于发送方账户当前值
  validateSequence(body.from, authInfo.sequence);

  return true;
}

// 执行交易：根据消息类型调用对应模块（目前只支持 MsgSend）
function executeTx(tx) {
  const { body, authInfo } = tx;
  if (body.typeUrl === '/cosmos.bank.v1beta1.MsgSend') {
    // 取第一个币种执行转账（本系统只支持单代币）
    const [coin] = body.amount;
    send(body.from, body.to, coin.denom, coin.amount);
  } else {
    throw new Error(`不支持的消息类型: ${body.typeUrl}`);
  }
}

module.exports = { createTx, validateTx, executeTx, hashTx };
