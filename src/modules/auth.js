// 账户模块：账户创建、查询、sequence 管理（对应 Cosmos SDK auth 模块）
const { getState, save } = require('../store/state');
const { pubKeyToAddress } = require('../crypto/address');

// 根据公钥创建新账户，若已存在则直接返回现有账户
function createAccount(publicKeyHex) {
  const state = getState();
  // 从公钥派生 Bech32 地址（cosmos1...）
  const address = pubKeyToAddress(publicKeyHex);

  // 幂等：同一公钥重复调用不会创建重复账户
  if (state.accounts[address]) {
    return { address, ...state.accounts[address] };
  }

  // accountNumber 按当前账户总数自增，全链唯一
  const accountNumber = Object.keys(state.accounts).length;
  state.accounts[address] = {
    publicKey: publicKeyHex,
    accountNumber,
    sequence: 0,  // 新账户从 0 开始，每笔已确认交易后 +1
  };

  // 立即持久化，防止重启后丢失
  save();
  return { address, ...state.accounts[address] };
}

// 按地址查询账户，不存在返回 null
function getAccount(address) {
  const state = getState();
  if (!state.accounts[address]) return null;
  return { address, ...state.accounts[address] };
}

// 交易确认后递增发送方 sequence，防止同一笔交易被重复广播
function incrementSequence(address) {
  const state = getState();
  if (!state.accounts[address]) throw new Error(`账户不存在: ${address}`);
  state.accounts[address].sequence += 1;
}

// 校验交易中的 sequence 是否与账户当前值一致（防重放攻击）
function validateSequence(address, sequence) {
  const account = getAccount(address);
  if (!account) throw new Error(`账户不存在: ${address}`);
  // sequence 必须严格等于账户当前值，过大或过小都拒绝
  if (account.sequence !== sequence) {
    throw new Error(`序列号不匹配: 期望 ${account.sequence}, 收到 ${sequence}`);
  }
}

module.exports = { createAccount, getAccount, incrementSequence, validateSequence };
