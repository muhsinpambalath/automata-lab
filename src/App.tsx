import Navbar from './components/Navbar'
import Hero from './components/Hero'


function App() {
  return (
    <>
      <div className='page'>
        <div className='site-container'>
          <Navbar />
        </div>
        <Hero />
      </div>
    </>
  )
}

export default App