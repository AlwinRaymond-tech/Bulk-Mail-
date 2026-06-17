# Bulk Mail App

A full-stack MERN (MongoDB, Express, React, Node.js) application for sending bulk emails with history tracking and admin authentication.

## Features

- **Send Bulk Emails** — Compose and send emails to multiple recipients at once
- **Email History** — View all previously sent emails with status tracking
- **Admin Authentication** — Secure login to restrict access
- **Input Validation** — Client and server-side email validation
- **Status Tracking** — Track sent, failed, and partial delivery statuses
- **Modern UI** — Clean, responsive interface built with React

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, React Router        |
| Backend  | Node.js, Express                    |
| Database | MongoDB with Mongoose               |
| Email    | Nodemailer                          |
| Auth     | JWT (JSON Web Tokens)               |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or MongoDB Atlas)

## Getting Started

### 1. Clone and install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment variables

Copy the example env file and update with your settings:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

| Variable         | Description                              |
|------------------|------------------------------------------|
| `MONGODB_URI`    | MongoDB connection string                |
| `JWT_SECRET`     | Secret key for JWT tokens                |
| `ADMIN_USERNAME` | Admin login username (default: admin)    |
| `ADMIN_PASSWORD` | Admin login password (default: admin123) |
| `SMTP_HOST`      | SMTP server host (e.g. smtp.gmail.com)   |
| `SMTP_PORT`      | SMTP port (587 for TLS)                  |
| `SMTP_USER`      | Your email address                       |
| `SMTP_PASS`      | Your email app password                  |

#### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use that password as `SMTP_PASS`

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

Or use a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud connection string in `MONGODB_URI`.

### 4. Run the application

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Login

Use the default credentials:
- **Username:** admin
- **Password:** admin123

## API Endpoints

| Method | Endpoint              | Description           | Auth Required |
|--------|-----------------------|-----------------------|---------------|
| POST   | `/api/auth/login`     | Admin login           | No            |
| GET    | `/api/auth/verify`    | Verify JWT token      | Yes           |
| POST   | `/api/emails/send`    | Send bulk email       | Yes           |
| GET    | `/api/emails/history` | Get email history     | Yes           |
| GET    | `/api/emails/history/:id` | Get email details | Yes           |
| GET    | `/api/health`         | Health check          | No            |

## Project Structure

```
BulkMail/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API client
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── index.js            # Server entry point
│   └── package.json
└── README.md
```

## License

MIT
