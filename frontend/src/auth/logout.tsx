import { useState } from "react";

export default function LogoutPage() {
  const [showModal, setShowModal] = useState(true);

  const handleLogout = () => {
    // Clear ALL localStorage
    localStorage.clear();

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter",
      }}
    >
      {showModal && (
        <div
          style={{
            width: "420px",
            padding: "32px",
            background: "#0a1a33",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            boxShadow: "0 10px 35px rgba(0,0,0,0.4)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "12px", fontSize: "24px" }}>Confirm Logout</h2>
          <p style={{ marginBottom: "24px", color: "#b5c7de" }}>
            Are you sure you want to log out? You will be redirected to the login page.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 22px",
                background: "#2596be",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Logout
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "12px 22px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
