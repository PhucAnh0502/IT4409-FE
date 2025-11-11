import { Routes, Route } from "react-router"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./stores/useThemeStore"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import SettingsPages from "./pages/SettingsPages"
import NotFoundPage from "./pages/NotFoundPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ProfilePage from "./pages/ProfilePage"
import HomePage from "./pages/HomePage"

function App() {
  const {theme} = useThemeStore();

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/settings" element={<SettingsPages />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
