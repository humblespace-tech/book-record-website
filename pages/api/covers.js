export default async function handler(req, res) {
    if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' })
    }

  const { title, author, isbn } = req.query

  if (!title) {
        return res.status(400).json({ error: 'Title is required' })
  }

  try {
        // Try Open Library Search API
      const searchQuery = `${title} ${author || ''}`.trim()
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5&fields=cover_i,title,author_name`

      const response = await fetch(searchUrl)

      if (!response.ok) {
              return res.status(200).json({ coverUrl: '', source: 'none' })
      }

      const data = await response.json()

      if (data.docs && data.docs.length > 0) {
              // Find the first result with a cover
          for (const doc of data.docs) {
                    if (doc.cover_i) {
                                const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                                return res.status(200).json({ coverUrl, source: 'Open Library' })
                    }
          }
      }

      // If ISBN provided, try ISBN-based lookup
      if (isbn) {
              const isbnUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
              return res.status(200).json({ coverUrl: isbnUrl, source: 'Open Library ISBN' })
      }

      return res.status(200).json({ coverUrl: '', source: 'none' })
  } catch (error) {
        console.error('Cover API error:', error)
        return res.status(200).json({ coverUrl: '', source: 'error' })
  }
}
