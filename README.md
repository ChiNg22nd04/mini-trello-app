# Mini Trello App

---

## Features

-   Create boards, cards, and tasks
-   Invite members to boards via email
-   Accept invitations via secure link
-   Real-time updates with Socket.io
-   GitHub OAuth and Email account login

---

## Project Architecture

```bash
mini-trello-app/
├── trello-api/                        # Backend (Node.js + Express + Firebase)
│   ├── config/                        # Config for socket, key ...
│   ├── controllers/                   # Handle logic for routes
│   ├── firebase/                      # Firebase setup
│   ├── middleware/                    # Middlewares
│   ├── routes/                        # API route
│   ├── services/                      # Email services
│   ├── .env                           # Environment variables (ignored in Git)
│   ├── .gitignore                     # Ignore node_modules, .env, etc.
│   ├── package.json                   # Dependencies
│   └── server.js                      # Entry point to run backend server

├── trello-ui/                         # Frontend (React + Vite + Socket.io + Bootstrap)
│   ├── config/                        # Shared configs (base URL, socket)
│   ├── public/                        # Static assets
│   ├── src/                           # React source code
│   │   ├── assets/                    # Images, icons
│   │   ├── components/                # UI components (Sidebar, Header, Card, Form)
│   │   ├── pages/                     # Page views (Login, Board, Card)
│   │   ├── App.jsx                    # Root component
│   │   ├── main.jsx                   # ReactDOM render entry
│   │   ├── App.css / index.css        # Global styles
│   ├── .env                           # Environment variables (ignored)
│   ├── .gitignore                     # Ignore node_modules, .env, dist,...
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite config
│   └── package.json                   # Frontend dependencies
├── .gitignore                         # Root-level ignore file
└── README.md                          # This file

```

---

## Setup & Run Project

### 1. Clone the Repository

```bash
git clone https://github.com/ChiNg22nd04/mini-trello-app.git
cd mini-trello-app
```

### 2. Backend Setup (trello-api)

```bash
cd trello-api
pnpm install
```

-   Create a .env file in the trello-api folder:

```bash
PORT=3000
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

-   GitHub Login:
    Register an OAuth App at GitHub: https://github.com/settings/developers
    Update backend .env:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=your_redirect_uri
```

-   Start the backend server:

```bash
pnpm run dev
```

### 3. Frontend Setup (trello-ui)

```bash
cd ../trello-ui
pnpm install
```

-   Create a config.js file in the trello-ui folder:

```bash
API_BASE_URL=http://localhost:5173
```

-   Start the frontend:

```bash
pnpm run dev
```


