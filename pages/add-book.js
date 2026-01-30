import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function AddBook() {
    const [form, setForm] = useState({
          title: '', author: '', isbn: '', genre: '', rating: '', notes: ''
    })
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [books, setBooks] = useState([])
    const [showBooks, setShowBooks] = useState(false)

  const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
  }

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
                          setForm({ title: '', author: '', isbn: '', genre: '', rating: '', notes: '' })
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
                const data = await res.json()
                setBooks(data)
                setShowBooks(true)
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
            <title>Add Book - Book Record Website</title>
    </Head>
        <main style={styles.main}>
        <Link href="/" style={styles.backLink}>Back to Home</Link>
          <h1 style={styles.title}>Add a New Book</h1>
  {message && <p style={{...styles.message, background: message.includes('success') ? 'rgba(72,199,142,0.2)' : 'rgba(255,56,96,0.2)', borderColor: message.includes('success') ? '#48c78e' : '#ff3860'}}>{message}</p>}
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
  </div>
          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} style={{...styles.input, minHeight: '80px'}} placeholder="Your notes" />
  </div>
          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Adding...' : 'Add Book'}</button>
  </form>
        <div style={styles.divider} />
        <button onClick={fetchBooks} style={styles.secondaryButton}>{showBooks ? 'Refresh' : 'View My Books'}</button>
{showBooks && (
            <div style={styles.bookList}>
            <h2 style={styles.subtitle}>{books.length} Book{books.length !== 1 ? 's' : ''}</h2>
{books.length === 0 ? <p style={styles.empty}>No books yet!</p> : books.map((book) => (
               <div key={book._id} style={styles.bookCard}>
                <div style={styles.bookInfo}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                   <p style={styles.bookAuthor}>by {book.author}</p>
 {book.genre && <span style={styles.badge}>{book.genre}</span>}
  {book.rating > 0 && <span style={styles.rating}>{book.rating}/5</span>}
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
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem' },
    main: { maxWidth: '800px', margin: '0 auto', color: 'white' },
    backLink: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' },
    title: { fontSize: '2.5rem', margin: '1rem 0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' },
    subtitle: { fontSize: '1.5rem', margin: '1rem 0' },
    message: { padding: '1rem', borderRadius: '8px', border: '1px solid', marginBottom: '1rem', textAlign: 'center' },
    form: { background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
    row: { display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
    field: { flex: '1', minWidth: '200px', marginBottom: '0.5rem' },
    label: { display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: '600' },
    input: { width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '1rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.9rem', borderRadius: '8px', border: 'none', background: '#48c78e', color: 'white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem' },
    secondaryButton: { padding: '0.8rem 2rem', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.5)', background: 'transparent', color: 'white', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
    divider: { borderTop: '1px solid rgba(255,255,255,0.2)', margin: '2rem 0' },
    bookList: { marginTop: '1rem' },
    bookCard: { background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid rgba(255,255,255,0.15)' },
    bookInfo: { flex: 1 },
    bookTitle: { margin: '0 0 0.3rem 0', fontSize: '1.2rem' },
    bookAuthor: { margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.95rem' },
    badge: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', marginRight: '0.5rem' },
    rating: { fontSize: '1rem', color: '#ffd700', marginLeft: '0.5rem' },
    bookNotes: { margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.7, fontStyle: 'italic' },
    deleteBtn: { background: 'rgba(255,56,96,0.3)', border: '1px solid #ff3860', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, marginLeft: '1rem' },
    empty: { textAlign: 'center', opacity: 0.7, padding: '2rem' },
}
