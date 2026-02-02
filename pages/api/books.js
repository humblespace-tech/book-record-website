import { ObjectId } from 'mongodb'
import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
            let client
            try {
                            client = await clientPromise
            } catch (error) {
                            console.error('MongoDB connection error:', error.message)
                            return res.status(500).json({ error: 'Database connection failed: ' + error.message })
            }

    const db = client.db('book-database')
            const collection = db.collection('books')

    if (req.method === 'GET') {
                    try {
                                        const books = await collection.find({}).sort({ createdAt: -1 }).toArray()
                                        res.status(200).json(books)
                    } catch (error) {
                                        console.error('Failed to fetch books:', error.message)
                                        res.status(500).json({ error: 'Failed to fetch books' })
                    }
    } else if (req.method === 'POST') {
                    try {
                                        const { title, author, isbn, genre, rating, notes, pages } = req.body

                        if (!title || !author) {
                                                return res.status(400).json({ error: 'Title and author are required' })
                        }

                        const book = {
                                                title,
                                                author,
                                                isbn: isbn || '',
                                                genre: genre || '',
                                                rating: rating ? parseInt(rating) : 0,
                                                notes: notes || '',
                                                pages: pages ? parseInt(pages) : 0,
                                                createdAt: new Date(),
                        }

                        const result = await collection.insertOne(book)
                                        res.status(201).json({ ...book, _id: result.insertedId })
                    } catch (error) {
                                        console.error('Failed to add book:', error.message)
                                        res.status(500).json({ error: 'Failed to add book' })
                    }
    } else if (req.method === 'DELETE') {
                    try {
                                        const { id } = req.query
                                        await collection.deleteOne({ _id: new ObjectId(id) })
                                        res.status(200).json({ message: 'Book deleted' })
                    } catch (error) {
                                        console.error('Failed to delete book:', error.message)
                                        res.status(500).json({ error: 'Failed to delete book' })
                    }
    } else {
                    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
                    res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
