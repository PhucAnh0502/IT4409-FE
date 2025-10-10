import React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Settings } from "lucide-react"

const NotFoundPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center p-6">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-base-content/60 mb-6">
          Sorry — the page you are looking for doesn’t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary btn-md flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go back home
          </Link>

          <Link to="/settings" className="btn btn-ghost flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage