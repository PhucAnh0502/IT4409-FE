import { Routes, Route } from "react-router"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./stores/useThemeStore"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import SettingsPages from "./pages/SettingsPages"

function App() {
  const {theme} = useThemeStore();

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/settings" element={<SettingsPages />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
