import React, { useEffect, useState } from "react";
import axios from "axios";

const TablePage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(
        "https://localhost:7031/api/Tables/GetAllTable"
      );
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "available":
        return { backgroundColor: "#4CAF50", color: "white" };
      case "occupied":
        return { backgroundColor: "#F44336", color: "white" };
      case "reserved":
        return { backgroundColor: "#FFC107", color: "black" };
      default:
        return { backgroundColor: "#9E9E9E", color: "white" };
    }
  };

  const handleClick = (table) => {
    console.log("Clicked table:", table);
  };

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading tables...</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>Danh sách bàn</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "20px",
        }}
      >
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => handleClick(table)}
            style={{
              ...getStatusStyle(table.status),
              padding: "25px",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <div style={{ fontSize: "18px" }}>{table.name}</div>
            <div style={{ marginTop: "8px", fontSize: "14px" }}>
              {table.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablePage;