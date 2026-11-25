# Sala7ha# Home Services Platform

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
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Technician.js
│   │   └── ServiceRequest.js
│   ├── routes/
│   │   └── health.js
│   ├── server.js
│   ├── testModels.js
│   └── package.json
│
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
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
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
http://localhost:5000
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
http://localhost:5000/api/health
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

The initial project setup includes:

- React and Vite configuration.
- Tailwind CSS design system.
- Shared Navbar component.
- React Router configuration.
- Axios API configuration.
- Express server setup.
- MongoDB Atlas connection.
- Initial database models.
- Health-check endpoint.

Authentication, booking workflows, technician search, and dashboard functionality are implemented separately as team tasks.

---

**Home Services Platform — Making Home Maintenance Easier and More Reliable.**