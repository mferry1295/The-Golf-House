import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Experience from './pages/Experience'
import Suites from './pages/Suites'
import Dining from './pages/Dining'
import Wellness from './pages/Wellness'
import PropertyPlanner from './pages/PropertyPlanner'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/suites" element={<Suites />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/property-planner" element={<PropertyPlanner />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
