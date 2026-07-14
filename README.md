# College CMS — Management System

A full-stack College Management System built with React + Vite (frontend) and Express + MongoDB (backend).

## Tech Stack
- **Frontend:** React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Express.js, TypeScript, MongoDB (Mongoose), JWT Auth
- **Deploy:** Vercel (frontend) + Render (backend)

## Local Development

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm --prefix server install

# Start backend (from root)
npm run server

# Start frontend (from root)
npm run dev

# Seed database with demo data
npm run seed
```

## Demo Credentials (after seeding)

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| Admin   | admin@college.com        | admin123     |
| Faculty | faculty@college.com      | faculty123   |
| Student | student@college.com      | student123   |

## Deployment

### Backend → Render
1. Push to GitHub
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `server`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `npm start`
6. Add environment variables (see `server/.env.example`)

### Frontend → Vercel
1. Import your GitHub repo on Vercel
2. Framework: **Vite**
3. Add environment variable `VITE_API_URL` = your Render backend URL
4. Deploy

## Environment Variables

### Frontend (Vercel)
| Variable       | Description                          |
|----------------|--------------------------------------|
| `VITE_API_URL` | Render backend URL (e.g. `https://college-cms-api.onrender.com`) |

### Backend (Render)
| Variable       | Description                          |
|----------------|--------------------------------------|
| `MONGODB_URI`  | MongoDB Atlas connection string      |
| `JWT_SECRET`   | Random secret string (32+ chars)     |
| `FRONTEND_URL` | Vercel app URL (for CORS)            |
| `PORT`         | Server port (Render sets this auto)  |
