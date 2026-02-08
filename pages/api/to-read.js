import { ObjectId } from 'mongodb'
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
  const collection = db.collection('toRead')

  if (req.method === 'GET') {
    try {
      const entries = await collection.find({}).sort({ addedAt: -1 }).toArray()
      res.status(200).json(entries)
    } catch (error) {
      console.error('Failed to fetch to-read list:', error.message)
      res.status(500).json({ error: 'Failed to fetch to-read list' })
    }
  } else if (req.method === 'POST') {
    try {
      const { title, author, coverUrl } = req.body
      if (!title || !title.trim() || !author || !author.trim()) {
        return res.status(400).json({ error: 'Title and author are required' })
      }
      const entry = {
        title: title.trim(),
        author: author.trim(),
        coverUrl: coverUrl || '',
        addedAt: new Date(),
      }
      const result = await collection.insertOne(entry)
      res.status(201).json({ ...entry, _id: result.insertedId })
    } catch (error) {
      console.error('Failed to add to-read entry:', error.message)
      res.status(500).json({ error: 'Failed to add entry' })
    }
  } else if (req.method === 'DELETE') {
    if (!verifyAuth(req)) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    try {
      const { id } = req.query
      if (!id) {
        return res.status(400).json({ error: 'id is required' })
      }
      await collection.deleteOne({ _id: new ObjectId(id) })
      res.status(200).json({ message: 'Entry deleted' })
    } catch (error) {
      console.error('Failed to delete to-read entry:', error.message)
      res.status(500).json({ error: 'Failed to delete entry' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
