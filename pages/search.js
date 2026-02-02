import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Search() {
      const [books, setBooks] = useState([])
      const [loading, setLoading] = useState(true)
      const [query, setQuery] = useState('')
      const [genre, setGenre] = useState('')
      const [ratingFilter, setRatingFilter] = useState('')
      const [sortBy, setSortBy] = useState('newest')

    useEffect(() => {
              fetch('/api/books')
                  .then(res => res.json())
                  .then(data => {
                                    if (Array.isArray(data)) setBooks(data)
                                    setLoading(false)
                  })
                  .catch(() => setLoading(false))
    }, [])

    const genres = [...new Set(books.map(b => b.genre).filter(Boolean))].sort()

    const filtered = books
          .filter(book => {
                        const q = query.toLowerCase()
                        const matchesQuery = !q || 
                                          book.title.toLowerCase().includes(q) || 
                                          book.author.toLowerCase().includes(q) ||
                                          (book.isbn && book.isbn.toLowerCase().includes(q)) ||
                                          (book.notes && book.notes.toLowerCase().includes(q))
                        const matchesGenre = !genre || book.genre === genre
                        const matchesRating = !ratingFilter || book.rating >= parseInt(ratingFilter)
                        return matchesQuery && matchesGenre && matchesRating
          })
          .sort((a, b) => {
                        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
                        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
                        if (sortBy === 'title') return a.title.localeCompare(b.title)
                        if (sortBy === 'author') return a.author.localeCompare(b.author)
                        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
                        return 0
          })

    const clearFilters = () => {
              setQuery('')
              setGenre('')
              setRatingFilter('')
              setSortBy('newest')
    }

    const hasFilters = query || genre || ratingFilter || sortBy !== 'newest'

    return (
              <div style={s.container}>
            <Head>
                      <title>Search - humblespace</title>
                  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
              <main style={s.main}>
                <Link href="/" style={s.backLink}>Back to Home</Link>
                  <h1 style={s.title}>Search & Filter</h1>
                  <p style={s.subtitle}>Find books in your collection</p>

                <div style={s.searchBar}>
                    <input
                          type="text"
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                                                    placeholder="Search by title, author, ISBN, or notes..."
                          style={s.searchInput}
                    />
                      </div>

                <div style={s.filters}>
                    <div style={s.filterItem}>
                        <label style={s.filterLabel}>Genre</label>
                        <select value={genre} onChange={e => setGenre(e.target.value)} style={s.filterSelect}>
                            <option value="">All genres</option>
{genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            </div>
                                <div style={s.filterItem}>
                                    <label style={s.filterLabel}>Min Rating</label>
                                    <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={s.filterSelect}>
                                        <option value="">Any</option>
                                        <option value="1">1+ stars</option>
                                        <option value="2">2+ stars</option>
                                        <option value="3">3+ stars</option>
                                        <option value="4">4+ stars</option>
                                        <option value="5">5 stars</option>
            </select>
            </div>
                                <div style={s.filterItem}>
                                    <label style={s.filterLabel}>Sort by</label>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={s.filterSelect}>
                                        <option value="newest">Newest first</option>
                                        <option value="oldest">Oldest first</option>
                                        <option value="title">Title A-Z</option>
                                        <option value="author">Author A-Z</option>
                                        <option value="rating">Highest rated</option>
            </select>
            </div>
            {hasFilters && (
                          <button onClick={clearFilters} style={s.clearBtn}>Clear all</button>
                                 )}
 </div>

 {loading ? (
                       <p style={s.loadingText}>Loading books...</p>
                   ) : (
                       <>
                           <p style={s.resultCount}>
 {filtered.length === books.length
                                  ? `${books.length} book${books.length !== 1 ? 's' : ''} in your library`
                                   : `${filtered.length} of ${books.length} book${books.length !== 1 ? 's' : ''} match`}
 </p>

 {filtered.length === 0 ? (
                               <div style={s.emptyState}>
                                   <p style={s.emptyTitle}>No books found</p>
                                   <p style={s.emptyText}>Try adjusting your search or filters</p>
   </div>
                           ) : (
                               <div style={s.bookGrid}>
 {filtered.map(book => (
                                       <div key={book._id} style={s.bookCard}>
                                        <h3 style={s.bookTitle}>{book.title}</h3>
                                         <p style={s.bookAuthor}>by {book.author}</p>
                                         <div style={s.bookMeta}>
 {book.genre && <span style={s.badge}>{book.genre}</span>}
 {book.pages > 0 && <span style={s.badge}>{book.pages} pages</span>}
 {book.rating > 0 && (
                                                   <span style={s.ratingText}>
 {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
 </span>
                                             )}
</div>
{book.notes && <p style={s.bookNotes}>{book.notes}</p>}
 {book.createdAt && (
                                               <p style={s.bookDate}>Added {new Date(book.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                          )}
 </div>
                                 ))}
</div>
                        )}
</>
                )}
</main>
                  </div>
    )
}

const s = {
      container: { minHeight: '100vh', background: 'linear-gradient(160deg, #faf6f1 0%, #f0e6d8 40%, #e8ddd0 100%)', padding: '2rem' },
      main: { maxWidth: '900px', margin: '0 auto', color: '#3d2c1e' },
      backLink: { color: '#7a6654', textDecoration: 'none', fontSize: '0.9rem' },
      title: { fontSize: '2.5rem', margin: '1rem 0 0.3rem', color: '#3d2c1e', fontWeight: '300', fontFamily: "'Playfair Display', Georgia, serif" },
      subtitle: { color: '#7a6654', fontSize: '1.1rem', margin: '0 0 2rem' },
      searchBar: { marginBottom: '1.2rem' },
      searchInput: { width: '100%', padding: '0.9rem 1.2rem', borderRadius: '50px', border: '1px solid rgba(193,170,145,0.4)', background: 'rgba(255,255,255,0.7)', color: '#3d2c1e', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
      filters: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' },
      filterItem: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
      filterLabel: { fontSize: '0.75rem', color: '#7a6654', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
      filterSelect: { padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(193,170,145,0.4)', background: 'rgba(255,255,255,0.7)', color: '#3d2c1e', fontSize: '0.9rem', cursor: 'pointer' },
      clearBtn: { padding: '0.55rem 1.2rem', borderRadius: '50px', border: '1px solid rgba(193,170,145,0.5)', background: 'transparent', color: '#7a6654', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-end' },
      resultCount: { fontSize: '0.9rem', color: '#7a6654', marginBottom: '1rem' },
      loadingText: { textAlign: 'center', fontSize: '1.1rem', color: '#7a6654', marginTop: '3rem' },
      emptyState: { textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.4)', borderRadius: '14px', border: '1px solid rgba(193,170,145,0.2)' },
      emptyTitle: { fontSize: '1.3rem', color: '#3d2c1e', margin: '0 0 0.5rem', fontWeight: '500' },
      emptyText: { fontSize: '0.95rem', color: '#7a6654', margin: 0 },
      bookGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' },
      bookCard: { padding: '1.4rem', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(193,170,145,0.3)', borderRadius: '14px', transition: 'all 0.3s ease' },
      bookTitle: { margin: '0 0 0.4rem', fontSize: '1.2rem', color: '#3d2c1e', fontWeight: '600' },
      bookAuthor: { margin: '0 0 0.6rem', fontSize: '0.95rem', color: '#7a6654', fontStyle: 'italic' },
      bookMeta: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' },
      badge: { display: 'inline-block', background: 'rgba(166,124,91,0.15)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', color: '#7a6654' },
      ratingText: { fontSize: '0.95rem', color: '#c49a6c' },
      bookNotes: { margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#8a7564', lineHeight: '1.4', fontStyle: 'italic' },
      bookDate: { margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#a99585' },
}
