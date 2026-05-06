# Incident Management System (IMS)

## Overview

This project implements a real-time Incident Management System that ingests signals, groups them into incidents using debouncing, and provides a dashboard for monitoring, RCA tracking, and incident lifecycle management.

---

## Architecture

Frontend (React Dashboard)
        ↓
Backend (FastAPI)
        ↓
Redis (Debounce Logic)
PostgreSQL (Incident Storage)
MongoDB (Signal Storage)

---

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React
- Database:
  - PostgreSQL (Incidents)
  - MongoDB (Signals)
- Cache: Redis (Debouncing)
- Containerization: Docker & Docker Compose

---

## Features

- Signal ingestion API
- Incident creation using debouncing (10-second window)
- Incident lifecycle management (OPEN → CLOSED)
- RCA (Root Cause Analysis) enforcement before closure
- MTTR (Mean Time To Resolve) calculation
- Real-time dashboard UI
- Severity-based prioritization (P0, P1, P2)
- Search and filtering support
- Basic rate limiting
- Health check endpoint (/health)

---

## Key Concepts

- Debouncing: Groups multiple signals from the same component into a single incident within a time window
- MTTR: Calculated when an incident is resolved
- RCA Enforcement: Incidents cannot be closed without providing RCA
- Observability: Signal rate logging and health endpoint

---

## Services

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Redis: Internal
- MongoDB: Internal
- PostgreSQL: Internal

---

## Setup & Run Instructions

### 1. Clone the repository

git clone https://github.com/srirampalepu/ims-sre-assignment
cd ims-sre-assignment

---

### 2. Start backend services

docker-compose up --build

---

### 3. Verify backend

curl http://localhost:8000/health

Expected response:
{"status": "ok"}

---

### 4. Generate test data (simulation)

python3 simulate.py

Press Ctrl + C to stop simulation

---

### 5. Run frontend

cd frontend
npm install
npm run build
npx serve -s build -l 3000

---

### 6. Open Dashboard

http://localhost:3000

---

## API Endpoints

- GET /health → Health check
- POST /signal → Ingest signal
- GET /incidents → Fetch incidents
- POST /incident/{id}/rca → Add RCA
- PUT /incident/{id}/status → Update status

---

## Non-Functional Enhancements

- Basic rate limiting to prevent overload
- Clean API structure
- Production-ready frontend build
- Configurable API base URL
- Observability via logs

---

## Screenshots

(Add screenshots in your PDF submission)

- Dashboard overview
- Incident list
- RCA submission
- Incident closure

---

## GitHub Repository


https://github.com/srirampalepu/ims-sre-assignment

---

## Author

Sriram Palepu
"# ims-sre-assignment" 
