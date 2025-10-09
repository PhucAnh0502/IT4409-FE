import { Routes, Route } from "react-router"
import Navbar from "./components/Navbar"
import { Toaster } from "react-hot-toast"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"

function App() {

  return (
    <div data-theme="dark">
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
