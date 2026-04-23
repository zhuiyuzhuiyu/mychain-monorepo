// 地址工具：将 secp256k1 公钥转换为 Cosmos Bech32 地址，并提供地址校验
const crypto = require('crypto');
const { bech32 } = require('bech32');

// 公钥 → Cosmos 地址：SHA256 → RIPEMD160 → Bech32 编码
function pubKeyToAddress(publicKeyHex, prefix = 'cosmos') {
  const pubKeyBytes = Buffer.from(publicKeyHex, 'hex');
  // 第一步：对压缩公钥（33字节）做 SHA256
  const sha256Hash = crypto.createHash('sha256').update(pubKeyBytes).digest();
  // 第二步：对 SHA256 结果再做 RIPEMD160，得到 20 字节地址原文
  const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
  // 第三步：将 20 字节转换为 5-bit words，再用 Bech32 编码加前缀（cosmos1...）
  const words = bech32.toWords(ripemd160Hash);
  return bech32.encode(prefix, words);
}

// 校验地址格式是否合法（Bech32 可解码且前缀匹配）
function validateAddress(address, prefix = 'cosmos') {
  try {
    const decoded = bech32.decode(address);
    // 前缀必须与期望值一致，否则视为无效地址
    return decoded.prefix === prefix;
  } catch {
    // 解码失败说明格式非法
    return false;
  }
}

module.exports = { pubKeyToAddress, validateAddress };
