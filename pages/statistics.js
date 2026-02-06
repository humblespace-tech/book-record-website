import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Statistics() {
      const [books, setBooks] = useState([])
      const [loading, setLoading] = useState(true)
      const canvasRef = useRef(null)

    useEffect(() => {
              fetch('/api/books')
                  .then(res => res.json())
                  .then(data => {
                                    if (Array.isArray(data)) setBooks(data)
                                    setLoading(false)
                  })
                  .catch(() => setLoading(false))
    }, [])

    // Compute monthly reading data
    const getMonthlyData = () => {
              const months = {}
                        books.forEach(book => {
                                      if (book.createdAt) {
                                                        const d = new Date(book.createdAt)
                                                        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
                                                        months[key] = (months[key] || 0) + 1
                                      }
                        })
              const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]))
              // Fill in gaps
              if (sorted.length > 1) {
                            const filled = []
                                          const start = new Date(sorted[0][0] + '-01')
                            const end = new Date(sorted[sorted.length - 1][0] + '-01')
                            const cur = new Date(start)
                            while (cur <= end) {
                                              const key = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0')
                                              const found = sorted.find(s => s[0] === key)
                                              filled.push([key, found ? found[1] : 0])
                                              cur.setMonth(cur.getMonth() + 1)
                            }
                            return filled
              }
              return sorted
    }

    // Compute streaks
    const getStreaks = () => {
              const months = {}
                        books.forEach(book => {
                                      if (book.createdAt) {
                                                        const d = new Date(book.createdAt)
                                                        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
                                                        months[key] = true
                                      }
                        })
              const sortedKeys = Object.keys(months).sort()
              if (sortedKeys.length === 0) return { current: 0, longest: 0 }

              let longest = 1
              let current = 1
              for (let i = 1; i < sortedKeys.length; i++) {
                            const prev = new Date(sortedKeys[i - 1] + '-01')
                            const cur = new Date(sortedKeys[i] + '-01')
                            prev.setMonth(prev.getMonth() + 1)
                            if (prev.getFullYear() === cur.getFullYear() && prev.getMonth() === cur.getMonth()) {
                                              current++
                                              if (current > longest) longest = current
                            } else {
                                              current = 1
                            }
              }
              // Check if current streak is active (includes current or last month)
              const now = new Date()
              const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
              const lastMonthKey = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0')
              const lastKey = sortedKeys[sortedKeys.length - 1]
              const isActive = lastKey === thisMonth || lastKey === lastMonthKey
              return { current: isActive ? current : 0, longest }
    }

    const totalPages = books.reduce((sum, b) => sum + (parseInt(b.pages) || 0), 0)
      const streaks = getStreaks()
      const monthlyData = getMonthlyData()

    // Draw chart
    useEffect(() => {
              if (!canvasRef.current || monthlyData.length === 0) return
              const canvas = canvasRef.current
              const ctx = canvas.getContext('2d')
              const dpr = window.devicePixelRatio || 1
              const w = canvas.clientWidth
              const h = canvas.clientHeight
              canvas.width = w * dpr
              canvas.height = h * dpr
              ctx.scale(dpr, dpr)

                      const pad = { top: 30, right: 30, bottom: 50, left: 50 }
              const chartW = w - pad.left - pad.right
              const chartH = h - pad.top - pad.bottom
              const maxVal = Math.max(...monthlyData.map(d => d[1]), 1)

                      // Background
                      ctx.fillStyle = 'rgba(255,253,247,0.8)'
              ctx.beginPath()
              ctx.roundRect(0, 0, w, h, 15)
              ctx.fill()

                      // Grid lines
                      ctx.strokeStyle = 'rgba(244,217,198,0.5)'
              ctx.lineWidth = 1
              const gridLines = 4
              for (let i = 0; i <= gridLines; i++) {
                            const y = pad.top + (chartH / gridLines) * i
                            ctx.beginPath()
                            ctx.moveTo(pad.left, y)
                            ctx.lineTo(w - pad.right, y)
                            ctx.stroke()
                            // Y labels
                  ctx.fillStyle = '#8B7E66'
                            ctx.font = "12px 'Lora', Georgia, serif"
                            ctx.textAlign = 'right'
                            ctx.fillText(Math.round(maxVal - (maxVal / gridLines) * i), pad.left - 8, y + 4)
              }

                      // X labels
                      ctx.fillStyle = '#8B7E66'
              ctx.font = "11px 'Merriweather', Georgia, serif"
              ctx.textAlign = 'center'
              const step = Math.max(1, Math.floor(monthlyData.length / 6))
              monthlyData.forEach((d, i) => {
                            if (i % step === 0 || i === monthlyData.length - 1) {
                                              const x = pad.left + (chartW / Math.max(monthlyData.length - 1, 1)) * i
                                              const parts = d[0].split('-')
                                              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                                              ctx.fillText(monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0].slice(2), x, h - pad.bottom + 20)
                            }
              })

                      // Area fill
                      ctx.globalAlpha = 0.12
              ctx.fillStyle = '#D4774E'
              ctx.beginPath()
              monthlyData.forEach((d, i) => {
                            const x = pad.left + (chartW / Math.max(monthlyData.length - 1, 1)) * i
                            const y = pad.top + chartH - (d[1] / maxVal) * chartH
                            if (i === 0) ctx.moveTo(x, y)
                            else ctx.lineTo(x, y)
              })
              ctx.lineTo(pad.left + chartW, pad.top + chartH)
              ctx.lineTo(pad.left, pad.top + chartH)
              ctx.closePath()
              ctx.fill()
              ctx.globalAlpha = 1

                      // Line
                      ctx.strokeStyle = '#D4774E'
              ctx.lineWidth = 2.5
              ctx.lineJoin = 'round'
              ctx.lineCap = 'round'
              ctx.beginPath()
              monthlyData.forEach((d, i) => {
                            const x = pad.left + (chartW / Math.max(monthlyData.length - 1, 1)) * i
                            const y = pad.top + chartH - (d[1] / maxVal) * chartH
                            if (i === 0) ctx.moveTo(x, y)
                            else ctx.lineTo(x, y)
              })
              ctx.stroke()

                      // Dots
                      monthlyData.forEach((d, i) => {
                                    const x = pad.left + (chartW / Math.max(monthlyData.length - 1, 1)) * i
                                    const y = pad.top + chartH - (d[1] / maxVal) * chartH
                                    ctx.fillStyle = '#D4774E'
                                    ctx.beginPath()
                                    ctx.arc(x, y, 5, 0, Math.PI * 2)
                                    ctx.fill()
                                    ctx.fillStyle = '#FFFDF7'
                                    ctx.beginPath()
                                    ctx.arc(x, y, 2.5, 0, Math.PI * 2)
                                    ctx.fill()
                      })
    }, [monthlyData])

    return (
              <div style={s.container}>
            <Head>
                      <title>Statistics - humblespace</title>
      </Head>
              <main style={s.main}>
                <Link href="/" style={s.backLink}>Back to Home</Link>
                  <h1 style={s.title}>Statistics</h1>
                  <p style={s.subtitle}>Your reading habits at a glance</p>

  {loading ? (
                        <p style={s.loadingText}>Loading statistics...</p>
                    ) : books.length === 0 ? (
                        <p style={s.loadingText}>No books yet. Add some books to see your stats!</p>
                   ) : (
                                         <>
                                             <div style={s.statCards}>
                                                 <div style={s.statCard}>
                                                     <p style={s.statValue}>{books.length}</p>
                                   <p style={s.statLabel}>Total Books</p>
                     </div>
                               <div style={s.statCard}>
                                                     <p style={s.statValue}>{totalPages.toLocaleString()}</p>
                                  <p style={s.statLabel}>Pages Read</p>
    </div>
                              <div style={s.statCard}>
                                <p style={s.statValue}>{streaks.current}</p>
                                <p style={s.statLabel}>Current Streak (months)</p>
  </div>
                            <div style={s.statCard}>
                                <p style={s.statValue}>{streaks.longest}</p>
                                <p style={s.statLabel}>Longest Streak (months)</p>
  </div>
  </div>

                        <div style={s.chartSection}>
                            <h2 style={s.chartTitle}>Reading Cadence</h2>
                            <p style={s.chartSubtitle}>Books added per month</p>
                            <canvas ref={canvasRef} style={s.canvas} />
  </div>

                        <div style={s.streakSection}>
                            <h2 style={s.chartTitle}>Monthly Activity</h2>
                            <div style={s.streakGrid}>
{monthlyData.map(([month, count]) => {
                                      const parts = month.split('-')
                                      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                                      const label = monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0].slice(2)
                                      const opacity = count > 0 ? Math.min(0.3 + (count / Math.max(...monthlyData.map(d => d[1]))) * 0.7, 1) : 0.08
                                      return (
                                                                                <div key={month} style={{...s.streakCell, background: `rgba(212,119,78,${opacity})`}}>
                                                             <span style={s.streakCount}>{count}</span>
                                                             <span style={s.streakMonth}>{label}</span>
                 </div>
                                                     )
})}
  </div>
  </div>
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
      loadingText: {
          textAlign: 'center',
          fontSize: '1.1rem',
          color: '#8B7E66',
          marginTop: '3rem',
          fontFamily: "'Lora', Georgia, serif",
          fontStyle: 'italic',
      },
      statCards: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2.5rem',
      },
      statCard: {
          background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.2) 100%)',
          border: '3px solid #F4D9C6',
          borderRadius: '20px',
          padding: '1.8rem 1.5rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(93, 78, 55, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          overflow: 'hidden',
      },
      statValue: {
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#3E2723',
          margin: '0 0 0.3rem',
          fontFamily: "'Playfair Display', Georgia, serif",
      },
      statLabel: {
          fontSize: '0.78rem',
          color: '#8B7E66',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: '600',
          fontFamily: "'Merriweather', Georgia, serif",
      },
      chartSection: { marginBottom: '2.5rem' },
      chartTitle: {
          fontSize: '1.6rem',
          color: '#3E2723',
          fontWeight: '700',
          margin: '0 0 0.3rem',
          fontFamily: "'Playfair Display', Georgia, serif",
      },
      chartSubtitle: {
          color: '#8B7E66',
          fontSize: '0.9rem',
          margin: '0 0 1rem',
          fontFamily: "'Lora', Georgia, serif",
      },
      canvas: {
          width: '100%',
          height: '300px',
          display: 'block',
          borderRadius: '15px',
          border: '2px solid #F4D9C6',
      },
      streakSection: { marginBottom: '2rem' },
      streakGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
          gap: '0.6rem',
          marginTop: '1rem',
      },
      streakCell: {
          borderRadius: '12px',
          padding: '0.8rem 0.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          border: '2px solid rgba(244, 217, 198, 0.3)',
          transition: 'all 0.3s ease',
      },
      streakCount: {
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#3E2723',
          fontFamily: "'Playfair Display', Georgia, serif",
      },
      streakMonth: {
          fontSize: '0.68rem',
          color: '#8B7E66',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          fontFamily: "'Merriweather', Georgia, serif",
          fontWeight: '600',
      },
}
