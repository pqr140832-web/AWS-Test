export default async function handler(req, res) {
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
    
    // 直接使用 HTTPS 请求调用 Bedrock API
    const response = await fetch(
      'https://bedrock-runtime.us-east-1.amazonaws.com/model/global.anthropic.claude-haiku-4-5-20251001-v1:0/converse',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BEDROCK_API_KEY}`  // 直接用 Bearer token
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

    const data = await response.json();
    
    // 检查是否有错误
    if (!response.ok) {
      console.error('Bedrock API Error:', data);
      return res.status(500).json({ 
        error: `API 错误: ${data.message || JSON.stringify(data)}` 
      });
    }
    
    // 提取回复文本
    const text = data.output?.message?.content?.[0]?.text || '无回复';
    
    res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
