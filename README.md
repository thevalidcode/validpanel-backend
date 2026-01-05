# Valid Panel Backend (Core Platform)

## Overview
Valid Panel is the **core backend platform** that powers all types of stores, including the **Social Media Store**, within a multi-tenant architecture.  
This backend is built with **TypeScript**, **Node.js**, and follows a scalable, modular design using **Prisma ORM**, **PostgreSQL**, and a set of robust libraries for validation, authentication, and API development.

The core platform is responsible for:  
- Managing **all store types** (including Social Media Stores and others).  
- Handling **user authentication**, **authorization**, and **multi-tenant logic**.  
- Providing **APIs for store creation, management, and integration**.  
- Acting as the **gateway for scalable store operations**.  

---

## Tech Stack
- **Node.js + Express** – Server-side framework for building REST APIs  
- **TypeScript** – Strong typing for better maintainability  
- **PostgreSQL** – Relational database for persistent storage  
- **Prisma ORM** – Database modeling and type-safe queries  
- **Zod** – Data validation and schema enforcement  
- **JWT (JSON Web Token)** – Stateless authentication and API security  
- **Google Auth Library** – Google OAuth 2.0 authentication  
- **bcrypt** – Password hashing for secure user management  
- **dotenv** – Environment variable management  

---

## Features
- **Multi-tenant Architecture** – Supports multiple store types under one core platform  
- **Authentication & Authorization** – JWT-based auth and Google OAuth 2.0 login  
- **Role-Based Access Control (RBAC)** – Granular user permissions and roles  
- **Database Integration** – PostgreSQL with Prisma for schema and migrations  
- **Data Validation** – Using Zod for request and response validation  
- **Secure Password Handling** – bcrypt for hashing and salting passwords  
- **Environment Config Management** – `.env` support for secrets and configs  

---

## Project Structure
```
validpanel-backend/
│
├── src/
│   ├── config/         # Environment and app configurations
│   ├── controllers/    # Route handlers for business logic
│   ├── middlewares/    # Authentication and request validation middlewares
│   ├── models/         # Prisma models and schema definitions
│   ├── routes/         # Express route definitions
│   ├── services/       # Core services and utilities
│   ├── utils/          # Helper functions and utilities
│   └── app.ts          # Express application setup
│
├── prisma/
│   ├── schema.prisma   # Prisma schema definition
│
├── .env                # Environment variables
├── package.json
└── tsconfig.json
```

---

## Installation & Setup

### **1. Clone the repository**
```bash
git clone https://github.com/thevalidcode/validpanel-backend.git
cd validpanel-backend
```

### **2. Install dependencies**
```bash
npm install
```

### **3. Set up environment variables**
Create a `.env` file in the root directory and add:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/validpanel"
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### **4. Run database migrations**
```bash
npx prisma migrate dev
```

### **5. Start the development server**
```bash
npm run dev
```

---

## Scripts
- **`npm run dev`** – Start development server with hot reload  
- **`npm run build`** – Compile TypeScript to JavaScript

---

## API Features
- **Auth Endpoints**
  - Register & Login (Email + Password)
  - Google OAuth 2.0 Login
- **Store Management**
  - Create, Update, and Delete stores
  - Assign users to stores
- **User Management**
  - Role-based access
  - Profile update

---

## Security
- Passwords hashed with **bcrypt**
- JWT for authentication
- Input validation using **Zod**
- Environment variables managed with **dotenv**

---

## License
MIT License – You are free to use, modify, and distribute this project.
