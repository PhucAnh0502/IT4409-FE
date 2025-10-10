import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import SettingsPages from "../pages/SettingsPages";
import SignUpPage from "../pages/SignUpPage";
import ChatPage from "../pages/ChatPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/settings" element={<SettingsPages />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
