import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function AddBook() {
              const [form, setForm] = useState({
                              title: '', author: '', isbn: '', genre: '', rating: '', notes: '', pages: '', coverUrl: ''
              })
              const [message, setMessage] = useState('')
              const [loading, setLoading] = useState(false)
              const [fetchingCover, setFetchingCover] = useState(false)
              const [books, setBooks] = useState([])
              const [showBooks, setShowBooks] = useState(false)

  const handleChange = (e) => {
                  setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Auto-fetch cover when title or author changes
  useEffect(() => {
                  if (form.title && form.author && form.title.trim() && form.author.trim()) {
                                    const timer = setTimeout(async () => {
                                                        setFetchingCover(true)
                                                        try {
                                                                              const params = new URLSearchParams({
                                                                                                      title: form.title,
                                                                                                      author: form.author,
                                                                                                      ...(form.isbn && { isbn: form.isbn })
                                                                              })
                                                                              const res = await fetch(`/api/covers?${params}`)
                                                                              const data = await res.json()
                                                                              if (data.coverUrl) {
                                                                                                      setForm(prev => ({ ...prev, coverUrl: data.coverUrl }))
                                                                                                      setMessage(`✨ Cover found! (${data.source})`)
                                                                                          } else {
                                                                                                      setForm(prev => ({ ...prev, coverUrl: '' }))
                                                                                                      setMessage('')
                                                                                          }
                                                        } catch (error) {
                                                                              console.error('Cover fetch error:', error)
                                                                              setForm(prev => ({ ...prev, coverUrl: '' }))
                                                        } finally {
                                                                              setFetchingCover(false)
                                                        }
                                    }, 800)
                                    return () => clearTimeout(timer)
                  }
  }, [form.title, form.author, form.isbn])

  const handleSubmit = async (e) => {
                  e.preventDefault()
                  setLoading(true)
                  setMessage('')
                  try {
                                    const res = await fetch('/api/books', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(form),
                                    })
                                    const data = await res.json()
                                    if (res.ok) {
                                                        setMessage('✅ Book added successfully!')
                                                        setForm({ title: '', author: '', isbn: '', genre: '', rating: '', notes: '', pages: '', coverUrl: '' })
                                                        if (showBooks) fetchBooks()
                                    } else {
                                                        setMessage(data.error || 'Failed to add book')
                                    }
                  } catch (err) {
                                    setMessage('Something went wrong')
                  }
                  setLoading(false)
  }

  const fetchBooks = async () => {
                  try {
                                    const res = await fetch('/api/books')
                                    if (!res.ok) {
                                                        const errorData = await res.json()
                                                        setMessage(errorData.error || 'Failed to load books')
                                                        return
                                    }
                                    const data = await res.json()
                                    if (Array.isArray(data)) {
                                                        setBooks(data)
                                                        setShowBooks(true)
                                    } else {
                                                        setMessage('Unexpected response from server')
                                    }
                  } catch (err) {
                                    setMessage('Failed to load books')
                  }
  }

  const deleteBook = async (id) => {
                  try {
                                    await fetch('/api/books?id=' + id, { method: 'DELETE' })
                                    fetchBooks()
                  } catch (err) {
                                    setMessage('Failed to delete book')
                  }
  }

  return (
                  <div style={styles.container}>
      <Head>
                      <title>Add Book - humblespace</title>
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet" />
              </Head>
                  <main style={styles.main}>
        <Link href="/" style={styles.backLink}>Back to Home</Link>
                    <h1 style={styles.title}>Add a New Book</h1>
            {message && <p style={{...styles.message, background: message.includes('✅') ? 'rgba(166,124,91,0.15)' : message.includes('✨') ? 'rgba(100,150,200,0.15)' : 'rgba(180,80,80,0.15)', borderColor: message.includes('✅') ? '#a67c5b' : message.includes('✨') ? '#6496c8' : '#b45050'}}>{message}</p>}
                    <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Title *</label>
                          <input name="title" value={form.title} onChange={handleChange} required style={styles.input} placeholder="Book title" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Author *</label>
              <input name="author" value={form.author} onChange={handleChange} required style={styles.input} placeholder="Author name" />
            </div>
            </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>ISBN</label>
              <input name="isbn" value={form.isbn} onChange={handleChange} style={styles.input} placeholder="ISBN number" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange} style={styles.input}>
                <option value="">Select genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Other">Other</option>
            </select>
            </div>
            </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Rating (1-5)</label>
              <select name="rating" value={form.rating} onChange={handleChange} style={styles.input}>
                <option value="">No rating</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Pages</label>
              <input name="pages" type="number" value={form.pages} onChange={handleChange} style={styles.input} placeholder="Number of pages" min="0" />
            </div>
            </div>
          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} style={{...styles.input, minHeight: '80px'}} placeholder="Your notes" />
            </div>

