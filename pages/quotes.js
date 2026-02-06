import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Quotes() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/books')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setBooks(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const booksWithQuotes = books.filter(book => book.favouriteQuote && book.favouriteQuote.trim())

    return (
        <div style={s.container}>
            <Head>
                <title>Favourite Quotes - humblespace</title>
                <meta name="description" content="Favourite quotes from your book collection" />
            </Head>
            <main style={s.main}>
                <Link href="/" style={s.backBtn}>Back to Library</Link>
                <h1 style={s.title}>Favourite Quotes</h1>
                <p style={s.subtitle}>Words worth remembering</p>

                {loading ? (
                    <p style={s.loadingText}>Loading quotes...</p>
                ) : booksWithQuotes.length === 0 ? (
                    <p style={s.loadingText}>No quotes saved yet. Add a favourite quote when adding or editing a book!</p>
                ) : (
                    <div style={s.quotesList}>
                        {booksWithQuotes.map(book => (
                            <div key={book._id} style={s.quoteCard}>
                                <div style={s.quoteIconLarge}>&ldquo;</div>
                                <p style={s.quoteTextLarge}>{book.favouriteQuote}</p>
                                <div style={s.quoteAttribution}>
                                    <p style={s.quoteBookTitle}>{book.title}</p>
                                    <p style={s.quoteBookAuthor}>by {book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
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
    main: {
        maxWidth: '900px',
        margin: '0 auto',
        color: '#5D4E37',
        position: 'relative',
        zIndex: 1,
    },
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
        margin: '1.5rem 0 0.3rem',
        color: '#3E2723',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
        letterSpacing: '-0.5px',
    },
    subtitle: {
        color: '#8B7E66',
        fontSize: '1.1rem',
        margin: '0 0 2.5rem',
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
    quotesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    quoteCard: {
        background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.3) 100%)',
        border: '3px solid #F4D9C6',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        position: 'relative',
        transition: 'all 0.3s ease',
    },
    quoteIconLarge: {
        fontSize: '3.5rem',
        color: '#C9A961',
        fontFamily: "'Playfair Display', Georgia, serif",
        lineHeight: 0.5,
        marginBottom: '0.8rem',
        opacity: 0.5,
    },
    quoteTextLarge: {
        fontSize: '1.15rem',
        color: '#3E2723',
        lineHeight: 1.8,
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: 'italic',
        margin: '0 0 1.2rem 0',
    },
    quoteAttribution: {
        borderTop: '2px solid #F4D9C6',
        paddingTop: '0.8rem',
    },
    quoteBookTitle: {
        margin: '0 0 0.2rem 0',
        fontSize: '1rem',
        color: '#D4774E',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
    },
    quoteBookAuthor: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#8B7E66',
        fontStyle: 'italic',
        fontFamily: "'Lora', Georgia, serif",
    },
}
