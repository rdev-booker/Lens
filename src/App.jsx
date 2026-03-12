import { Routes, Route } from 'react-router-dom'
import Navbar         from './components/Navbar'
import Home           from './pages/Home'
import Shop           from './pages/Shop'
import Philosophy     from './pages/Philosophy'
import Experience     from './pages/Experience'
import Contact        from './pages/Contact'
import Admin          from './pages/Admin'
import AdminLogin     from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <>
      {/* Site-wide fixed navigation — present on every page */}
      <Navbar />

      <Routes>
        <Route path="/"            element={<Home />}        />
        <Route path="/shop"        element={<Shop />}        />
        <Route path="/philosophy"  element={<Philosophy />}  />
        <Route path="/experience"  element={<Experience />}  />
        <Route path="/contact"     element={<Contact />}     />
        <Route path="/admin/login" element={<AdminLogin />}  />
        <Route path="/admin"       element={<ProtectedRoute><Admin /></ProtectedRoute>} />

        {/* 404 fallback */}
        <Route path="*" element={
          <main className="bg-obsidian min-h-screen pt-20 flex items-center justify-center">
            <div className="text-center">
              <p className="font-mono text-[0.56rem] tracking-widest3 text-champagne uppercase mb-4">
                404
              </p>
              <p className="font-display font-light text-[3rem] text-pearl mb-8">
                Page not found.
              </p>
              <a
                href="/"
                className="font-mono text-[0.6rem] tracking-widest2 uppercase
                           text-champagne hover:text-pearl transition-colors duration-300"
              >
                Return home →
              </a>
            </div>
          </main>
        } />
      </Routes>
    </>
  )
}
