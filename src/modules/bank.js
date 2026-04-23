// Bank 模块：代币余额管理，提供转账、铸币、销毁等操作（对应 Cosmos SDK bank 模块）
// 所有金额使用 BigInt 计算，避免 JavaScript 浮点数精度问题
const { getState, save } = require('../store/state');

// 查询指定地址的单一代币余额，不存在返回 '0'
function getBalance(address, denom) {
  const state = getState();
  if (!state.balances[address]) return '0';
  return String(state.balances[address][denom] || 0);
}

// 查询指定地址的所有代币余额，返回 { denom: amount } 对象
function getAllBalances(address) {
  const state = getState();
  return state.balances[address] || {};
}

// 在两个地址间转移代币（MsgSend 的底层实现）
function send(from, to, denom, amount) {
  const state = getState();
  const amt = BigInt(amount);
  // 金额必须为正数
  if (amt <= 0n) throw new Error('转账金额必须大于 0');

  // 用 BigInt 比对余额，防止大数溢出
  const fromBal = BigInt(state.balances[from]?.[denom] || 0);
  if (fromBal < amt) throw new Error(`余额不足: ${from} 有 ${fromBal} ${denom}, 需要 ${amt}`);

  // 确保接收方余额表已初始化
  if (!state.balances[from]) state.balances[from] = {};
  if (!state.balances[to]) state.balances[to] = {};

  // 扣减发送方，增加接收方（均用字符串存储，防止序列化精度丢失）
  state.balances[from][denom] = String(fromBal - amt);
  state.balances[to][denom] = String(BigInt(state.balances[to][denom] || 0) + amt);
}

// 铸造新代币：增加账户余额并增加全链总供应量（用于出块奖励和创世初始化）
function mint(toAddress, denom, amount) {
  const state = getState();
  const amt = BigInt(amount);

  // 确保目标账户余额表已初始化
  if (!state.balances[toAddress]) state.balances[toAddress] = {};
  // 增加账户余额
  state.balances[toAddress][denom] = String(BigInt(state.balances[toAddress][denom] || 0) + amt);
  // 同步增加全链代币总供应量
  state.supply[denom] = String(BigInt(state.supply[denom] || 0) + amt);
}

// 销毁代币：减少账户余额并减少全链总供应量（与 mint 相反）
function burn(fromAddress, denom, amount) {
  const state = getState();
  const amt = BigInt(amount);
  const bal = BigInt(state.balances[fromAddress]?.[denom] || 0);
  if (bal < amt) throw new Error('余额不足以销毁');

  // 减少账户余额
  state.balances[fromAddress][denom] = String(bal - amt);
  // 同步减少总供应量
  state.supply[denom] = String(BigInt(state.supply[denom] || 0) - amt);
}

// 查询某代币的全链总供应量
function getTotalSupply(denom) {
  const state = getState();
  return String(state.supply[denom] || 0);
}

module.exports = { getBalance, getAllBalances, send, mint, burn, getTotalSupply };
