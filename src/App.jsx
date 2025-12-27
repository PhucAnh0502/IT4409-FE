import { Routes, Route, Outlet } from "react-router"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./stores/useThemeStore"
import PrivateRoutes from "./routes/PrivateRoutes"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import SettingsPages from "./pages/SettingsPages"
import NotFoundPage from "./pages/NotFoundPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ProfilePage from "./pages/ProfilePage"
import HomePage from "./pages/HomePage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import useSignalR from "./hooks/useSignalR"
import { SignalRProvider } from "./contexts/SignalRContext"
import { CallProvider } from "./contexts/CallContext"
import IncomingCallModal from "./components/call/IncomingCallModal"
import ActiveCallModal from "./components/call/ActiveCallModal"
import OutgoingCallModal from "./components/call/OutgoingCallModal"
import { useConversationStore } from "./stores/useConversationStore"
import { useEffect } from "react"
import FriendsPage from "./pages/FriendsPage"
import { getUserIdFromToken } from "./lib/utils"

function App() {
  const { theme } = useThemeStore();
  const hubUrl = import.meta.env.VITE_SIGNALR_HUB;
  const connection = useSignalR(hubUrl);
  const {
    appendMessage,
    addMembersSocket,
    updateConversationName,
    removeMemberSocket,
    leaveGroupSocket,
    updateMessageReaction,
  } = useConversationStore();

  const authUserId = getUserIdFromToken();

  useEffect(() => {
    if (!connection) return;

    const handler = (payload) => {
      console.debug("SignalR ReceiveMessage payload:", payload);
      const conversationId = payload?.conversationId;
      const message = payload;

      if (payload && payload.type === "ReactionUpdate") {
        updateMessageReaction(payload);
        return;
      }

      if (conversationId && payload.newMembers) {
        addMembersSocket(conversationId.toString(), payload.newMembers);
      }

      if (conversationId && payload.newGroupName) {
        updateConversationName(conversationId.toString(), payload.newGroupName);
      }

      if (conversationId && payload.kickedMemberId) {
        removeMemberSocket(conversationId.toString(), payload.kickedMemberId);

        if (authUserId == payload.kickedMemberId) {
          connection
            .invoke("LeaveConversation", conversationId.toString())
            .catch((err) => console.error(err));
        }
      }

      if (conversationId && payload.leftUserId && payload.newAdminId) {
        leaveGroupSocket(
          conversationId,
          payload.leftUserId,
          payload.newAdminId
        );
      }

      if (!message.createdAt) {
        message.createdAt = new Date().toISOString();
      }

      if (
        conversationId &&
        message &&
        (!message.isSystemMessage || message.type !== 99)
      ) {
        appendMessage(conversationId.toString(), message);
      } else {
        appendMessage(null, message);
      }
    };

    connection.on("ReceiveMessage", handler);

    return () => {
      try {
        connection.off("ReceiveMessage", handler);
      } catch (e) {
        console.log("Failed to unregister ReceiveMessage handler:", e);
      }
    };
  }, [connection, appendMessage]);

  return (
    <SignalRProvider connection={connection}>
      <CallProvider>
        <div data-theme={theme}>
          <Navbar />

        <Routes>
          <Route
            element={
              <PrivateRoutes>
                <Outlet />
              </PrivateRoutes>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/settings" element={<SettingsPages />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

          <Toaster />
          
          <IncomingCallModal />
          <OutgoingCallModal />
          <ActiveCallModal />
        </div>
      </CallProvider>
    </SignalRProvider>
  );
}

export default App;
