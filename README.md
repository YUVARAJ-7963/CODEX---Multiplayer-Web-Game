# CODEX---Multiplayer-Web-Game
CODEX is a multiplayer coding battle platform where users compete in real-time coding challenges, similar to LeetCode meets PUBG. Built with MERN stack, it features PvP mode, code editor, contests, quick codes, Debugging and real-time interactions.



# 🧠 CODEX Project – Full Stack Overview

CODEX is a full-stack web platform offering a competitive programming experience with PvP battles, real-time coding, challenges, and an interactive admin panel. It is built using the **MERN** stack (MongoDB, Express, React, Node.js) with real-time features and secure user management.

---

## 🎨 CODEX Frontend

This is the **frontend client** for the CODEX platform — a modern web app built with **React**, **Tailwind CSS**, and various UI and animation libraries. It provides the user interface for coding challenges, contests, and PvP interactions.

### ⚛️ Tech Stack

- **React 18**
- **Tailwind CSS**
- **React Router**
- **Monaco Editor** & **CodeMirror**
- **Framer Motion**, **GSAP**, **AOS**
- **Chart.js**, **Recharts**
- **Socket.IO (Client)**

### 📁 Frontend Folder Structure

```
frontend/
├── node_modules/     # Dependencies
├── public/           # Public assets
├── src/
│   ├── admin/        # Admin panel pages
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Reusable UI components
│   ├── home-page/    # Landing and homepage UI
│   ├── player/       # Player-specific views/pages
│   ├── Playground/   # Coding interface and test cases
│   ├── App.js        # Main component
│   ├── index.js      # Entry point
│   ├── App.css       # Styles
│   └── setupTests.js # Test setup
├── .gitignore
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

### 🚀 Frontend Features

- 🧠 Code editor with test case interface
- 🧩 Admin panel for challenge management
- 🔁 Real-time coding game (PvP mode)
- 📊 Progress visualization with charts
- 📦 Fully responsive & mobile-friendly UI
- 🌗 Dark/light mode toggle
- 🔒 Disabled copy/paste (undo/redo allowed)

### 🧪 Frontend Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YUVARAJ-7963/CODEX---Multiplayer-Web-Game
cd your-frontend-repo

# 2. Install dependencies
npm install

# 3. Start the development server
npm start 
```

---

## 🖥️ Backend API

This is the backend service for the **CODEX** project. It is built using **Node.js**, **Express**, and **MongoDB**, and it handles user authentication, session management, file uploads, real-time communication, and secure routing.

### ⚙️ Technologies Used

- 🖥️ **Node.js** with **Express.js**
- 🔐 **JWT Authentication**
- 🔄 **Socket.IO** for real-time features
- 📦 **MongoDB** via **Mongoose**
- ✉️ **Nodemailer** for email services
- 🧊 **Multer** for file uploads
- 🧪 **dotenv** for environment config
- 🔐 **bcrypt / bcryptjs** for password hashing
- 🧠 **Two-factor auth** via **Speakeasy**
- 📦 **Session store** using **connect-mongo**
- 📉 **Rate limiting** for security

### 📁 Backend Folder Structure

```
backend/
├── config/            # MongoDB connection and global configurations
├── controllers/       # Logic for handling API requests
├── logs/              # Logging files
├── middleware/        # Authentication, error handling, etc.
├── models/            # MongoDB models using Mongoose
├── node_modules/      # Dependencies (ignored in Git)
├── routes/            # All route definitions
├── services/          # Mailing, 2FA, etc.
├── uploads/           # Uploaded files (images, PDFs)
├── .env               # Environment variables
├── package.json       # Project metadata and dependencies
├── package-lock.json  # Exact dependency versions
├── readme.md          # This file
└── server.js          # Entry point of the backend app
```

### 📦 Backend Installation

```bash
# 1. Clone the repository
git clone https://github.com/YUVARAJ-7963/CODEX---Multiplayer-Web-Game
cd your-repo-name/backend 

# 2. Install dependencies
npm install

# 3. Create a .env file
cp .env.example .env

# 4. Start the server
npm run dev
```

---

