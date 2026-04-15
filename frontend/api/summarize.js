// Vercel Serverless Function - Secure HuggingFace Proxy
// Uses the NEW 2025 HuggingFace router endpoint: router.huggingface.co/hf-inference

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { model, inputs, parameters } = req.body
  if (!model || !inputs) return res.status(400).json({ error: 'Missing model or inputs' })

  const HF_TOKEN = process.env.HF_TOKEN
  if (!HF_TOKEN) return res.status(500).json({ error: 'HF_TOKEN not configured in Vercel environment variables' })

  try {
    const hfRes = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify({ inputs, parameters }),
      }
    )

    const rawText = await hfRes.text()

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      return res.status(502).json({
        error: `HuggingFace returned non-JSON (HTTP ${hfRes.status}): ${rawText.slice(0, 200)}`
      })
    }

    return res.status(hfRes.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
