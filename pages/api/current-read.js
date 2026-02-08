import clientPromise from '../../lib/mongodb'
import { verifyAuth } from '../../lib/auth'

export default async function handler(req, res) {
  let client
  try {
    client = await clientPromise
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    return res.status(500).json({ error: 'Database connection failed: ' + error.message })
  }

  const db = client.db('book-database')
  const collection = db.collection('currentRead')

  if (req.method === 'GET') {
    try {
      const doc = await collection.findOne({})
      res.status(200).json(doc || null)
    } catch (error) {
      console.error('Failed to fetch current read:', error.message)
      res.status(500).json({ error: 'Failed to fetch current read' })
    }
  } else if (req.method === 'POST') {
    if (!verifyAuth(req)) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    try {
      const { bookId } = req.body
      if (!bookId) {
        return res.status(400).json({ error: 'bookId is required' })
      }
      await collection.deleteMany({})
      const result = await collection.insertOne({ bookId, setAt: new Date() })
      res.status(200).json({ bookId, _id: result.insertedId })
    } catch (error) {
      console.error('Failed to set current read:', error.message)
      res.status(500).json({ error: 'Failed to set current read' })
    }
  } else if (req.method === 'DELETE') {
    if (!verifyAuth(req)) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    try {
      await collection.deleteMany({})
      res.status(200).json({ message: 'Current read cleared' })
    } catch (error) {
      console.error('Failed to clear current read:', error.message)
      res.status(500).json({ error: 'Failed to clear current read' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
