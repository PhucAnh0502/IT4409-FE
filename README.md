# IT4409-FE - Chat Application Frontend

A modern real-time chat application built with React, Vite, and SignalR.

## 🚀 Khởi chạy dự án

### Cách 1: Sử dụng Docker (Khuyến nghị cho Production)

#### Yêu cầu:
- Docker Desktop đã cài đặt
- Docker Compose (thường đi kèm với Docker Desktop)

#### Các bước:

**1. Build và chạy container:**
```bash
docker-compose up -d
```

**2. Truy cập ứng dụng:**
```
http://localhost:3000
```

**3. Xem logs:**
```bash
docker-compose logs -f
```

**4. Dừng container:**
```bash
docker-compose down
```

**5. Rebuild sau khi sửa code:**
```bash
docker-compose up -d --build
```

---

### Cách 2: Sử dụng npm (Development)

#### Yêu cầu:
- Node.js version 18+ 
- npm hoặc yarn

#### Các bước:

**1. Cài đặt dependencies:**
```bash
npm install
```

**2. Chạy development server:**
```bash
npm run dev
```

**3. Truy cập ứng dụng:**
```
http://localhost:5173
```
(Port mặc định của Vite là 5173)

**4. Build cho production:**
```bash
npm run build
```

**5. Preview bản build:**
```bash
npm run preview
```

---

## 📦 Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server với hot reload |
| `npm run build` | Build production-ready files vào folder `dist/` |
| `npm run preview` | Preview bản build local trước khi deploy |
| `npm run lint` | Chạy ESLint để kiểm tra code |

---

## 🐳 Docker Commands Cheatsheet

```bash
# Build image
docker-compose build

# Chạy container
docker-compose up -d

# Stop container
docker-compose stop

# Stop và xóa container
docker-compose down

# Xem logs realtime
docker-compose logs -f

# Restart container
docker-compose restart

# Xem container đang chạy
docker ps
```

---

## 🛠️ Tech Stack

- **React 19.1.1** - UI Framework
- **Vite** - Build tool & dev server
- **Zustand** - State management
- **SignalR** - Real-time communication
- **Axios** - HTTP client
- **Tailwind CSS + DaisyUI** - Styling
- **React Router** - Routing
- **Docker** - Containerization

---

## 📂 Cấu trúc thư mục

```
IT4409-FE/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons
│   ├── components/     # React components
│   ├── constants/      # Constants & configs
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities & API
│   ├── pages/          # Page components
│   ├── routes/         # Route configs
│   ├── stores/         # Zustand stores
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── Dockerfile          # Docker build config
├── docker-compose.yml  # Docker orchestration
├── nginx.conf          # Nginx server config
└── package.json        # Dependencies
```

---

## 📖 Tài liệu bổ sung

- [DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md) - Hướng dẫn chi tiết về Docker deployment
- [DOCKER_EXPLANATION.md](DOCKER_EXPLANATION.md) - Giải thích từng dòng code trong các file Docker

---

## 🔧 Cấu hình môi trường

Tạo file `.env` (nếu cần) với các biến môi trường:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_HUB_URL=http://localhost:5000/conversationHub
```

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
