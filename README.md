# 💰 Digital Wallet System Backend
A secure and feature - rich backend for a digital wallet system, designed to handle user authentication, virtual cash management, fraud transfers, and basic fraud detection.

## 🚀 Features

- **User Authentication**  
  Secure registration & login (bcrypt + JWT)  
  Authentication middleware to protect routes

- **Wallet Operations**  
  Deposit, Withdraw, and Transfer money  
  Individual transaction history

- **Transaction Validation**  
  Atomic transaction handling  
  Overdraft prevention and input validation
  
- **Fraud Detection**  
  Detect rapid transfers or sudden large withdrawals  
  Flag and log suspicious activity

- **Admin APIs** (optional for bonus)  
  View flagged transactions  
  Get total balances, top users by balance or volume

## 🛠️ Tech Stack

- Node.js / Express  
- MongoDB / Mongoose  
- JWT for secure access tokens  
- bcrypt for password encryption

## 📦 Folder Structure 

wallet-system/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md



## 🔧 Setup Instructions

1. Clone this repo  
2. Run `npm install`  
3. Create a `.env` file with:
      PORT=5000
      MONGO_URI=mongodb://127.0.0.1:27017/walletDB
      JWT_SECRET=your_secret_key
4. Start the server:  
5. Use Postman or Swagger to test APIs

## 📬 API Endpoints (via `/api/auth`)

### Auth  
- `POST /register` – Create new user  
- `POST /login` – Login and receive JWT  

### Wallet  
- `POST /deposit` – Deposit funds  
- `POST /withdraw` – Withdraw funds  
- `POST /transfer` – Transfer to another user  
- `GET /transactions` – View transaction history  






