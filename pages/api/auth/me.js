import { verifyAuth } from '../../../lib/auth'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authenticated = verifyAuth(req)
  return res.status(200).json({ authenticated })
}
