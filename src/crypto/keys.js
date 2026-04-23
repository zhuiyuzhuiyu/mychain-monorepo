// 密码学工具：BIP39 助记词生成、BIP32 HD 密钥派生、secp256k1 签名与验签
const crypto = require('crypto');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

// 用 tiny-secp256k1 初始化 BIP32 工厂，支持 secp256k1 曲线
const bip32 = BIP32Factory(ecc);

// 生成全新密钥对：随机助记词 → 种子 → HD 派生 → secp256k1 密钥对
function generateKeyPair() {
  // 生成 12 个英文助记词（128 位熵）
  const mnemonic = bip39.generateMnemonic();
  // 将助记词转换为 512 位二进制种子
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  // 从种子创建 HD 根密钥
  const root = bip32.fromSeed(seed);
  // 按 Cosmos 标准路径派生子密钥：m/44'/118'/0'/0/0
  const child = root.derivePath("m/44'/118'/0'/0/0");

  const privateKey = child.privateKey;  // 32 字节私钥
  const publicKey = child.publicKey;    // 33 字节压缩公钥

  return {
    mnemonic,
    privateKey: privateKey.toString('hex'),
    publicKey: publicKey.toString('hex'),
  };
}

// 从已有助记词恢复密钥对（用于交易签名）
function keyPairFromMnemonic(mnemonic) {
  // 同 generateKeyPair 相同的派生路径，保证同一助记词得到同一密钥
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed);
  const child = root.derivePath("m/44'/118'/0'/0/0");
  return {
    privateKey: child.privateKey.toString('hex'),
    publicKey: child.publicKey.toString('hex'),
  };
}

// 对数据做 secp256k1 签名：先 SHA256 再签名
function sign(dataHex, privateKeyHex) {
  // 对十六进制数据做 SHA256，得到 32 字节摘要
  const hash = crypto.createHash('sha256').update(Buffer.from(dataHex, 'hex')).digest();
  const privKey = Buffer.from(privateKeyHex, 'hex');
  // 用 secp256k1 私钥对摘要签名，返回 DER 格式字节
  const sig = ecc.sign(hash, privKey);
  return Buffer.from(sig).toString('hex');
}

// 验证 secp256k1 签名是否合法
function verify(dataHex, signatureHex, publicKeyHex) {
  try {
    // 同样对原始数据做 SHA256，再与签名、公钥比对
    const hash = crypto.createHash('sha256').update(Buffer.from(dataHex, 'hex')).digest();
    const sig = Buffer.from(signatureHex, 'hex');
    const pubKey = Buffer.from(publicKeyHex, 'hex');
    return ecc.verify(hash, pubKey, sig);
  } catch {
    // 签名格式异常时返回 false，不抛出错误
    return false;
  }
}

// 对任意数据做 SHA256 哈希，返回十六进制字符串
function hashData(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

module.exports = { generateKeyPair, keyPairFromMnemonic, sign, verify, hashData };
