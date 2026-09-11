import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import AutomataLab from './pages/AutomataLab'


function App() {
  return (
    <div className="page">
      <div className="site-container">
          <Navbar />
      </div>


    <Routes>
      <Route path='/' element={<Hero />} />
      <Route path='/lab' element={<AutomataLab />} />
    </Routes>

    
  </div>
  )
}

export default App