import Head from 'next/head'
import styles from '../../styles/styles/Home.module.css'
export default function Home() {
    return (
          <div className={styles.container}>
      <Head>
              <title>Book Record Website</title>
          <meta name="description" content="Manage your book collection" />
              <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Book Record Website
      </h1>

        <p className={styles.description}>
          Your personal library management system with MongoDB
      </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Add Books</h3>
              <p>Record new books with details like title, author, ISBN</p>
      </div>

          <div className={styles.card}>
            <h3>Search & Filter</h3>
              <p>Find books by title, author, or genre</p>
      </div>

          <div className={styles.card}>
            <h3>Rating System</h3>
              <p>Rate and review your favorite reads</p>
      </div>

          <div className={styles.card}>
            <h3>Statistics</h3>
              <p>View your reading habits and collection stats</p>
      </div>
      </div>
      </main>

      <footer className={styles.footer}>
        <p>Book Record Website © 2024</p>
      </footer>
      </div>
    )
}
