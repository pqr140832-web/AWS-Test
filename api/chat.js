export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    // 正确的 Bedrock API 调用
    const response = await fetch(
      'https://bedrock-runtime.us-east-1.amazonaws.com/model/global.anthropic.claude-haiku-4-5-20251001-v1:0/converse',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BEDROCK_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [{ text: message }]
            }
          ]
        })
      }
    );

    // 读取响应
    const data = await response.json();
    
    // 检查错误
    if (!response.ok) {
      console.error('Bedrock Error:', data);
      return res.status(response.status).json({ 
        error: data.message || JSON.stringify(data)
      });
    }
    
    // 提取回复
    const text = data.output?.message?.content?.[0]?.text;
    
    if (!text) {
      console.error('No text in response:', data);
      return res.status(500).json({ error: '未收到回复' });
    }
    
    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: `服务器错误: ${error.message}` 
    });
  }
}
