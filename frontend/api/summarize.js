// Vercel Serverless Function - Secure HuggingFace Proxy
// Runs on Vercel's Node.js server, NOT the browser — fixes CORS completely.

export default async function handler(req, res) {
  // Set CORS headers so browser can receive the response
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { model, inputs, parameters } = req.body

  if (!model || !inputs) {
    return res.status(400).json({ error: 'Missing model or inputs' })
  }

  const HF_TOKEN = process.env.HF_TOKEN

  try {
    const hfRes = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
        },
        body: JSON.stringify({ inputs, parameters }),
      }
    )

    const text = await hfRes.text()

    let data
    try {
      data = JSON.parse(text)
    } catch {
      // HF returned non-JSON (rare)
      return res.status(502).json({ error: `HuggingFace returned unexpected response: ${text.slice(0, 100)}` })
    }

    return res.status(hfRes.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
