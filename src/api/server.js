// Express 服务器：挂载所有路由、Swagger 文档、统一错误处理
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// 引入各业务路由模块
const accountsRouter = require('./routes/accounts');
const blocksRouter = require('./routes/blocks');
const txsRouter = require('./routes/txs');
const miningRouter = require('./routes/mining');

const app = express();

// 加载 OpenAPI 规范文件，挂载 Swagger UI（访问 /api-docs）
const swaggerDoc = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customSiteTitle: 'MyChain API Docs',
}));

// 允许跨域（供 Explorer / Wallet App 等前端页面调用）
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());

// 挂载业务路由
app.use('/accounts', accountsRouter);
app.use('/blocks', blocksRouter);
app.use('/txs', txsRouter);
app.use('/mine', miningRouter);

// 链基本信息接口（配置来自 .env）
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Cosmos-Inspired Blockchain',
    chainId: process.env.CHAIN_ID || 'mychain-1',
    denom: process.env.DENOM || 'uatom',
    difficulty: process.env.DIFFICULTY || '3',
    blockReward: process.env.BLOCK_REWARD || '1000000',
  });
});

// 全局错误处理中间件：捕获所有未处理异常，返回 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app;
