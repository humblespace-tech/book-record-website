import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Statistics() {
      const [books, setBooks] = useState([])
      const [loading, setLoading] = useState(true)
      const [hoveredDot, setHoveredDot] = useState(null)
      const [hoveredSlice, setHoveredSlice] = useState(null)

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
              const now = new Date()
              const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
              const lastMonthKey = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0')
              const lastKey = sortedKeys[sortedKeys.length - 1]
              const isActive = lastKey === thisMonth || lastKey === lastMonthKey
              return { current: isActive ? current : 0, longest }
    }

    // Compute genre breakdown
    const getGenreBreakdown = () => {
              const genres = {}
              books.forEach(book => {
                  const g = book.genre || 'Uncategorized'
                  genres[g] = (genres[g] || 0) + 1
              })
              return Object.entries(genres)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
    }

    const totalPages = books.reduce((sum, b) => sum + (parseInt(b.pages) || 0), 0)
    const avgPagesPerBook = books.length > 0 ? Math.round(totalPages / books.length) : 0
      const streaks = getStreaks()
      const monthlyData = getMonthlyData()
    const genreBreakdown = getGenreBreakdown()

    // SVG chart helpers
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const svgW = 800
    const svgH = 250
    const pad = { top: 30, right: 40, bottom: 40, left: 50 }
    const chartW = svgW - pad.left - pad.right
    const chartH = svgH - pad.top - pad.bottom
    const maxVal = Math.max(...monthlyData.map(d => d[1]), 1)

    const getPoint = (i) => {
        const x = pad.left + (i * (chartW / Math.max(monthlyData.length - 1, 1)))
        const y = pad.top + chartH - (monthlyData[i][1] / maxVal) * chartH
        return { x, y }
    }

    const linePath = monthlyData.map((_, i) => {
        const { x, y } = getPoint(i)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

    const areaPath = monthlyData.length > 0
        ? `M ${pad.left} ${pad.top + chartH} ` +
          monthlyData.map((_, i) => { const { x, y } = getPoint(i); return `L ${x} ${y}` }).join(' ') +
          ` L ${pad.left + chartW} ${pad.top + chartH} Z`
        : ''

    // Donut chart helpers
    const genreColors = ['#D4774E', '#8B9D83', '#C9A961', '#8B7E66', '#5D4E37', '#A8B5A0']
    const pieR = 100
    const pieInner = 55
    const pieCX = 150
    const pieCY = 150

    const getSlicePath = (startAngle, endAngle) => {
        const startRad = (startAngle - 90) * (Math.PI / 180)
        const endRad = (endAngle - 90) * (Math.PI / 180)
        const largeArc = endAngle - startAngle > 180 ? 1 : 0

        const x1 = pieCX + pieR * Math.cos(startRad)
        const y1 = pieCY + pieR * Math.sin(startRad)
        const x2 = pieCX + pieR * Math.cos(endRad)
        const y2 = pieCY + pieR * Math.sin(endRad)
        const ix1 = pieCX + pieInner * Math.cos(endRad)
        const iy1 = pieCY + pieInner * Math.sin(endRad)
        const ix2 = pieCX + pieInner * Math.cos(startRad)
        const iy2 = pieCY + pieInner * Math.sin(startRad)

        return [
            `M ${x1} ${y1}`,
            `A ${pieR} ${pieR} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${pieInner} ${pieInner} 0 ${largeArc} 0 ${ix2} ${iy2}`,
            'Z'
        ].join(' ')
    }

    let currentAngle = 0
    const slices = genreBreakdown.map(([genre, count], i) => {
        const pct = (count / books.length) * 360
        const start = currentAngle
        const end = currentAngle + pct
        currentAngle = end
        return { genre, count, start, end, color: genreColors[i % genreColors.length], pct: ((count / books.length) * 100).toFixed(1) }
    })

    return (
              <div style={s.container}>
            <Head>
                      <title>Statistics - humblespace</title>
      </Head>
              <main style={s.main}>
                <Link href="/" style={s.backBtn}>
                    Back to Library
                </Link>
                  <h1 style={s.title}>Reading Statistics</h1>
                  <p style={s.subtitle}>Your reading journey at a glance</p>

  {loading ? (
                        <p style={s.loadingText}>Loading statistics...</p>
                    ) : books.length === 0 ? (
                        <p style={s.loadingText}>No books yet. Add some books to see your stats!</p>
                   ) : (
                                         <>
                                             {/* Stat Cards */}
                                             <div style={s.statCards}>
                                                 <div style={s.statCard} className="stat-card">
                                                     <div style={s.statCardGlow} />
                                                     <p style={s.statValue}>{books.length}</p>
                                   <p style={s.statLabel}>Total Books</p>
                     </div>
                               <div style={s.statCard} className="stat-card">
                                                     <div style={s.statCardGlow} />
                                                     <p style={s.statValue}>{totalPages.toLocaleString()}</p>
                                  <p style={s.statLabel}>Pages Consumed</p>
    </div>
                              <div style={s.statCard} className="stat-card">
                                <div style={s.statCardGlow} />
                                <p style={s.statValue}>{streaks.current}</p>
                                <p style={s.statLabel}>Current Streak</p>
  </div>
                            <div style={s.statCard} className="stat-card">
                                <div style={s.statCardGlow} />
                                <p style={s.statValue}>{avgPagesPerBook}</p>
                                <p style={s.statLabel}>Avg Pages / Book</p>
  </div>
  </div>

                        {/* Reading Cadence SVG Chart */}
                        {monthlyData.length > 0 && (
                        <div style={s.chartSection}>
                            <h2 style={s.sectionTitle}>Reading Cadence</h2>
                            <p style={s.sectionSubtitle}>Books added per month</p>
                            <div style={s.chartContainer}>
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} style={s.svg} preserveAspectRatio="xMidYMid meet">
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#D4774E" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#D4774E" stopOpacity="0.05" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4].map(i => {
                                        const y = pad.top + (chartH / 4) * i
                                        const val = Math.round(maxVal - (maxVal / 4) * i)
                                        return (
                                            <g key={i}>
                                                <line x1={pad.left} y1={y} x2={svgW - pad.right} y2={y} stroke="#F4D9C6" strokeWidth="1" strokeDasharray="4" />
                                                <text x={pad.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8B7E66" fontFamily="'Lora', Georgia, serif">{val}</text>
                                            </g>
                                        )
                                    })}

                                    {/* Area */}
                                    <path d={areaPath} fill="url(#areaGrad)" />

                                    {/* Line */}
                                    <path d={linePath} fill="none" stroke="#D4774E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Dots and labels */}
                                    {monthlyData.map((d, i) => {
                                        const { x, y } = getPoint(i)
                                        const parts = d[0].split('-')
                                        const label = monthNames[parseInt(parts[1]) - 1] + " '" + parts[0].slice(2)
                                        const step = Math.max(1, Math.floor(monthlyData.length / 8))
                                        const showLabel = i % step === 0 || i === monthlyData.length - 1
                                        const isHovered = hoveredDot === i
                                        return (
                                            <g key={i}
                                                onMouseEnter={() => setHoveredDot(i)}
                                                onMouseLeave={() => setHoveredDot(null)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <circle cx={x} cy={y} r={isHovered ? 8 : 5} fill="#D4774E" stroke="white" strokeWidth="2" style={{ transition: 'r 0.2s ease' }} />
                                                {isHovered && (
                                                    <text x={x} y={y - 14} textAnchor="middle" fontSize="13" fontWeight="700" fill="#3E2723" fontFamily="'Playfair Display', Georgia, serif">{d[1]}</text>
                                                )}
                                                {showLabel && (
                                                    <text x={x} y={svgH - 8} textAnchor="middle" fontSize="10" fill="#8B7E66" fontFamily="'Merriweather', Georgia, serif">{label}</text>
                                                )}
                                            </g>
                                        )
                                    })}
                                </svg>
                            </div>
  </div>
                        )}

                        {/* Genre Breakdown Donut Chart */}
                        {genreBreakdown.length > 0 && (
                        <div style={s.chartSection}>
                            <h2 style={s.sectionTitle}>Favourite Genres</h2>
                            <p style={s.sectionSubtitle}>What you love to read</p>
                            <div style={s.pieSection}>
                                <svg viewBox="0 0 300 300" style={s.pieSvg}>
                                    {slices.map((slice, i) => (
                                        <path
                                            key={i}
                                            d={getSlicePath(slice.start, slice.end)}
                                            fill={slice.color}
                                            stroke="#FFFDF7"
                                            strokeWidth="2"
                                            style={{
                                                transition: 'opacity 0.3s ease, transform 0.3s ease',
                                                opacity: hoveredSlice !== null && hoveredSlice !== i ? 0.5 : 1,
                                                transformOrigin: `${pieCX}px ${pieCY}px`,
                                                transform: hoveredSlice === i ? 'scale(1.05)' : 'scale(1)',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={() => setHoveredSlice(i)}
                                            onMouseLeave={() => setHoveredSlice(null)}
                                        />
                                    ))}
                                    {/* Center circle */}
                                    <circle cx={pieCX} cy={pieCY} r={pieInner - 5} fill="#FFFDF7" />
                                    <text x={pieCX} y={pieCY - 6} textAnchor="middle" fontSize="32" fontWeight="700" fill="#D4774E" fontFamily="'Playfair Display', Georgia, serif">{books.length}</text>
                                    <text x={pieCX} y={pieCY + 16} textAnchor="middle" fontSize="11" fill="#8B7E66" fontFamily="'Merriweather', Georgia, serif" textTransform="uppercase" letterSpacing="1">BOOKS</text>
                                </svg>

                                <div style={s.legend}>
                                    {slices.map((slice, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                ...s.legendItem,
                                                opacity: hoveredSlice !== null && hoveredSlice !== i ? 0.5 : 1,
                                                transition: 'opacity 0.3s ease',
                                            }}
                                            onMouseEnter={() => setHoveredSlice(i)}
                                            onMouseLeave={() => setHoveredSlice(null)}
                                        >
                                            <div style={{ ...s.legendColor, background: slice.color }} />
                                            <div>
                                                <span style={s.legendGenre}>{slice.genre}</span>
                                                <span style={s.legendCount}> {slice.count} book{slice.count !== 1 ? 's' : ''}</span>
                                                <span style={s.legendPct}> {slice.pct}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
  </div>
                        )}

                        {/* Monthly Activity Grid */}
                        <div style={s.chartSection}>
                            <h2 style={s.sectionTitle}>Monthly Activity</h2>
                            <p style={s.sectionSubtitle}>Your reading heatmap</p>
                            <div style={s.streakGrid}>
{monthlyData.map(([month, count]) => {
                                      const parts = month.split('-')
                                      const label = monthNames[parseInt(parts[1]) - 1] + " '" + parts[0].slice(2)
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

                <style jsx>{`
                    .stat-card:hover {
                        transform: translateY(-5px) rotate(-1deg) !important;
                        box-shadow: 0 15px 40px rgba(93, 78, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
                    }
                `}</style>
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
      statCards: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
      },
      statCard: {
          background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.3) 100%)',
          border: '3px solid #F4D9C6',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(93, 78, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
      },
      statCardGlow: {
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, #C9A961, transparent)',
          opacity: 0.2,
          borderRadius: '50%',
          pointerEvents: 'none',
      },
      statValue: {
          fontSize: '3.5rem',
          fontWeight: '700',
          color: '#D4774E',
          margin: '0 0 0.5rem',
          fontFamily: "'Playfair Display', Georgia, serif",
          lineHeight: 1,
      },
      statLabel: {
          fontSize: '1rem',
          color: '#8B7E66',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: '600',
          fontFamily: "'Merriweather', Georgia, serif",
      },
      sectionTitle: {
          fontSize: '1.8rem',
          color: '#3E2723',
          fontWeight: '700',
          margin: '0 0 0.3rem',
          fontFamily: "'Playfair Display', Georgia, serif",
      },
      sectionSubtitle: {
          color: '#8B7E66',
          fontSize: '0.95rem',
          margin: '0 0 1.2rem',
          fontFamily: "'Lora', Georgia, serif",
      },
      chartSection: { marginBottom: '3rem' },
      chartContainer: {
          background: '#FFFDF7',
          borderRadius: '20px',
          padding: '1.5rem 1rem 0.5rem',
          border: '2px solid #F4D9C6',
          boxShadow: '0 8px 25px rgba(93, 78, 55, 0.06)',
      },
      svg: {
          width: '100%',
          height: 'auto',
          display: 'block',
      },
      // Donut chart
      pieSection: {
          display: 'flex',
          gap: '3rem',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          background: '#FFFDF7',
          borderRadius: '20px',
          padding: '2rem',
          border: '2px solid #F4D9C6',
          boxShadow: '0 8px 25px rgba(93, 78, 55, 0.06)',
      },
      pieSvg: {
          width: '260px',
          height: '260px',
      },
      legend: {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
      },
      legendItem: {
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '1rem',
          cursor: 'pointer',
      },
      legendColor: {
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          flexShrink: 0,
      },
      legendGenre: {
          fontWeight: '600',
          color: '#3E2723',
          fontFamily: "'Merriweather', Georgia, serif",
      },
      legendCount: {
          color: '#8B7E66',
          fontSize: '0.9rem',
          fontFamily: "'Lora', Georgia, serif",
      },
      legendPct: {
          color: '#D4774E',
          fontWeight: '700',
          marginLeft: '0.3rem',
          fontFamily: "'Lora', Georgia, serif",
      },
      // Activity grid
      streakGrid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
          gap: '0.6rem',
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
