import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from '../styles/styles/Home.module.css'
import { useAuth } from '../lib/AuthContext'

export default function Home() {
        const { isAdmin, logout } = useAuth()
        const [books, setBooks] = useState([])
        const [loading, setLoading] = useState(true)
        const [editingBook, setEditingBook] = useState(null)
        const [editForm, setEditForm] = useState({
                    title: '', author: '', isbn: '', genre: '', rating: '', notes: '', pages: '', coverUrl: '', dateFinished: '', favouriteQuote: ''
        })
        const [editMessage, setEditMessage] = useState('')

    const fetchBooks = () => {
                fetch('/api/books')
                    .then(res => res.json())
                    .then(data => {
                                        setBooks(data)
                                        setLoading(false)
                    })
                    .catch(() => setLoading(false))
    }

    useEffect(() => {
                fetchBooks()
    }, [])

    const deleteBook = async (id, title) => {
                if (!confirm(`Are you sure you want to delete "${title}"?`)) return
                try {
                                const res = await fetch('/api/books?id=' + id, { method: 'DELETE' })
                                if (res.ok) {
                                                    setBooks(books.filter(b => b._id !== id))
                                }
                } catch (err) {
                                alert('Failed to delete book')
                }
    }

    const openEditModal = (book) => {
                setEditingBook(book)
                setEditForm({
                                title: book.title || '',
                                author: book.author || '',
                                isbn: book.isbn || '',
                                genre: book.genre || '',
                                rating: book.rating ? String(book.rating) : '',
                                notes: book.notes || '',
                                pages: book.pages ? String(book.pages) : '',
                                coverUrl: book.coverUrl || '',
                                dateFinished: book.dateFinished || '',
                                favouriteQuote: book.favouriteQuote || ''
                })
                setEditMessage('')
    }

    const closeEditModal = () => {
                setEditingBook(null)
                setEditMessage('')
    }

    const handleEditChange = (e) => {
                const { name, value } = e.target
                setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleEditSubmit = async (e) => {
                e.preventDefault()
                setEditMessage('')
                try {
                                const res = await fetch('/api/books?id=' + editingBook._id, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(editForm),
                                })
                                if (res.ok) {
                                                    setEditMessage('Book updated successfully!')
                                                    fetchBooks()
                                                    setTimeout(() => closeEditModal(), 1000)
                                } else {
                                                    const data = await res.json()
                                                    setEditMessage(data.error || 'Failed to update book')
                                }
                } catch (err) {
                                setEditMessage('Something went wrong')
                }
    }

    return (
                <div className={styles.container}>
            <Head>
                        <title>humblespace</title>
                    <meta name="description" content="Manage your book collection" />
                        <link rel="icon" href="/favicon.ico" />
        </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    humblespace
                        </h1>
                <p className={styles.description}>
                    my life in books
                        </p>

                {isAdmin && (
                    <div style={{ textAlign: 'right', width: '100%', maxWidth: '900px', marginBottom: '0.5rem' }}>
                        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#D4774E', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'Merriweather', Georgia, serif", fontWeight: '600' }}>Logout</button>
                    </div>
                )}

                <div className={styles.navButtons}>
                    <Link href="/search" className={styles.navBtn}>
                        Search & Filter
                    </Link>
                    <Link href="/statistics" className={styles.navBtn}>
                        Statistics
                    </Link>
                    <Link href="/quotes" className={styles.navBtn}>
                        Favourite Quotes
                    </Link>
                </div>

                {isAdmin && (
                <Link href="/add-book">
                                            <button className={styles.addBookBtn}>+ Add a Book</button>
                        </Link>
                )}

                <section className={styles.collectionSection}>
                    <h2 className={styles.collectionTitle}>My Book Collection</h2>
{loading ? (
                            <p className={styles.loadingText}>Loading books...</p>
                        ) : books.length === 0 ? (
                            <p className={styles.loadingText}>No books yet. Add your first book!</p>
                     ) : (
                                                 <div className={styles.bookGrid}>
                         {books.map((book) => (
                                                         <div key={book._id} className={styles.bookCard}>
                     {book.coverUrl && (
                                                                 <div className={styles.bookCover}>
                                            <img src={book.coverUrl} alt={book.title + ' cover'} className={styles.coverImage} />
    </div>
                                    )}
{!book.coverUrl && (
                                            <div className={styles.bookCoverPlaceholder}>
                                            <span className={styles.coverPlaceholderIcon}>📖</span>
    </div>
                                     )}
                                    <div className={styles.bookCardContent}>
                                    <h3 className={styles.bookTitle}>{book.title}</h3>
                                    <p className={styles.bookAuthor}>by {book.author}</p>
{book.genre && <span className={styles.bookGenre}>{book.genre}</span>}
 {book.rating > 0 && (
                                             <p className={styles.bookRating}>
 {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
 </p>
                                     )}
{book.dateFinished && <p className={styles.bookDateFinished}>Finished: {new Date(book.dateFinished).toLocaleDateString()}</p>}
{book.notes && <p className={styles.bookNotes}>{book.notes}</p>}
{book.favouriteQuote && (
                                    <div className={styles.bookQuote}>
                                        <span className={styles.quoteIcon}>&ldquo;</span>
                                        <p className={styles.quoteText}>{book.favouriteQuote}</p>
                                    </div>
)}
                                     {isAdmin && (
                                     <div className={styles.bookActions}>
                                        <button onClick={() => openEditModal(book)} className={styles.editBtn}>Edit</button>
                                        <button onClick={() => deleteBook(book._id, book.title)} className={styles.deleteBtn}>Delete</button>
    </div>
                                     )}
    </div>
    </div>
                            ))}
                                </div>
                    )}
</section>
                        </main>

{editingBook && (
                    <div className={styles.modalOverlay} onClick={closeEditModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Edit Book</h2>
                            <button onClick={closeEditModal} className={styles.modalClose}>&times;</button>
    </div>
{editMessage && (
                                <p className={styles.editMessage} style={{
                                    background: editMessage.includes('success') ? 'rgba(168,181,160,0.2)' : 'rgba(180,80,80,0.15)',
                                    borderColor: editMessage.includes('success') ? '#A8B5A0' : '#b45050'
}}>{editMessage}</p>
                        )}
                        <form onSubmit={handleEditSubmit} className={styles.editForm}>
                            <div className={styles.editRow}>
                                <div className={styles.editField}>
                                    <label className={styles.editLabel}>Title *</label>
                                    <input name="title" value={editForm.title} onChange={handleEditChange} required className={styles.editInput} />
                            </div>
                                <div className={styles.editField}>
                                    <label className={styles.editLabel}>Author *</label>
                                    <input name="author" value={editForm.author} onChange={handleEditChange} required className={styles.editInput} />
                            </div>
                            </div>
                            <div className={styles.editRow}>
                                <div className={styles.editField}>
                                    <label className={styles.editLabel}>ISBN</label>
                                    <input name="isbn" value={editForm.isbn} onChange={handleEditChange} className={styles.editInput} />
                            </div>
                                <div className={styles.editField}>
                                    <label className={styles.editLabel}>Genre</label>
                                    <select name="genre" value={editForm.genre} onChange={handleEditChange} className={styles.editInput}>
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
                            <div className={styles.editRow}>
                                <div className={styles.editField}>
                                    <label className={styles.editLabel}>Rating (1-5)</label>
                                    <select name="rating" value={editForm.rating} onChange={handleEditChange} className={styles.editInput}>
                                        <option value="">No rating</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                            </select>
                            </div>
                                <div className={styles.editField}>
                                    <label className={styles.editLabel}>Pages</label>
                                    <input name="pages" type="number" value={editForm.pages} onChange={handleEditChange} className={styles.editInput} min="0" />
                            </div>
                            </div>
                            <div className={styles.editField}>
                                <label className={styles.editLabel}>Cover Image URL</label>
                                <input name="coverUrl" value={editForm.coverUrl} onChange={handleEditChange} className={styles.editInput} placeholder="https://example.com/cover.jpg" />
                            </div>
                            <div className={styles.editField}>
                                <label className={styles.editLabel}>Date Finished</label>
                                <input name="dateFinished" type="date" value={editForm.dateFinished} onChange={handleEditChange} className={styles.editInput} />
                            </div>
                            <div className={styles.editField}>
                                <label className={styles.editLabel}>Notes</label>
                                <textarea name="notes" value={editForm.notes} onChange={handleEditChange} className={styles.editInput} style={{ minHeight: '70px' }} />
                            </div>
                            <div className={styles.editField}>
                                <label className={styles.editLabel}>Favourite Quote</label>
                                <textarea name="favouriteQuote" value={editForm.favouriteQuote} onChange={handleEditChange} className={styles.editInput} style={{ minHeight: '70px' }} placeholder="A favourite quote from the book" />
                            </div>
                            <div className={styles.editFormButtons}>
                                <button type="button" onClick={closeEditModal} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Save Changes</button>
                            </div>
                            </form>
                            </div>
                            </div>
            )}

            <footer className={styles.footer}>
                <p>&ldquo;A reader lives a thousand lives before they die.&rdquo; &mdash; George R.R. Martin</p>
                </footer>
                </div>
    )
}
