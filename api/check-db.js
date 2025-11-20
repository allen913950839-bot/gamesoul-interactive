/**
 * 数据库连接诊断接口
 * 用于检查Vercel KV配置和连接状态
 */

export default async function handler(req, res) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'local',
    kvConfigured: false,
    kvConnection: null,
    errorDetails: null
  };

  // 检查环境变量
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  diagnostics.kvConfigured = !!(kvUrl && kvToken);
  diagnostics.hasUrl = !!kvUrl;
  diagnostics.hasToken = !!kvToken;

  if (!diagnostics.kvConfigured) {
    return res.status(200).json({
      success: false,
      message: '❌ Vercel KV未配置',
      diagnostics,
      solution: '请在Vercel项目设置中添加KV数据库并配置环境变量'
    });
  }

  // 尝试连接数据库
  try {
    const { kv } = await import('@vercel/kv');
    
    // 测试连接 - 获取一个简单的键
    const testKey = `test:${Date.now()}`;
    await kv.set(testKey, 'test-value', { ex: 10 }); // 10秒后过期
    const value = await kv.get(testKey);
    await kv.del(testKey);

    diagnostics.kvConnection = 'success';
    diagnostics.testResult = value === 'test-value' ? '✅ 读写正常' : '⚠️ 读写异常';

    // 获取公开对话数量
    const totalConversations = await kv.zcard('public:conversations') || 0;

    return res.status(200).json({
      success: true,
      message: '✅ 数据库连接正常',
      diagnostics,
      data: {
        totalPublicConversations: totalConversations
      }
    });

  } catch (error) {
    diagnostics.kvConnection = 'failed';
    diagnostics.errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    };

    return res.status(500).json({
      success: false,
      message: '❌ 数据库连接失败',
      diagnostics
    });
  }
}
