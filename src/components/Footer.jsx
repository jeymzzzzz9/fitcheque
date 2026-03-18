export default function Footer({ setPage }) {
  return (
    <footer style={{ background: "#111", color: "#fff", padding: 30 }}>
      <h2>FITCHEQUE</h2>

      <div>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("products")}>Products</button>
        <button onClick={() => setPage("about")}>About</button>
      </div>

      <p>© {new Date().getFullYear()} FITCHEQUE</p>
    </footer>
  );
}