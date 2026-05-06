import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Use localhost for portability
const BASE_URL = process.env.REACT_APP_API || "http://localhost:8000";

function App() {
  const [incidents, setIncidents] = useState([]);
  const [rcaInputs, setRcaInputs] = useState({});
  const [search, setSearch] = useState("");

  const fetchIncidents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/incidents`);
      setIncidents(res.data);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    }
  };

  const addRCA = async (id) => {
    await axios.post(`${BASE_URL}/incident/${id}/rca`, {
      rca: rcaInputs[id] || ""
    });
    fetchIncidents();
  };

  const updateStatus = async (id) => {
    await axios.put(`${BASE_URL}/incident/${id}/status`, {
      status: "CLOSED"
    });
    fetchIncidents();
  };

  // 📊 Stats
  const stats = {
    total: incidents.length,
    p0: incidents.filter(i => i.severity === "P0").length,
    p1: incidents.filter(i => i.severity === "P1").length,
    p2: incidents.filter(i => i.severity === "P2").length,
    closed: incidents.filter(i => i.status === "CLOSED").length
  };

  const getSeverityColor = (severity) => {
    if (severity === "P0") return "#ef4444";
    if (severity === "P1") return "#f97316";
    return "#3b82f6";
  };

  const getStatusColor = (status) => {
    return status === "OPEN" ? "#ef4444" : "#22c55e";
  };

  // ⏱️ MTTR calculation
  const calculateMTTR = (start, end) => {
    if (!end) return null;
    const diff = new Date(end) - new Date(start);
    return Math.floor(diff / 1000);
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 FILTER + SORT
  const filteredIncidents = [...incidents]
    .filter(i =>
      i.component_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2 };
      return order[a.severity] - order[b.severity];
    });

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🚨 Incident Dashboard</h1>

      {/* 🔍 SEARCH */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <input
          placeholder="Search component..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      {/* 📊 STATS */}
      <div style={styles.statsContainer}>
        <StatBox label="Total" value={stats.total} color="#6366f1" />
        <StatBox label="P0" value={stats.p0} color="#ef4444" />
        <StatBox label="P1" value={stats.p1} color="#f97316" />
        <StatBox label="P2" value={stats.p2} color="#3b82f6" />
        <StatBox label="Closed" value={stats.closed} color="#22c55e" />
      </div>

      <button style={styles.refreshBtn} onClick={fetchIncidents}>
        🔄 Refresh
      </button>

      {filteredIncidents.map((i) => {
        const mttr = calculateMTTR(i.start_time, i.end_time);

        return (
          <div key={i.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3>{i.component_id}</h3>

              <div>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: getSeverityColor(i.severity)
                  }}
                >
                  {i.severity}
                </span>

                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(i.status),
                    marginLeft: "10px"
                  }}
                >
                  {i.status}
                </span>
              </div>
            </div>

            {/* ⏱️ TIMESTAMPS */}
            <p style={styles.meta}>Started: {i.start_time}</p>

            {i.end_time && (
              <p style={styles.meta}>Closed: {i.end_time}</p>
            )}

            {mttr && (
              <p style={{ ...styles.meta, color: "#22c55e" }}>
                MTTR: {mttr} seconds
              </p>
            )}

            <input
              placeholder="Enter RCA"
              value={rcaInputs[i.id] || ""}
              onChange={(e) =>
                setRcaInputs({
                  ...rcaInputs,
                  [i.id]: e.target.value
                })
              }
              style={styles.input}
            />

            <div style={styles.buttonGroup}>
              <button style={styles.rcaBtn} onClick={() => addRCA(i.id)}>
                Add RCA
              </button>

              <button
                style={styles.closeBtn}
                disabled={!rcaInputs[i.id]}
                onClick={() => updateStatus(i.id)}
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 📊 Stat box
const StatBox = ({ label, value, color }) => (
  <div style={{ ...styles.statBox, borderColor: color }}>
    <h2 style={{ color }}>{value}</h2>
    <p>{label}</p>
  </div>
);

const styles = {
  container: {
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    padding: "20px",
    color: "#fff",
    fontFamily: "Arial"
  },
  header: {
    textAlign: "center",
    marginBottom: "20px"
  },
  search: {
    padding: "10px",
    width: "300px",
    borderRadius: "6px",
    border: "none"
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "20px"
  },
  statBox: {
    border: "2px solid",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center",
    width: "100px",
    backgroundColor: "#1e293b"
  },
  refreshBtn: {
    display: "block",
    margin: "0 auto 20px",
    padding: "10px 20px",
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "15px"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between"
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "12px"
  },
  meta: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "5px"
  },
  input: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    borderRadius: "6px",
    border: "none"
  },
  buttonGroup: {
    marginTop: "15px"
  },
  rcaBtn: {
    marginRight: "10px",
    padding: "8px 12px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  closeBtn: {
    padding: "8px 12px",
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default App;
