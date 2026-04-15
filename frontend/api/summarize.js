// Vercel Serverless Function - Secure HuggingFace Proxy
// This runs on Vercel's server (not the user's browser), bypassing CORS restrictions.
// The HF_TOKEN is stored securely as a Vercel Environment Variable.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { model, inputs, parameters } = req.body

  if (!model || !inputs) {
    return res.status(400).json({ error: 'Missing model or inputs in request body' })
  }

  const HF_TOKEN = process.env.HF_TOKEN

  try {
    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Token adds priority access and bypasses cold-start limits
          ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
        },
        body: JSON.stringify({ inputs, parameters }),
      }
    )

    const data = await hfResponse.json()

    // If HF returns an error (like model loading), pass it through so frontend can handle it
    if (!hfResponse.ok) {
      return res.status(hfResponse.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
