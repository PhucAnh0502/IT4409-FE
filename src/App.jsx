import { Routes, Route } from "react-router"
import Navbar from "./components/Navbar"
import { Toaster } from "react-hot-toast"
import LoginPage from "./pages/LoginPage"

function App() {

  return (
    <div data-theme="dark">
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
