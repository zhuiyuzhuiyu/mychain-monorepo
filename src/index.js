// 节点入口：加载链状态（或初始化创世块），启动 Express HTTP 服务
require('dotenv').config();
const app = require('./api/server');
const { load } = require('./store/state');
const { initGenesis } = require('./core/blockchain');
const { generateKeyPair } = require('./crypto/keys');
const { createAccount } = require('./modules/auth');
const { pubKeyToAddress } = require('./crypto/address');

const PORT = process.env.PORT || 3000;

function bootstrap() {
  // 尝试从 data/chain.json 恢复链状态
  const loaded = load();

  if (!loaded) {
    // 首次启动：自动生成创世账户并初始化创世块
    console.log('[启动] 未找到链数据，初始化创世块...');
    const genesis = generateKeyPair();               // 随机生成创世密钥对
    const genesisAddress = pubKeyToAddress(genesis.publicKey);
    createAccount(genesis.publicKey);                // 将创世账户写入链上状态
    initGenesis(genesisAddress);                     // 铸造创世代币，创建高度为 1 的创世块

    // 将创世助记词打印到控制台，用户需要立即保存（唯一获取机会）
    console.log('');
    console.log('══════════════════════════════════════════════════════');
    console.log('  创世账户信息（请妥善保存！）');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  地址:   ${genesisAddress}`);
    console.log(`  助记词: ${genesis.mnemonic}`);
    console.log('══════════════════════════════════════════════════════');
    console.log('');
  } else {
    // 非首次启动：从持久化文件恢复所有账户、余额、区块、交易索引
    console.log('[启动] 已从 data/chain.json 恢复链状态');
  }

  // 启动 HTTP 服务，监听端口
  app.listen(PORT, () => {
    console.log(`[节点] 区块链节点已启动: http://localhost:${PORT}`);
    console.log(`[节点] Swagger 文档:       http://localhost:${PORT}/api-docs`);
    console.log(`[节点] API 接口:`);
    console.log(`         POST /accounts          创建新账户`);
    console.log(`         GET  /accounts/:address  查询账户`);
    console.log(`         GET  /blocks             区块列表`);
    console.log(`         GET  /blocks/latest      最新区块`);
    console.log(`         GET  /blocks/:height     指定高度区块`);
    console.log(`         POST /txs/sign           签名并提交交易`);
    console.log(`         GET  /txs/:hash          查询交易`);
    console.log(`         POST /mine               挖矿`);
  });
}

bootstrap();
