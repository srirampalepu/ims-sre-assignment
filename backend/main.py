from models import Base
from db import engine

# Create DB tables
Base.metadata.create_all(bind=engine)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # ✅ ADD THIS
from db import redis_client, mongo_db, SessionLocal
from models import Incident
import datetime
import time
import threading

app = FastAPI()

# ✅ CORS FIX (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# 🔍 Observability (Signals/sec)
# -----------------------------
request_count = 0
start_time = time.time()

def log_metrics():
    global request_count
    while True:
        print(f"Signals/sec: {request_count}")
        time.sleep(5)

threading.Thread(target=log_metrics, daemon=True).start()


# -----------------------------
# ❤️ Health Check
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# -----------------------------
# 🚨 Signal Ingestion API
# -----------------------------
@app.post("/signal")
def ingest_signal(payload: dict):
    global request_count, start_time

    # 🔒 Rate limiting (basic)
    if time.time() - start_time < 1:
        request_count += 1
    else:
        request_count = 1
        start_time = time.time()

    if request_count > 100:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    component = payload["component_id"]
    key = f"debounce:{component}"

    incident_id = redis_client.get(key)

    db = SessionLocal()

    # 🔁 Debouncing: attach to existing incident
    if incident_id:
        mongo_db.signals.insert_one({
            **payload,
            "incident_id": int(incident_id)
        })
        return {"message": "Attached to existing incident"}

    # 🆕 Create new incident
    incident = Incident(
        component_id=component,
        severity=payload["severity"]
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # ⏳ Debounce window = 10 sec
    redis_client.set(key, incident.id, ex=10)

    mongo_db.signals.insert_one({
        **payload,
        "incident_id": incident.id
    })

    return {"incident_id": incident.id}


# -----------------------------
# 📋 Get All Incidents
# -----------------------------
@app.get("/incidents")
def get_incidents():
    db = SessionLocal()
    incidents = db.query(Incident).all()

    return [
        {
            "id": i.id,
            "component_id": i.component_id,
            "status": i.status,
            "severity": i.severity,
            "start_time": str(i.start_time),
            "end_time": str(i.end_time) if i.end_time else None
        }
        for i in incidents
    ]


# -----------------------------
# 🧠 RCA API (with MTTR)
# -----------------------------
@app.post("/incident/{id}/rca")
def add_rca(id: int, payload: dict):
    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.rca = payload.get("rca")
    incident.end_time = datetime.datetime.utcnow()

    db.commit()

    mttr = (incident.end_time - incident.start_time).total_seconds()

    return {
        "message": "RCA added",
        "mttr_seconds": mttr
    }


# -----------------------------
# 🔄 Status Update API
# -----------------------------
@app.put("/incident/{id}/status")
def update_status(id: int, payload: dict):
    db = SessionLocal()
    incident = db.query(Incident).filter(Incident.id == id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    new_status = payload.get("status")

    # 🚫 Enforce RCA before closing
    if new_status == "CLOSED" and not incident.rca:
        raise HTTPException(status_code=400, detail="RCA required before closing")

    incident.status = new_status
    db.commit()

    return {"message": "Status updated"}
