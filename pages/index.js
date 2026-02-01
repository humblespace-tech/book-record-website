import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from '../styles/styles/Home.module.css'

export default function Home() {
          const [books, setBooks] = useState([])
          const [loading, setLoading] = useState(true)

  useEffect(() => {
              fetch('/api/books')
                .then(res => res.json())
                .then(data => {
                                setBooks(data)
                                setLoading(false)
                })
                .catch(() => setLoading(false))
  }, [])

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
          Your personal library management system
          </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Search & Filter</h3>
                    <p>Find books by title, author, or genre</p>
          </div>

          <div className={styles.card}>
            <h3>Statistics</h3>
                    <p>View your reading habits and collection stats</p>
          </div>
          </div>

        <Link href="/add-book">
                    <button className={styles.addBookBtn}>+ Add a Book</button>
          </Link>

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
                                             <h3 className={styles.bookTitle}>{book.title}</h3>
                           <p className={styles.bookAuthor}>by {book.author}</p>
         {book.genre && <span className={styles.bookGenre}>{book.genre}</span>}
          {book.rating > 0 && (
                                      <p className={styles.bookRating}>
          {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
          </p>
                            )}
         {book.notes && <p className={styles.bookNotes}>{book.notes}</p>}
                 </div>
                        ))}
         </div>
                   )}
        </section>
                </main>

      <footer className={styles.footer}>
        <p>humblespace © 2025</p>
                </footer>
                </div>
          )
}
