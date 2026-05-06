import requests
import random
import time

components = ["CACHE_CLUSTER_01", "DB_PRIMARY", "API_GATEWAY"]

while True:
    payload = {
        "component_id": random.choice(components),
        "severity": random.choice(["P0", "P1", "P2"]),
        "message": "Simulated error"
    }

    requests.post("http://localhost:8000/signal", json=payload)
    time.sleep(0.1)
