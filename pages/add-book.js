import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/AuthContext'

export default function AddBook() {
    const { isAdmin, loading: authLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.replace('/')
        }
    }, [authLoading, isAdmin, router])
    const [form, setForm] = useState({
          title: '', author: '', isbn: '', genre: '', rating: '', notes: '', pages: '', coverUrl: '', dateFinished: '', favouriteQuote: ''
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
                                                    setMessage(`Cover found! (${data.source})`)
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
                          setMessage('Book added successfully!')
                          setForm({ title: '', author: '', isbn: '', genre: '', rating: '', notes: '', pages: '', coverUrl: '', dateFinished: '', favouriteQuote: '' })
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

  if (authLoading || !isAdmin) {
    return (
      <div style={styles.container}>
        <main style={styles.main}>
          <p style={{ textAlign: 'center', color: '#8B7E66', fontStyle: 'italic', fontFamily: "'Lora', Georgia, serif", marginTop: '3rem' }}>
            {authLoading ? 'Checking access...' : 'Redirecting...'}
          </p>
        </main>
      </div>
    )
  }

  return (
        <div style={styles.container}>
      <Head>
            <title>Add Book - humblespace</title>
    </Head>
        <main style={styles.main}>
        <Link href="/" style={styles.backBtn}>Back to Library</Link>
          <h1 style={styles.title}>Add a New Book</h1>
  {message && <p style={{...styles.message, background: message.includes('successfully') ? 'rgba(168,181,160,0.2)' : message.includes('found') ? 'rgba(201,169,97,0.15)' : 'rgba(180,80,80,0.15)', borderColor: message.includes('successfully') ? '#A8B5A0' : message.includes('found') ? '#C9A961' : '#b45050'}}>{message}</p>}
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
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Date Finished</label>
              <input name="dateFinished" type="date" value={form.dateFinished} onChange={handleChange} style={styles.input} />
  </div>
  </div>
          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} style={{...styles.input, minHeight: '100px'}} placeholder="Your notes" />
  </div>
          <div style={styles.field}>
            <label style={styles.label}>Favourite Quote</label>
            <textarea name="favouriteQuote" value={form.favouriteQuote} onChange={handleChange} style={{...styles.input, minHeight: '80px'}} placeholder="A favourite quote from the book" />
  </div>
{form.coverUrl && (
              <div style={styles.coverPreview}>
              <label style={styles.label}>Cover Found!</label>
              <img src={form.coverUrl} alt="Book cover" style={styles.coverPreviewImg} />
              <div style={{fontSize: '0.75rem', color: '#8B7E66', marginTop: '0.5rem', wordBreak: 'break-all', fontFamily: "'Lora', Georgia, serif"}}>URL: {form.coverUrl}</div>
  </div>
          )}
{fetchingCover && (
              <div style={styles.coverSearching}>
              Searching for cover...
                </div>
          )}
          <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.7 : 1}}>{loading ? 'Adding...' : 'Add Book'}</button>
            </form>
        <div style={styles.divider} />
        <button onClick={fetchBooks} style={styles.secondaryButton}>{showBooks ? 'Refresh' : 'View My Books'}</button>
{showBooks && (
            <div style={styles.bookList}>
            <h2 style={styles.subtitle}>{books.length} Book{books.length !== 1 ? 's' : ''}</h2>
{books.length === 0 ? <p style={styles.empty}>No books yet!</p> : books.map((book) => (
               <div key={book._id} style={styles.bookCard}>
{book.coverUrl && (
                    <div style={styles.bookCoverWrap}>
                    <img src={book.coverUrl} alt={book.title} style={styles.coverImg} />
  </div>
                )}
                <div style={styles.bookInfo}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.bookAuthor}>by {book.author}</p>
                  <div style={styles.badgeRow}>
                {book.genre && <span style={styles.badge}>{book.genre}</span>}
{book.rating > 0 && <span style={styles.rating}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span>}
{book.pages > 0 && <span style={styles.badge}>{book.pages} pages</span>}
  </div>
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
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFFDF7 0%, #F5EBE0 50%, #F0E4D6 100%)',
        padding: '2rem',
        position: 'relative',
    },
    main: { maxWidth: '800px', margin: '0 auto', color: '#5D4E37', position: 'relative', zIndex: 1 },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.7rem 1.8rem',
        background: '#5D4E37',
        color: '#FFFDF7',
        border: '2px solid #5D4E37',
        borderRadius: '30px',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontFamily: "'Merriweather', Georgia, serif",
        fontWeight: '400',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        boxShadow: '0 3px 10px rgba(93, 78, 55, 0.1)',
        position: 'relative',
        overflow: 'hidden',
    },
    title: {
        fontSize: '2.8rem',
        margin: '1.5rem 0 1.5rem',
        color: '#3E2723',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '1.8rem',
        margin: '1.5rem 0 1rem',
        color: '#3E2723',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
    },
    message: {
        padding: '1rem',
        borderRadius: '12px',
        border: '2px solid',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontFamily: "'Lora', Georgia, serif",
        fontSize: '0.95rem',
    },
    form: {
        background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.3) 100%)',
        padding: '2rem',
        borderRadius: '20px',
        border: '3px solid #F4D9C6',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    },
    row: { display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
    field: { flex: '1', minWidth: '200px', marginBottom: '0.75rem' },
    label: {
        display: 'block',
        marginBottom: '0.4rem',
        fontSize: '0.82rem',
        fontWeight: '600',
        color: '#5D4E37',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontFamily: "'Merriweather', Georgia, serif",
    },
    input: {
        width: '100%',
        padding: '0.7rem 0.9rem',
        borderRadius: '12px',
        border: '2px solid #F4D9C6',
        background: 'rgba(255, 253, 247, 0.8)',
        color: '#3E2723',
        fontSize: '0.95rem',
        boxSizing: 'border-box',
        fontFamily: "'Lora', Georgia, serif",
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    },
    button: {
        width: '100%',
        padding: '1rem',
        borderRadius: '30px',
        border: 'none',
        background: '#D4774E',
        color: '#FFFDF7',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '0.5rem',
        boxShadow: '0 4px 15px rgba(212, 119, 78, 0.3)',
        fontFamily: "'Merriweather', Georgia, serif",
        transition: 'all 0.3s ease',
        letterSpacing: '0.5px',
    },
    secondaryButton: {
        padding: '0.9rem 2rem',
        borderRadius: '30px',
        border: '2px solid #5D4E37',
        background: '#5D4E37',
        color: '#FFFDF7',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: '400',
        fontFamily: "'Merriweather', Georgia, serif",
        transition: 'all 0.4s ease',
        letterSpacing: '0.5px',
        boxShadow: '0 3px 10px rgba(93, 78, 55, 0.1)',
    },
    divider: {
        borderTop: '3px solid transparent',
        borderImage: 'linear-gradient(90deg, transparent, #F4D9C6, #D4774E, #F4D9C6, transparent) 1',
        margin: '2.5rem 0',
    },
    coverPreview: {
        marginTop: '1rem',
        textAlign: 'center',
        paddingTop: '1rem',
        borderTop: '2px solid #F4D9C6',
    },
    coverPreviewImg: {
        maxWidth: '120px',
        height: 'auto',
        borderRadius: '12px',
        marginTop: '0.5rem',
        boxShadow: '0 4px 15px rgba(62, 39, 35, 0.15)',
    },
    coverSearching: {
        marginTop: '1rem',
        textAlign: 'center',
        color: '#C9A961',
        fontSize: '0.9rem',
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: 'italic',
    },
    bookList: { marginTop: '1rem' },
    bookCard: {
        background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.3) 100%)',
        borderRadius: '20px',
        padding: '1.2rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        border: '3px solid #F4D9C6',
        gap: '1rem',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s ease',
    },
    bookCoverWrap: {
        width: '80px',
        minHeight: '110px',
        borderRadius: '10px',
        overflow: 'hidden',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #D4774E 0%, #3E2723 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(62, 39, 35, 0.15)',
    },
    coverImg: { width: '100%', height: 'auto', display: 'block' },
    bookInfo: { flex: 1, minWidth: 0 },
    badgeRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' },
    bookTitle: {
        margin: '0 0 0.3rem 0',
        fontSize: '1.2rem',
        color: '#3E2723',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
    },
    bookAuthor: {
        margin: '0 0 0.3rem 0',
        color: '#8B7E66',
        fontSize: '0.9rem',
        fontStyle: 'italic',
        fontFamily: "'Lora', Georgia, serif",
    },
    badge: {
        display: 'inline-block',
        background: 'rgba(212, 119, 78, 0.12)',
        padding: '0.2rem 0.7rem',
        borderRadius: '20px',
        fontSize: '0.78rem',
        color: '#D4774E',
        fontWeight: '600',
        fontFamily: "'Merriweather', Georgia, serif",
    },
    rating: { fontSize: '0.95rem', color: '#C9A961', letterSpacing: '2px' },
    bookNotes: {
        margin: '0.5rem 0 0',
        fontSize: '0.88rem',
        color: '#8B7E66',
        fontStyle: 'italic',
        fontFamily: "'Lora', Georgia, serif",
        lineHeight: '1.5',
    },
    deleteBtn: {
        background: 'transparent',
        border: '2px solid #b45050',
        color: '#b45050',
        padding: '0.45rem 1rem',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        flexShrink: 0,
        fontWeight: '600',
        fontFamily: "'Merriweather', Georgia, serif",
        transition: 'all 0.3s ease',
    },
    empty: {
        textAlign: 'center',
        color: '#8B7E66',
        padding: '2rem',
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: 'italic',
    },
}
