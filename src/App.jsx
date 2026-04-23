import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Experience from './pages/Experience'
import Cabins from './pages/Cabins'
import Dining from './pages/Dining'
import Wellness from './pages/Wellness'
import PropertyPlanner from './pages/PropertyPlanner'
import SiteSelection from './pages/SiteSelection'
import FinancialModel from './pages/FinancialModel'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/cabins" element={<Cabins />} />
        <Route path="/suites" element={<Cabins />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/property-planner" element={<PropertyPlanner />} />
        <Route path="/site-selection" element={<SiteSelection />} />
        <Route path="/financial-model" element={<FinancialModel />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
