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
      container: {
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #FFFDF7 0%, #F5EBE0 50%, #F0E4D6 100%)',
          padding: '2rem',
          position: 'relative',
      },
      main: { maxWidth: '900px', margin: '0 auto', color: '#5D4E37', position: 'relative', zIndex: 1 },
      backLink: {
          color: '#D4774E',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: "'Merriweather', Georgia, serif",
          fontWeight: '600',
      },
      title: {
          fontSize: '2.8rem',
          margin: '1rem 0 0.3rem',
          color: '#3E2723',
          fontWeight: '700',
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '-0.5px',
      },
      subtitle: {
          color: '#8B7E66',
          fontSize: '1.1rem',
          margin: '0 0 2rem',
          fontFamily: "'Lora', Georgia, serif",
      },
      searchBar: { marginBottom: '1.5rem' },
      searchInput: {
          width: '100%',
          padding: '0.9rem 1.5rem',
          borderRadius: '30px',
          border: '2px solid #F4D9C6',
          background: 'rgba(255, 253, 247, 0.8)',
          color: '#3E2723',
          fontSize: '1rem',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: "'Lora', Georgia, serif",
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      },
      filters: {
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
      },
      filterItem: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
      filterLabel: {
          fontSize: '0.72rem',
          color: '#8B7E66',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600',
          fontFamily: "'Merriweather', Georgia, serif",
      },
      filterSelect: {
          padding: '0.55rem 0.8rem',
          borderRadius: '12px',
          border: '2px solid #F4D9C6',
          background: 'rgba(255, 253, 247, 0.8)',
          color: '#3E2723',
          fontSize: '0.9rem',
          cursor: 'pointer',
          fontFamily: "'Lora', Georgia, serif",
          transition: 'border-color 0.3s ease',
      },
      clearBtn: {
          padding: '0.55rem 1.2rem',
          borderRadius: '25px',
          border: '2px solid #D4774E',
          background: 'transparent',
          color: '#D4774E',
          fontSize: '0.82rem',
          cursor: 'pointer',
          fontWeight: '600',
          alignSelf: 'flex-end',
          fontFamily: "'Merriweather', Georgia, serif",
          transition: 'all 0.3s ease',
      },
      resultCount: {
          fontSize: '0.9rem',
          color: '#8B7E66',
          marginBottom: '1rem',
          fontFamily: "'Lora', Georgia, serif",
      },
      loadingText: {
          textAlign: 'center',
          fontSize: '1.1rem',
          color: '#8B7E66',
          marginTop: '3rem',
          fontFamily: "'Lora', Georgia, serif",
          fontStyle: 'italic',
      },
      emptyState: {
          textAlign: 'center',
          padding: '3rem',
          background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.15) 100%)',
          borderRadius: '20px',
          border: '2px solid #F4D9C6',
          boxShadow: '0 10px 30px rgba(93, 78, 55, 0.06)',
      },
      emptyTitle: {
          fontSize: '1.3rem',
          color: '#3E2723',
          margin: '0 0 0.5rem',
          fontWeight: '700',
          fontFamily: "'Playfair Display', Georgia, serif",
      },
      emptyText: {
          fontSize: '0.95rem',
          color: '#8B7E66',
          margin: 0,
          fontFamily: "'Lora', Georgia, serif",
      },
      bookGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
      },
      bookCard: {
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.15) 100%)',
          border: '2px solid #F4D9C6',
          borderRadius: '15px',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: '0 8px 25px rgba(93, 78, 55, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      bookTitle: {
          margin: '0 0 0.4rem',
          fontSize: '1.2rem',
          color: '#3E2723',
          fontWeight: '700',
          fontFamily: "'Playfair Display', Georgia, serif",
      },
      bookAuthor: {
          margin: '0 0 0.6rem',
          fontSize: '0.9rem',
          color: '#8B7E66',
          fontStyle: 'italic',
          fontFamily: "'Lora', Georgia, serif",
      },
      bookMeta: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' },
      badge: {
          display: 'inline-block',
          background: 'rgba(212, 119, 78, 0.12)',
          padding: '0.25rem 0.7rem',
          borderRadius: '20px',
          fontSize: '0.78rem',
          color: '#D4774E',
          fontWeight: '600',
          fontFamily: "'Merriweather', Georgia, serif",
      },
      ratingText: { fontSize: '0.95rem', color: '#C9A961', letterSpacing: '2px' },
      bookNotes: {
          margin: '0.5rem 0 0',
          fontSize: '0.88rem',
          color: '#8B7E66',
          lineHeight: '1.5',
          fontStyle: 'italic',
          fontFamily: "'Lora', Georgia, serif",
      },
      bookDate: {
          margin: '0.5rem 0 0',
          fontSize: '0.8rem',
          color: '#A8B5A0',
          fontFamily: "'Lora', Georgia, serif",
      },
}
