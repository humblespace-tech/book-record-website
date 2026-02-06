import Head from 'next/head'
import { AuthProvider } from '../lib/AuthContext'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          font-family: 'Lora', Georgia, serif;
          color: #5D4E37;
          background: #F5EBE0;
          -webkit-font-smoothing: antialiased;
        }
        ::selection {
          background: rgba(212, 119, 78, 0.3);
          color: #3E2723;
        }
      `}</style>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
