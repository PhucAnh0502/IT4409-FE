# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Getting Started

### Install Dependencies
```powershell
npm install
```

### Run Development Server
```powershell
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```powershell
npm run build
```

## Features

### Real-Time Chat with Socket.IO
This project includes a real-time chat feature using Socket.IO for room-based messaging.

**Frontend Structure:**
- `src/lib/socket.js` - Socket.IO service layer with connection and room management
- `src/pages/MessagePage.jsx` - Chat UI component with room join/leave and messaging
- Route: `/` (home page)

**To test the chat feature:**

1. Move to backend project:
   ```
   cd chat-server
   npm init -y
   npm install express socket.io cors
   ```
2. Run the backend: `node server.js` (port 3001)
3. Open the frontend at `http://localhost:5173`
4. Join a room and start chatting!

**Features:**
- Tham gia và rời khỏi phòng chat
- Gửi và nhận tin nhắn ngay lập tức
- Tin nhắn được lưu trữ trong room (server memory)
- Xem toàn bộ lịch sử tin nhắn từ đầu khi vào room
- Tin nhắn được cache trong session khi chuyển đổi giữa các room


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
