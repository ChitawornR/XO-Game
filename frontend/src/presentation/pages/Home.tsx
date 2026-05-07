import InputSizeForm from '../components/InputSizeForm'

function Home() {
  return (
    <div>
      <h2
        style={{
          textAlign: 'center',
          marginTop: '36px',
          marginBottom: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        XO Game — Select Mode
      </h2>
      <InputSizeForm />
    </div>
  )
}

export default Home
