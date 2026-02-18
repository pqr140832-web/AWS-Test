export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: '消息不能为空' });

    const response = await fetch(
      'https://bedrock.us-east-1.amazonaws.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.BEDROCK_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'anthropic.claude-haiku-4-5-20251001-v1:0',
          max_tokens: 1024,
          messages: [{ role: 'user', content: message }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Bedrock Error:', data);
      return res.status(response.status).json({ error: data.message || JSON.stringify(data) });
    }

    const text = data.content?.[0]?.text;
    if (!text) return res.status(500).json({ error: '未收到回复' });
    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: `服务器错误: ${error.message}` });
  }
}
