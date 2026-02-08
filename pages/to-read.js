import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../lib/AuthContext'

export default function ToRead() {
    const { isAdmin } = useAuth()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [fetchingCover, setFetchingCover] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetch('/api/to-read')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setEntries(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    // Auto-fetch cover when title or author changes
    useEffect(() => {
        if (title && author && title.trim() && author.trim()) {
            const timer = setTimeout(async () => {
                setFetchingCover(true)
                try {
                    const params = new URLSearchParams({ title, author })
                    const res = await fetch(`/api/covers?${params}`)
                    const data = await res.json()
                    if (data.coverUrl) {
                        setCoverUrl(data.coverUrl)
                    } else {
                        setCoverUrl('')
                    }
                } catch (error) {
                    console.error('Cover fetch error:', error)
                    setCoverUrl('')
                } finally {
                    setFetchingCover(false)
                }
            }, 800)
            return () => clearTimeout(timer)
        } else {
            setCoverUrl('')
        }
    }, [title, author])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !author.trim()) return
        setSubmitting(true)
        setMessage('')
        try {
            const res = await fetch('/api/to-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim(), author: author.trim(), coverUrl }),
            })
            if (res.ok) {
                const newEntry = await res.json()
                setEntries(prev => [newEntry, ...prev])
                setTitle('')
                setAuthor('')
                setCoverUrl('')
                setMessage('Book added to the list!')
                setTimeout(() => setMessage(''), 3000)
            } else {
                const data = await res.json()
                setMessage(data.error || 'Failed to add book')
            }
        } catch (err) {
            setMessage('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const deleteEntry = async (id, entryTitle) => {
        if (!confirm(`Remove "${entryTitle}" from the list?`)) return
        try {
            const res = await fetch('/api/to-read?id=' + id, { method: 'DELETE' })
            if (res.ok) {
                setEntries(entries.filter(e => e._id !== id))
            }
        } catch (err) {
            alert('Failed to remove entry')
        }
    }

    return (
        <div style={s.container}>
            <Head>
                <title>To Read - Humblespace</title>
                <meta name="description" content="Books on my reading radar" />
            </Head>
            <main style={s.main}>
                <Link href="/" style={s.backBtn}>Back to Library</Link>
                <h1 style={s.title}>To Read</h1>
                <p style={s.subtitle}>Books on my radar</p>

                {message && (
                    <p style={{
                        ...s.message,
                        background: message.includes('added') ? 'rgba(168,181,160,0.2)' : 'rgba(180,80,80,0.15)',
                        borderColor: message.includes('added') ? '#A8B5A0' : '#b45050',
                    }}>{message}</p>
                )}

                <div style={s.formCard}>
                    <h2 style={s.formTitle}>Suggest a Book</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={s.row}>
                            <div style={s.field}>
                                <label style={s.label}>Title *</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    style={s.input}
                                    placeholder="Book title"
                                />
                            </div>
                            <div style={s.field}>
                                <label style={s.label}>Author *</label>
                                <input
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    required
                                    style={s.input}
                                    placeholder="Author name"
                                />
                            </div>
                        </div>

                        {fetchingCover && (
                            <div style={s.coverSearching}>Searching for cover...</div>
                        )}

                        {coverUrl && (
                            <div style={s.coverPreview}>
                                <img src={coverUrl} alt="Cover preview" style={s.coverPreviewImg} />
                            </div>
                        )}

                        <button type="submit" disabled={submitting} style={submitting ? { ...s.submitBtn, opacity: 0.6 } : s.submitBtn}>
                            {submitting ? 'Adding...' : 'Add to List'}
                        </button>
                    </form>
                </div>

                <div style={s.divider} />

                {loading ? (
                    <p style={s.loadingText}>Loading list...</p>
                ) : entries.length === 0 ? (
                    <p style={s.emptyText}>No books on the list yet. Be the first to suggest one!</p>
                ) : (
                    <div style={s.list}>
                        {entries.map(entry => (
                            <div key={entry._id} style={s.entryRow}>
                                {entry.coverUrl ? (
                                    <div style={s.entryCover}>
                                        <img src={entry.coverUrl} alt={entry.title} style={s.entryCoverImg} />
                                    </div>
                                ) : (
                                    <div style={s.entryCoverPlaceholder}>
                                        <span style={{ fontSize: '1.5rem' }}>📖</span>
                                    </div>
                                )}
                                <div style={s.entryInfo}>
                                    <h3 style={s.entryTitle}>{entry.title}</h3>
                                    <p style={s.entryAuthor}>by {entry.author}</p>
                                </div>
                                {isAdmin && (
                                    <button onClick={() => deleteEntry(entry._id, entry.title)} style={s.deleteBtn}>
                                        &times;
                                    </button>
                                )}
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
        maxWidth: '700px',
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
        margin: '0 0 2rem',
        fontFamily: "'Lora', Georgia, serif",
    },
    message: {
        padding: '0.8rem 1.2rem',
        borderRadius: '12px',
        border: '2px solid',
        fontSize: '0.9rem',
        fontFamily: "'Lora', Georgia, serif",
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    formCard: {
        background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.3) 100%)',
        border: '3px solid #F4D9C6',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(93, 78, 55, 0.08)',
        marginBottom: '2rem',
    },
    formTitle: {
        fontSize: '1.4rem',
        color: '#3E2723',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
        margin: '0 0 1.2rem',
        textAlign: 'center',
    },
    row: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    field: {
        flex: '1',
        minWidth: '200px',
        marginBottom: '0.75rem',
    },
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
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '2px solid #F4D9C6',
        background: 'rgba(255, 253, 247, 0.8)',
        color: '#3E2723',
        fontSize: '0.95rem',
        fontFamily: "'Lora', Georgia, serif",
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        outline: 'none',
    },
    coverSearching: {
        textAlign: 'center',
        color: '#C9A961',
        fontSize: '0.9rem',
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: 'italic',
        padding: '0.5rem 0',
    },
    coverPreview: {
        textAlign: 'center',
        padding: '0.5rem 0',
    },
    coverPreviewImg: {
        maxWidth: '80px',
        height: 'auto',
        borderRadius: '10px',
        boxShadow: '0 3px 10px rgba(62, 39, 35, 0.15)',
    },
    submitBtn: {
        width: '100%',
        padding: '0.85rem',
        borderRadius: '25px',
        border: 'none',
        background: '#D4774E',
        color: '#FFFDF7',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(212, 119, 78, 0.3)',
        fontFamily: "'Merriweather', Georgia, serif",
        transition: 'all 0.3s ease',
        marginTop: '0.5rem',
    },
    divider: {
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #F4D9C6, #D4774E, #F4D9C6, transparent)',
        borderRadius: '2px',
        margin: '0.5rem 0 2rem',
    },
    loadingText: {
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#8B7E66',
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: 'italic',
        marginTop: '2rem',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#8B7E66',
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: 'italic',
        marginTop: '2rem',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    entryRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.15) 100%)',
        border: '2px solid #F4D9C6',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(93, 78, 55, 0.05)',
        transition: 'all 0.3s ease',
    },
    entryCover: {
        width: '60px',
        flexShrink: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(62, 39, 35, 0.12)',
    },
    entryCoverImg: {
        width: '100%',
        height: 'auto',
        display: 'block',
    },
    entryCoverPlaceholder: {
        width: '60px',
        height: '80px',
        flexShrink: 0,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #D4774E 0%, #3E2723 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    entryInfo: {
        flex: 1,
        minWidth: 0,
    },
    entryTitle: {
        margin: '0 0 0.2rem',
        fontSize: '1.1rem',
        color: '#3E2723',
        fontWeight: '700',
        fontFamily: "'Playfair Display', Georgia, serif",
        lineHeight: 1.3,
    },
    entryAuthor: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#8B7E66',
        fontStyle: 'italic',
        fontFamily: "'Lora', Georgia, serif",
    },
    deleteBtn: {
        flexShrink: 0,
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '2px solid #b45050',
        background: 'transparent',
        color: '#b45050',
        fontSize: '1.2rem',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        fontFamily: "'Merriweather', Georgia, serif",
    },
}
