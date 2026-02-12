import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// 从环境变量读取 Bedrock API key
const client = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.BEDROCK_API_KEY,
    secretAccessKey: process.env.BEDROCK_API_KEY
  }
});

export default async function handler(req, res) {
  // 设置 CORS
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

    const command = new InvokeModelCommand({
      modelId: "global.anthropic.claude-haiku-4-5-20251001-v1:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    res.status(200).json({ 
      response: result.content[0].text 
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}
