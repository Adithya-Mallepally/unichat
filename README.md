# UniChat
### Anonymous Real-Time Matchmaking Chat with AI Safety Moderation and Smart Icebreakers

---

## Overview

UniChat is a full-stack, real-time anonymous messaging platform designed to facilitate secure, moderated conversations. It combines account-based JWT authentication, an automated matchmaking queue pairing users by preference, a real-time abusive content and PII leak safety filter, and an automated conversational icebreaker engine.

---

## Unique Key Features

### 1. Real-Time Content Safety Moderation Shield
To solve toxic behavior and privacy leaks common in anonymous chat networks, UniChat embeds an active content moderation layer:
- PII Leak Detection: Scans outbound payloads for sensitive personal identifiable information (phone numbers, email addresses) and redacts them automatically before transmission.
- Harassment & Abusive Content Filtering: Intercepts toxic terminology and threats, substituting safe guidelines notices while alerting the sender.
- Spam and Character Flood Suppression: Dampens repetitive character spam to maintain chat readability.

### 2. Algorithmic Icebreaker Engine
Addresses initial conversational friction by automatically generating contextual, engaging conversation starters delivered directly into the paired room upon match connection.

---

## Features

- Authentication: Registration and login using JWT access tokens with bcrypt password hashing
- Real-Time Messaging: Sub-millisecond bidirectional communication powered by Socket.IO
- Matchmaking Queue: Queue-based pairing system for opposite-gender or preferred matching
- Skip & Re-match: Instant queue re-entry with automatic notification to previous partner
- Partner Status Indicators: Real-time events triggered on disconnection or skip
- Production React Client: Optimized production build with responsive mobile and desktop UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Socket.IO Client, CSS3 |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Moderation | In-line Regex Safety Evaluator |

---

## Project Structure

```
unichat/
├── client/                     # React frontend application
│   ├── public/                 # Static assets & HTML template
│   ├── src/
│   │   ├── App.js              # Authentication flow & matchmaking state
│   │   ├── Chat.js             # Real-time chatroom interface
│   │   └── App.css             # Component styling
│   ├── package.json
│   └── package-lock.json
├── server/                     # Express & Socket.IO backend
│   ├── bin/
│   │   └── www                 # Server entry point & Socket.IO initialization
│   ├── routes/
│   │   ├── index.js            # Base router
│   │   └── users.js            # Registration & login endpoints
│   ├── app.js                  # Express middleware configuration
│   ├── chat.js                 # Matchmaking queue & messaging orchestrator
│   ├── safety.js               # Content safety & PII leak moderation
│   ├── icebreakers.js          # Conversational starter generator
│   ├── user.model.js           # Mongoose User schema
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB instance running locally or via MongoDB Atlas

### Server Setup

```bash
cd server
npm install
npm start
```

The server runs on http://localhost:5000

### Client Setup

```bash
cd client
npm install
npm start
```

The frontend application runs on http://localhost:3000

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /users/register | Register a new user account |
| POST | /users/login | Authenticate user and receive JWT token |

---

## Socket.IO Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| join | Client to Server | { gender } | Enters matchmaking queue |
| skip | Client to Server | { gender } | Leaves current room and rejoins queue |
| message | Client to Server | { room, message } | Sends message through safety filter |
| chatStart | Server to Client | { room, icebreaker } | Notifies both clients of match + starter |
| messageWarning | Server to Client | { warning } | Alerts sender of moderated content |
| partnerSkipped | Server to Client | - | Alerts client when partner skips |
| partnerDisconnected | Server to Client | - | Alerts client when partner leaves |

---

## Author

Roopadithya Vardhan Mallepally
M.Sc. Software Engineering - BTH Sweden
GitHub: https://github.com/Adithya-Mallepally
