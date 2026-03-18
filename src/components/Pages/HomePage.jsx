// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/products/featured"),
      apiFetch("/products")
    ]).then(([f, p]) => { setFeatured(f); setProducts(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ width: 40, height: 40, border: "4px solid #fce7f3", borderTopColor: "#be185d", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
      <p style={{ color: "#be185d", fontWeight: 600 }}>Loading FITCHEQUE...</p>
    </div>
  );

  return (
    <div style={{ background: "#fff" }}>
      {/* Hero banner */}
      <section style={{ background: "linear-gradient(135deg, #fff0f6 0%, #fce7f3 50%, #fbcfe8 100%)", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {featured.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, borderRadius: 12, overflow: "hidden", height: 280 }}>
              {featured.slice(0, 4).map(p => (
                <div key={p.id} style={{ position: "relative", overflow: "hidden" }}>
                  <img src={p.image_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "https://via.placeholder.com/300x280/fce7f3/be185d?text=FITCHEQUE"} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(0deg, rgba(190,24,93,0.7) 0%, transparent 100%)", padding: "20px 12px 12px" }}>
                    <p style={{ color: "#fff", fontSize: 11, fontWeight: 700, margin: 0 }}>{p.title}</p>
                    <p style={{ color: "#fce7f3", fontSize: 12, fontWeight: 800, margin: "2px 0 0" }}>{fmt(salePrice(p.price, p.discount))}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 280, background: "linear-gradient(135deg, #fce7f3, #f9a8d4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, color: "#be185d", letterSpacing: 4 }}>FITCHEQUE</div>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{ background: "#fff5f7", padding: "40px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#1a1a1a", margin: 0, letterSpacing: 1 }}>NEW ARRIVALS</h2>
            <button onClick={() => setPage("products")} style={{ background: "none", border: "1px solid #be185d", color: "#be185d", borderRadius: 20, padding: "6px 18px", fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>VIEW ALL</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} compact={true} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "#be185d", padding: "20px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {[["🚚","FREE SHIPPING","Orders over ₱500"],["↩","30-DAY RETURNS","Easy return policy"],["🔒","SECURE PAYMENT","100% protected"],["💬","24/7 SUPPORT","Always here for you"]].map(([icon, title, sub]) => (
            <div key={title}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
              <div style={{ color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{title}</div>
              <div style={{ color: "#fce7f3", fontSize: 10, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}