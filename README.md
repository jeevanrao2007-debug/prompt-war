# Prompt Wars - Full Stack Project

A full-stack application with React frontend and Express backend.

## Project Structure

```
prompt-wars/
├── client/              # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── index.html
├── server/              # Node.js + Express backend (port 5000)
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── middleware/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server will run on **http://localhost:5000**

### Frontend Setup

1. In a new terminal, navigate to the client directory:
```bash
cd client
```

2. Create a `.env.local` file with your Google Maps API key:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Note:** Get a free API key from [Google Cloud Console](https://console.cloud.google.com/)
- Enable Maps JavaScript API
- Enable Maps Embed API
- Create an API key with appropriate restrictions

4. Install dependencies:
```bash
npm install
```

5. Start the development server:
```bash
npm run dev
```

The client will run on **http://localhost:5173**

## API Endpoints

- `GET /api/health` - Health check endpoint
  - Response: `{ "message": "Server running" }`

## Features

✅ Clean modular backend structure (routes, controllers, services, middleware)
✅ Express server running on port 5000
✅ React + Vite frontend running on port 5173
✅ CORS enabled for frontend-backend communication
✅ Basic health check API endpoint
✅ Google Maps integration with reusable Map component
✅ Stadium map with 3 markers (Gate A, Food Court, Restroom)
✅ Interactive info windows for marker details
✅ Ready for feature development

## Running Both Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

Both servers will start, and the React app will automatically check the server health on page load.

## Environment Files

- Root template: `.env.example`
- Backend template: `server/.env.example`
- Frontend template: `client/.env.example`

Use these templates to configure environment variables in local and deployment platforms.

## Production Scripts

From project root:

```bash
npm run install:all
npm run build
npm run start
```

- `build` builds the frontend for production.
- `start` runs the backend server in production hosting environments.

## Deployment

### Frontend Deployment (Vercel)

1. Import the repository into Vercel.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variables from `client/.env.example`.
7. Add `VITE_API_BASE_URL` with your Render backend URL.
8. Deploy.

### Backend Deployment (Render)

1. Create a new **Web Service** in Render from the same repository.
2. Set **Root Directory** to `server`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add environment variables from `server/.env.example`:
  - `NODE_ENV=production`
  - `PORT=5000` (or Render provided port)
  - `FRONTEND_URL=https://<your-vercel-domain>`
6. Deploy.

### Final Production Check

After both deployments are live:

1. Open frontend URL from Vercel.
2. Confirm backend health endpoint works at:
  - `https://<your-render-domain>/api/health`
3. Confirm frontend can fetch backend without CORS errors.
