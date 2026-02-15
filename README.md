# HireReady - AI-Powered Placement Readiness System

HireReady is a resume-driven platform that analyzes student resumes to extract skills, detect programming languages, and predict suitable job roles.

## Project Structure

- **client/**: React + Vite frontend
- **server/**: Node.js + Express + MongoDB backend

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (for cloud database)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HireReady
```

### 2. Backend Setup

```bash
cd server
npm install
```

**Environment Variables:**
Create a `.env` file in the `server` directory based on `.env.example`:

```bash
cp .env.example .env
```
Update `MONGO_URI` with your MongoDB Atlas connection string.

### 3. Frontend Setup

```bash
cd ../client
npm install
```

## Running the Application

You need to run both the server and client terminals.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
(Runs on http://localhost:5001)

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
(Runs on http://localhost:5173 - checks console for exact port)

## Features

- **Resume Upload**: Upload PDF resumes (max 5MB).
- **Skill Extraction**: Auto-detects 100+ skills from resume text.
- **Language Detection**: Identifies programming languages.
- **Role Matching**: Predicts top 3 job roles using cosine similarity.
- **Profile**: View extraneous analysis and download the original resume.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, CSS Modules
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Analysis**: pdf-parse, vector-based cosine similarity (no external AI APIs)
