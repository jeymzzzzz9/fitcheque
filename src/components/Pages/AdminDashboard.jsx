import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

export default function AdminDashboard({ setPage }) {
  const { user, logout } = useApp();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div style={{ padding: 80, textAlign: "center" }}>
        <h2>Admin Access Only</h2>
        <button onClick={() => setPage("login")}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>

      <button onClick={() => setPage("home")}>View Store</button>
      <button onClick={logout}>Logout</button>

      <h3>Products</h3>

      {products.map((p) => (
        <div key={p.id} style={{ borderBottom: "1px solid #ccc", padding: 10 }}>
          {p.title} - ₱{p.price}
        </div>
      ))}
    </div>
  );
}