# Equipora - Trust-First AI-Assisted Equipment Rental Marketplace

Equipora is a comprehensive platform designed for secure, transparent, and verified peer-to-peer equipment rentals. This project emphasizes accountability through Digital Trust Passports, AI-assisted inspections, and strict identity verification workflows.

## Disclaimer
> [!WARNING]
> This is an academic/demonstration project. The KYC, identity verification, and financial ledger (escrow/security deposits) are *simulated* and do not interact with real regulatory databases or payment gateways.

## Architecture
- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Storage:** Cloudinary
- **AI Integration:** Google Gemini API

## Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- Gemini API Key

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/equipora
   JWT_SECRET=your_super_secret_key
   CLIENT_URL=http://localhost:5173
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Seed the database with sample data:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Demo Accounts (After Seeding)
- **Admin:** `admin@equipora.com` / `password123`
- **Provider:** `provider@equipora.com` / `password123`
- **Renter:** `renter@equipora.com` / `password123`

## Features Implemented
- Complete Monorepo structure.
- JWT Cookie-based Authentication.
- Role-based Access Control (Admin, Provider, Renter).
- User Models with KYC fields and Cloudinary file uploads.
- Product Models with Equipora Digital Trust Passport fields.
- AI Checklist Generation logic (Gemini API).
- Internal Simulated Ledger and Booking Status Machine.
- Tamper-Evident Evidence Logging (SHA-256 Hashing).
- Admin Trust Center Dashboard (Simulated UI).