{form.coverUrl && (
                        <div style={{...styles.field, marginTop: '1rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(193,170,145,0.2)'}}>
              <label style={styles.label}>✨ Cover Found!</label>
              <img src={form.coverUrl} alt="Book cover" style={{maxWidth: '120px', height: 'auto', borderRadius: '8px', marginTop: '0.5rem'}} />
              <div style={{fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', wordBreak: 'break-all'}}>URL: {form.coverUrl}</div>
            </div>
          )}

{fetchingCover && (
                        <div style={{...styles.field, marginTop: '1rem', textAlign: 'center', color: '#6496c8', fontSize: '0.9rem'}}>
              🔍 Searching for cover...
                          </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Adding...' : 'Add Book'}</button>
                      </form>

        <div style={styles.divider} />
        <button onClick={fetchBooks} style={styles.secondaryButton}>{showBooks ? 'Refresh' : 'View My Books'}</button>
{showBooks && (
                      <div style={styles.bookList}>
            <h2 style={styles.subtitle}>{books.length} Book{books.length !== 1 ? 's' : ''}</h2>
{books.length === 0 ? <p style={styles.empty}>No books yet!</p> : books.map((book) => (
               <div key={book._id} style={styles.bookCard}>
{book.coverUrl && (
                              <div style={styles.bookCoverSmall}>
                    <img src={book.coverUrl} alt={book.title} style={styles.coverImageSmall} />
            </div>
                )}
                <div style={styles.bookInfo}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>by {book.author}</p>
{book.genre && <span style={styles.badge}>{book.genre}</span>}
 {book.rating > 0 && <span style={styles.rating}>{book.rating}/5</span>}
{book.pages > 0 && <span style={styles.badge}>{book.pages} pages</span>}
{book.notes && <p style={styles.bookNotes}>{book.notes}</p>}
            </div>
                 <button onClick={() => deleteBook(book._id)} style={styles.deleteBtn}>Delete</button>
            </div>
            ))}
                        </div>
        )}
</main>
                    </div>
  )
}

const styles = {
              container: { minHeight: '100vh', background: 'linear-gradient(160deg, #faf6f1 0%, #f0e6d8 40%, #e8ddd0 100%)', padding: '2rem' },
              main: { maxWidth: '800px', margin: '0 auto', color: '#3d2c1e' },
              backLink: { color: '#7a6654', textDecoration: 'none', fontSize: '0.9rem' },
              title: { fontSize: '2.5rem', margin: '1rem 0', color: '#3d2c1e', fontWeight: '300', fontFamily: "'Playfair Display', Georgia, serif" },
              subtitle: { fontSize: '1.5rem', margin: '1rem 0', color: '#3d2c1e', fontWeight: '300' },
              message: { padding: '1rem', borderRadius: '8px', border: '1px solid', marginBottom: '1rem', textAlign: 'center' },
              form: { background: 'rgba(255,255,255,0.6)', padding: '2rem', borderRadius: '14px', border: '1px solid rgba(193,170,145,0.3)' },
              row: { display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
              field: { flex: '1', minWidth: '200px', marginBottom: '0.5rem' },
              label: { display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: '600', color: '#3d2c1e' },
              input: { width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(193,170,145,0.4)', background: 'rgba(255,255,255,0.7)', color: '#3d2c1e', fontSize: '1rem', boxSizing: 'border-box' },
              button: { width: '100%', padding: '0.9rem', borderRadius: '50px', border: 'none', background: '#a67c5b', color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 15px rgba(166,124,91,0.25)' },
              secondaryButton: { padding: '0.8rem 2rem', borderRadius: '50px', border: '1px solid rgba(193,170,145,0.5)', background: 'transparent', color: '#3d2c1e', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
              divider: { borderTop: '1px solid rgba(193,170,145,0.3)', margin: '2rem 0' },
              bookList: { marginTop: '1rem' },
              bookCard: { background: 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid rgba(193,170,145,0.3)' },
              bookCoverSmall: { width: '60px', height: '80px', borderRadius: '6px', overflow: 'hidden', marginRight: '1rem', flexShrink: 0, background: 'rgba(166,124,91,0.08)' },
              coverImageSmall: { width: '100%', height: '100%', objectFit: 'cover' },
              bookInfo: { flex: 1 },
              bookTitle: { margin: '0 0 0.3rem 0', fontSize: '1.2rem', color: '#3d2c1e' },
              bookAuthor: { margin: '0 0 0.5rem 0', color: '#7a6654', fontSize: '0.95rem', fontStyle: 'italic' },
              badge: { display: 'inline-block', background: 'rgba(166,124,91,0.15)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', marginRight: '0.5rem', color: '#7a6654' },
              rating: { fontSize: '1rem', color: '#c49a6c', marginLeft: '0.5rem' },
              bookNotes: { margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#8a7564', fontStyle: 'italic' },
              deleteBtn: { background: 'rgba(180,80,80,0.15)', border: '1px solid #b45050', color: '#b45050', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, marginLeft: '1rem' },
              empty: { textAlign: 'center', color: '#7a6654', padding: '2rem' },
}
