import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import BottomNav from './components/layout/BottomNav'
import Footer from './components/layout/Footer'
import ChatWidget from './components/chat/ChatWidget'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import ExperiencePage from './pages/ExperiencePage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/hardware" element={<ExperiencePage mode="hardware" />} />
        <Route path="/software" element={<ExperiencePage mode="software" />} />
        {/* The nav's "Get Started" CTA pointed at a route that did not exist,
            leaving a blank page. Contact is where that intent lands. */}
        <Route path="/get-started" element={<ContactUs />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <ChatWidget />
      <BottomNav />
    </BrowserRouter>
  )
}

export default App
