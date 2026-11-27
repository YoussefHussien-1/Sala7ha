# Sala7ha — Home Services Platform

A web-based platform that connects customers with professional home service technicians, making it easier to find, compare, and request trusted maintenance services.

## Project Overview

Home Services Platform helps customers find technicians for services such as plumbing, electrical work, air conditioning, carpentry, and painting.

The platform provides separate experiences for customers and technicians, allowing customers to request services and technicians to manage incoming requests.

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- Mongoose

### Database
- MongoDB Atlas

## Project Structure

```text
Sala7ha/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── RequestStatusBadge.jsx
│       │   └── RequestStatusTracker.jsx
│       ├── context/
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── TechnicianProfilePage.jsx
│       │   ├── TechnicianRequestsPage.jsx
│       │   └── MyRequestsPage.jsx
│       ├── services/api.js
│       ├── utils/requestFormatters.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── backend/
│   ├── config/db.js
│   ├── constants/egyptGovernorates.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── technicianController.js
│   │   └── serviceRequestController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── TechnicianProfile.js
│   │   └── ServiceRequest.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── health.js
│   │   ├── technicianRoutes.js
│   │   └── serviceRequestRoutes.js
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (LTS version)
- npm
- Git
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate into the project:

```bash
cd Sala7ha
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5001
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
```

Replace the placeholder with your own MongoDB Atlas connection string.

Never upload your real `.env` file or database credentials to GitHub.

### 4. Start the Backend Server

Inside the backend folder, run:

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:5001
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## API Configuration

The frontend uses a shared Axios instance located in:

```text
frontend/src/services/api.js
```

Vite is configured to proxy API requests to the Express backend.

Example:

```text
Frontend Request:
http://localhost:5173/api/health

Backend Destination:
http://localhost:5001/api/health
```

## Database Models

The project currently includes three main Mongoose models:

### 1. User
Stores customer and technician account information.

### 2. Technician
Stores additional technician information, including:
- Specialty
- Experience
- Biography
- Availability status

### 3. ServiceRequest
Stores service booking information, including:
- Customer reference
- Technician reference
- Problem description
- Service address
- Scheduled date
- Request status

Default request status:

`PENDING`

## Health Check

The backend provides a health-check endpoint:

```http
GET /api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Home Services API is running!"
}
```

## Design System

The project follows a unified design system to maintain consistent UI across all pages.

| Element | Value |
|---|---|
| Background | #F8FAFC |
| Cards | #FFFFFF |
| Borders | #E2E8F0 |
| Primary | #2563EB |
| Secondary | #475569 |
| Headings | #0F172A |
| Border Radius | rounded-xl |
| Font | Inter / Cairo |

Shared UI components and common styles should be reused throughout the application.

## Development Guidelines

- Use the existing shared Navbar component.
- Follow the unified design system.
- Keep frontend and backend code organized.
- Use the shared Axios instance for API requests.
- Keep sensitive credentials inside environment variables.
- Do not commit `node_modules` or `.env` files.
- Create separate Git branches for individual tasks.
- Use descriptive commit messages.

## Current Development Scope

The current project includes:

- React and Vite configuration with Tailwind CSS.
- Shared Navbar, React Router, and Axios API configuration.
- Express server and MongoDB Atlas connection.
- User, TechnicianProfile, and ServiceRequest models.
- Authentication and technician profile/availability endpoints.
- Customer request history and technician incoming-request dashboards.
- Technician accept/reject actions for pending requests.

### Service Request Dashboard API

All endpoints require a valid JWT Bearer token.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/requests/customer` | Customer | Return the signed-in customer's requests and technician details. |
| `GET` | `/api/requests/technician` | Technician | Return requests assigned to the signed-in technician. |
| `PATCH` | `/api/requests/:id/status` | Technician | Accept or reject an assigned pending request. |

The status update body must contain `{"status":"ACCEPTED"}` or `{"status":"REJECTED"}`. A request can only be updated while its current status is `PENDING`.

The backend expects `PORT=5001`, `MONGO_URI`, and `JWT_SECRET` in `backend/.env`. Never commit the real `.env` file.

---

**Home Services Platform — Making Home Maintenance Easier and More Reliable.**