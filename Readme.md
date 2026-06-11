# VibeTube Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

# VibeTube Backend

A full-featured YouTube-inspired backend application built using Node.js, Express.js, MongoDB, and Mongoose.

VibeTube provides authentication, video management, playlists, subscriptions, comments, tweets, likes, watch history, and user profile management through REST APIs.

---

## Live Demo

### Backend API

https://video-tube-backend-zeqq.onrender.com

### Health Check

https://video-tube-backend-zeqq.onrender.com/api/v1/healthcheck

### Frontend

https://vibe-tube-frontend-ashen.vercel.app

### API Documentation

https://shuklavaibhav30-5565238.postman.co/workspace/VAIBHAV-SHUKLA's-Workspace~678e25ca-4b8c-4b28-8370-1bb047774c6b/collection/53715139-37146ba9-820a-4dab-811e-93def5f56a87?action=share&creator=53715139

---

# Features

## Authentication

- User Registration
- User Login
- User Logout
- Refresh Access Token
- JWT Authentication
- Secure Password Hashing (bcrypt)
- Cookie Based Authentication

---

## User Management

- Get Current User
- Update Account Details
- Change Password
- Update Avatar
- Update Cover Image
- Delete Account
- Get User Channel Profile
- Watch History Management

---

## Videos

- Publish Video
- Get All Videos
- Get Video By ID
- Update Video
- Delete Video
- Toggle Publish Status
- Search & Filtering Support

---

## Comments

- Add Comment
- Get Video Comments
- Update Comment
- Delete Comment

---

## Tweets

- Create Tweet
- Get All Tweets
- Get User Tweets
- Update Tweet
- Delete Tweet

---

## Playlists

- Create Playlist
- Get User Playlists
- Get Playlist By ID
- Update Playlist
- Delete Playlist
- Add Video To Playlist
- Remove Video From Playlist

---

## Likes

- Toggle Video Like
- Toggle Tweet Like
- Toggle Comment Like
- Get Liked Videos

---

## Subscriptions

- Subscribe / Unsubscribe Channel
- Get Channel Subscribers
- Get Subscribed Channels

---

## Health Check

- Server Health Monitoring Endpoint

---

# Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt

## Media Storage

- Cloudinary
- Multer

## Deployment

- Render

## API Testing

- Postman

---

# Project Structure

```bash
src/
│
├── controllers/
│
├── models/
│
├── routes/
│
├── middlewares/
│
├── utils/
│
├── db/
│
├── constants/
│
├── app.js
│
└── index.js
```

---

# Database Models

- User
- Video
- Playlist
- Comment
- Tweet
- Like
- Subscription

---

# Environment Variables

Create a `.env` file:

```env
PORT=8000

MONGODB_URI=your_mongodb_uri

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=*
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/shuklavaibhav30/VibeTube.git
```

Move into project:

```bash
cd BACKEND
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

---

# API Modules

### Authentication

- Register User
- Login User
- Logout User
- Refresh Access Token

### Users

- Current User
- Update Profile
- Change Password
- Update Avatar
- Update Cover Image
- Delete Account

### Videos

- Publish Video
- Fetch Videos
- Update Video
- Delete Video

### Comments

- CRUD Operations

### Tweets

- CRUD Operations

### Playlists

- CRUD Operations
- Add/Remove Video

### Likes

- Video Likes
- Comment Likes
- Tweet Likes

### Subscriptions

- Subscribe Channel
- Subscribers List
- Subscribed Channels

---

# Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Ownership Verification
- Cookie Based Authentication
- Input Validation
- Secure Token Rotation

---

# Future Improvements

- OTP Verification
- Email Verification
- Forgot Password
- Search Optimization
- Notifications
- Video Recommendations
- Real-time Chat
- Frontend Integration Enhancements
- Docker Support
- CI/CD Pipeline
- Rate Limiting
- Redis Caching

---

# Connect With Me

### LinkedIn

https://www.linkedin.com/in/vaibhav-kumar-shukla-445b3a300/

### Developer

**Vaibhav Shukla**

Full Stack Developer | Node.js | Express.js | MongoDB | JWT | Cloudinary | React.js | JavaScript | REST APIs

---

# License

This project is built for learning, portfolio, and educational purposes.