import { Routes, Route } from "react-router"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./stores/useThemeStore"
import Navbar from "./components/Navbar"
import AppRoutes from "./routes/AppRoutes"

function App() {
  const {theme} = useThemeStore();

  return (
    <div data-theme={theme}>
      <Navbar />

      <AppRoutes />

      <Toaster />
    </div>
  )
}

export default App
