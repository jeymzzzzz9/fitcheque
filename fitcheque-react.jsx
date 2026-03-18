import { useState, useEffect, createContext, useContext } from "react";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("fitcheque_token");
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

const fmt = (n) => `₱${Number(n).toFixed(2)}`;
const salePrice = (price, discount) => discount > 0 ? price * (1 - discount / 100) : price;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "success" ? "#be185d" : t.type === "error" ? "#9f1239" : "#db2777",
          color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(190,24,93,0.35)", minWidth: 240,
          display: "flex", alignItems: "center", gap: 8, animation: "toastIn .3s ease"
        }}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { user, cart, logout } = useApp();
  const [open, setOpen] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const links = [
    { label: "NEW ARRIVALS", to: "products" },
    { label: "HOME", to: "home" },
    { label: "PRODUCT", to: "products" },
    { label: "CART", to: "cart" },
    { label: "ABOUT", to: "about" },
  ];

  return (
    <nav style={{ background: "#fff", borderBottom: "2px solid #fce7f3", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(190,24,93,0.08)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <button onClick={() => setPage("home")} style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#1a1a1a", letterSpacing: 2, background: "none", border: "none", cursor: "pointer" }}>FITCHEQUE</button>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map(l => (
            <button key={l.label} onClick={() => setPage(l.to)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, padding: "8px 12px", color: page === l.to ? "#be185d" : "#555", borderBottom: page === l.to ? "2px solid #be185d" : "2px solid transparent", transition: "all .2s" }}>{l.label}</button>
          ))}
          {user ? (
            <>
              {user.role === "admin" && (
                <button onClick={() => setPage("admin")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, padding: "8px 12px", color: page === "admin" ? "#be185d" : "#555", borderBottom: page === "admin" ? "2px solid #be185d" : "2px solid transparent" }}>ADMIN</button>
              )}
              <button onClick={() => setPage("profile")} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f9a8d4, #be185d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, border: "2px solid #fce7f3" }}>
                  {user.fullname?.charAt(0).toUpperCase()}
                </div>
              </button>
            </>
          ) : (
            <button onClick={() => setPage("login")} style={{ marginLeft: 8, background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 20, color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: 1, padding: "8px 18px", cursor: "pointer" }}>LOGIN</button>
          )}
          <button onClick={() => setPage("cart")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>
            <span style={{ fontSize: 20 }}>🛍</span>
            {cartCount > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: "#be185d", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, compact = false }) {
  const { addToCart } = useApp();
  const sp = salePrice(product.price, product.discount);
  return (
    <div style={{ background: "#fff", borderRadius: compact ? 8 : 14, overflow: "hidden", boxShadow: "0 2px 16px rgba(190,24,93,0.08)", border: "1px solid #fce7f3", transition: "transform .25s, box-shadow .25s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(190,24,93,0.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(190,24,93,0.08)"; }}>
      <div style={{ position: "relative", height: compact ? 140 : 220, overflow: "hidden" }}>
        <img src={product.image_url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
          onError={e => { e.target.src = "https://via.placeholder.com/400x300/fce7f3/be185d?text=FITCHEQUE"; }} />
        {product.discount > 0 && <span style={{ position: "absolute", top: 8, right: 8, background: "#be185d", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20 }}>-{product.discount}%</span>}
        {product.featured && <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.92)", color: "#be185d", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20, border: "1px solid #fce7f3" }}>FEATURED</span>}
      </div>
      <div style={{ padding: compact ? "10px 12px" : "16px" }}>
        <p style={{ color: "#db2777", fontSize: 10, fontWeight: 700, letterSpacing: 1.2, margin: "0 0 4px", textTransform: "uppercase" }}>{product.category}</p>
        <h3 style={{ margin: "0 0 6px", fontSize: compact ? 12 : 14, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, fontFamily: "'Playfair Display', serif" }}>{product.title}</h3>
        {!compact && <p style={{ color: "#888", fontSize: 12, margin: "0 0 10px", lineHeight: 1.5 }}>{product.description?.slice(0, 70)}...</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 8 : 12 }}>
          {product.discount > 0 && <span style={{ color: "#bbb", textDecoration: "line-through", fontSize: 12 }}>{fmt(product.price)}</span>}
          <span style={{ color: "#be185d", fontWeight: 800, fontSize: compact ? 14 : 16 }}>{fmt(sp)}</span>
        </div>
        <button onClick={() => addToCart(product)} style={{ width: "100%", background: "linear-gradient(135deg, #f9a8d4 0%, #be185d 100%)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: compact ? 10 : 12, letterSpacing: .8, padding: compact ? "7px 0" : "10px 0", cursor: "pointer" }}>ADD TO CART</button>
      </div>
    </div>
  );
}

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

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(products.map(p => p.category))];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    apiFetch(`/products?${params}`).then(data => { setProducts(data); setLoading(false); }).catch(() => setLoading(false));
  }, [category, search]);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)", padding: "32px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#1a1a1a", margin: "0 0 8px", letterSpacing: 2 }}>PRODUCTS</h1>
        <p style={{ color: "#be185d", fontSize: 13, margin: 0, fontWeight: 500 }}>Browse our curated thrift collection</p>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#db2777" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              style={{ width: "100%", paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: .8, cursor: "pointer", background: category === c ? "linear-gradient(135deg, #f9a8d4, #be185d)" : "#fff", color: category === c ? "#fff" : "#be185d", border: `1.5px solid ${category === c ? "transparent" : "#fce7f3"}` }}>{c}</button>
            ))}
          </div>
          <span style={{ color: "#aaa", fontSize: 12, marginLeft: "auto" }}>{products.length} items</span>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ width: 36, height: 36, border: "4px solid #fce7f3", borderTopColor: "#be185d", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍</div>
            <h3 style={{ color: "#be185d", fontFamily: "'Playfair Display', serif" }}>No products found</h3>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQty, user } = useApp();
  const subtotal = cart.reduce((s, i) => s + salePrice(i.price || i.products?.price, i.discount || i.products?.discount) * i.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 80;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  const getPrice = (item) => {
    const p = item.products || item;
    return salePrice(p.price, p.discount);
  };
  const getName = (item) => item.products?.title || item.title;
  const getImg = (item) => item.products?.image_url || item.image_url;
  const getCat = (item) => item.products?.category || item.category;

  return (
    <div style={{ background: "#fff5f7", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)", padding: "28px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#1a1a1a", margin: 0, letterSpacing: 2 }}>SHOPPING CART</h1>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: cart.length > 0 ? "1fr 340px" : "1fr", gap: 24 }}>
        <div>
          {cart.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: "60px 24px", textAlign: "center", border: "1px solid #fce7f3" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛍</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#be185d", marginBottom: 8 }}>Your cart is empty</h3>
              <p style={{ color: "#aaa", marginBottom: 24 }}>Start adding some beautiful pieces!</p>
              <button onClick={() => setPage("products")} style={{ background: "linear-gradient(135deg, #f9a8d4, #be185d)", color: "#fff", border: "none", borderRadius: 24, padding: "12px 32px", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>BROWSE PRODUCTS</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item, idx) => (
                <div key={item.id || idx} style={{ background: "#fff", borderRadius: 14, padding: 16, display: "flex", gap: 16, alignItems: "center", border: "1px solid #fce7f3", boxShadow: "0 2px 8px rgba(190,24,93,0.05)" }}>
                  <img src={getImg(item)} alt={getName(item)} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} onError={e => e.target.src = "https://via.placeholder.com/80/fce7f3/be185d?text=??"} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#db2777", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 3px", textTransform: "uppercase" }}>{getCat(item)}</p>
                    <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display', serif" }}>{getName(item)}</h4>
                    <span style={{ color: "#be185d", fontWeight: 800 }}>{fmt(getPrice(item))}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateQty(item.id || item.product_id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #fce7f3", background: "#fff5f7", cursor: "pointer", fontWeight: 800, color: "#be185d", fontSize: 16 }}>−</button>
                    <span style={{ fontWeight: 800, color: "#1a1a1a", width: 24, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id || item.product_id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #fce7f3", background: "#fff5f7", cursor: "pointer", fontWeight: 800, color: "#be185d", fontSize: 16 }}>+</button>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <div style={{ fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>{fmt(getPrice(item) * item.quantity)}</div>
                    <button onClick={() => removeFromCart(item.id || item.product_id)} style={{ background: "none", border: "none", color: "#f9a8d4", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Remove</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setPage("products")} style={{ background: "none", border: "1.5px solid #fce7f3", borderRadius: 10, color: "#be185d", fontWeight: 700, fontSize: 12, padding: "10px 20px", cursor: "pointer", alignSelf: "flex-start", letterSpacing: .8 }}>← CONTINUE SHOPPING</button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #fce7f3", height: "fit-content", boxShadow: "0 4px 20px rgba(190,24,93,0.08)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#1a1a1a", margin: "0 0 20px", paddingBottom: 14, borderBottom: "1.5px solid #fce7f3" }}>ORDER SUMMARY</h3>
            {[["Subtotal", fmt(subtotal)], ["Shipping", shipping === 0 ? "FREE" : fmt(shipping)], ["Tax (12%)", fmt(tax)]].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13, color: "#666" }}>
                <span>{label}</span><span style={{ fontWeight: 600, color: label === "Shipping" && shipping === 0 ? "#22c55e" : "#333" }}>{val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, color: "#1a1a1a", borderTop: "2px solid #fce7f3", paddingTop: 14, marginTop: 8 }}>
              <span>TOTAL</span><span style={{ color: "#be185d" }}>{fmt(total)}</span>
            </div>
            <button onClick={() => user ? {} : setPage("login")} style={{ width: "100%", background: "linear-gradient(135deg, #f9a8d4 0%, #be185d 100%)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 1, padding: "14px 0", cursor: "pointer", marginTop: 20 }}>
              {user ? "PROCEED TO CHECKOUT" : "LOGIN TO CHECKOUT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fff" }}>
      <div style={{ flex: 1, background: "linear-gradient(160deg, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: .12, backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, color: "#be185d", letterSpacing: 4, lineHeight: 1, marginBottom: 12 }}>FITCHEQUE</div>
          <div style={{ color: "#db2777", fontSize: 14, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase" }}>Fashion Store</div>
        </div>
      </div>
      <div style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#1a1a1a", letterSpacing: 2, marginBottom: 4 }}>FITCHEQUE</div>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>Sign in to your account</p>

          {error && <div style={{ background: "#fff5f7", border: "1px solid #fce7f3", borderLeft: "4px solid #be185d", borderRadius: 8, padding: "10px 14px", color: "#be185d", fontSize: 12, fontWeight: 600, marginBottom: 20 }}>⚠ {error}</div>}

          {[["USERNAME", username, setUsername, "text"], ["PASSWORD", password, setPassword, showPw ? "text" : "password"]].map(([label, val, setter, type]) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>{label}</label>
              <div style={{ position: "relative" }}>
                <input type={type} value={val} onChange={e => setter(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", padding: "11px 40px 11px 14px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#db2777"} onBlur={e => e.target.style.borderColor = "#fce7f3"} />
                {label === "PASSWORD" && <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#db2777", fontSize: 14 }}>{showPw ? "🙈" : "👁"}</button>}
              </div>
            </div>
          ))}

          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #f9a8d4 0%, #be185d 100%)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 1.5, padding: "13px 0", cursor: "pointer", marginTop: 8, opacity: loading ? .7 : 1 }}>
            {loading ? "SIGNING IN..." : "LOG IN"}
          </button>

          <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 24 }}>
            Don't have an account?{" "}
            <button onClick={() => setPage("signup")} style={{ background: "none", border: "none", color: "#be185d", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Sign up here</button>
          </p>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#ccc", fontSize: 12, cursor: "pointer" }}>← Back to store</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIGN UP PAGE ─────────────────────────────────────────────────────────────
function SignUpPage({ setPage }) {
  const { registerUser } = useApp();
  const [form, setForm] = useState({ fullname: "", username: "", email: "", password: "", confirm: "", phone: "", address: "" });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const pw = form.password;
  const pwReqs = [{ ok: pw.length >= 6, label: "At least 6 characters" }, { ok: /[A-Z]/.test(pw), label: "One uppercase letter" }, { ok: /[0-9]/.test(pw), label: "One number" }];

  const handleSubmit = async () => {
    const errs = [];
    if (!form.fullname) errs.push("Full name is required");
    if (form.username.length < 3) errs.push("Username must be at least 3 characters");
    if (!form.email.includes("@")) errs.push("Valid email is required");
    if (!pwReqs.every(r => r.ok)) errs.push("Password does not meet requirements");
    if (form.password !== form.confirm) errs.push("Passwords do not match");
    setErrors(errs);
    if (errs.length > 0) return;
    setLoading(true);
    try { await registerUser(form); }
    catch (err) { setErrors([err.message]); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fff" }}>
      <div style={{ flex: 1, background: "linear-gradient(160deg, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: .12, backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=60')", backgroundSize: "cover" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, color: "#be185d", letterSpacing: 4 }}>FITCHEQUE</div>
          <div style={{ color: "#db2777", fontSize: 14, fontWeight: 500, letterSpacing: 3 }}>Join Our Community</div>
        </div>
      </div>
      <div style={{ width: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 40px", background: "#fff", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#1a1a1a", letterSpacing: 2, marginBottom: 4 }}>FITCHEQUE</div>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 24 }}>Create your account</p>

          {errors.length > 0 && <div style={{ background: "#fff5f7", border: "1px solid #fce7f3", borderLeft: "4px solid #be185d", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>{errors.map((e, i) => <p key={i} style={{ color: "#be185d", fontSize: 12, fontWeight: 600, margin: "2px 0" }}>⚠ {e}</p>)}</div>}

          <div style={{ background: "#fff5f7", borderRadius: 10, padding: "10px 14px", marginBottom: 20, border: "1px solid #fce7f3" }}>
            <p style={{ color: "#db2777", fontSize: 10, fontWeight: 800, letterSpacing: 1, margin: "0 0 6px" }}>PASSWORD REQUIREMENTS</p>
            {pwReqs.map(r => <p key={r.label} style={{ fontSize: 11, margin: "3px 0", color: r.ok ? "#22c55e" : "#ccc", fontWeight: r.ok ? 700 : 400 }}>{r.ok ? "✓" : "○"} {r.label}</p>)}
          </div>

          {[["EMAIL", "email", "email"], ["USERNAME", "username", "text"], ["FULL NAME", "fullname", "text"], ["PHONE", "phone", "tel"], ["PASSWORD", "password", "password"], ["CONFIRM PASSWORD", "confirm", "password"]].map(([label, key, type]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key]} onChange={sf(key)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#db2777"} onBlur={e => e.target.style.borderColor = "#fce7f3"} />
              {key === "confirm" && form.confirm && <p style={{ fontSize: 11, margin: "4px 0 0", color: form.password === form.confirm ? "#22c55e" : "#be185d", fontWeight: 600 }}>{form.password === form.confirm ? "✓ Passwords match" : "✗ Do not match"}</p>}
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>ADDRESS</label>
            <textarea value={form.address} onChange={sf("address")} rows={2} style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box", resize: "none" }} onFocus={e => e.target.style.borderColor = "#db2777"} onBlur={e => e.target.style.borderColor = "#fce7f3"} />
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #f9a8d4 0%, #be185d 100%)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 1.5, padding: "13px 0", cursor: "pointer", marginTop: 8, opacity: loading ? .7 : 1 }}>
            {loading ? "CREATING ACCOUNT..." : "LOG IN"}
          </button>

          <p style={{ textAlign: "center", color: "#aaa", fontSize: 12, marginTop: 20 }}>
            Already have an account?{" "}
            <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "#be185d", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Login here</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ setPage }) {
  const { user, logout, updateProfile } = useApp();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ fullname: user?.fullname || "", phone: user?.phone || "", address: user?.address || "" });
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <p style={{ color: "#be185d" }}>Please login to view your profile.</p>
      <button onClick={() => setPage("login")} style={{ background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 20, color: "#fff", fontWeight: 700, padding: "10px 28px", cursor: "pointer", marginTop: 12 }}>LOGIN</button>
    </div>
  );

  const save = async () => {
    setLoading(true);
    try { await updateProfile(form); setEdit(false); }
    catch (err) { alert(err.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff5f7" }}>
      <div style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", color: "#be185d", fontSize: 20, fontWeight: 700 }}>←</button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#1a1a1a", margin: 0, letterSpacing: 1 }}>MY PROFILE</h2>
      </div>
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #fce7f3", boxShadow: "0 4px 24px rgba(190,24,93,0.08)" }}>
          <div style={{ background: "linear-gradient(135deg, #fce7f3, #f9a8d4)", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 16px", background: "linear-gradient(135deg, #f9a8d4, #be185d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#fff", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(190,24,93,0.25)" }}>
              {user.fullname?.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#1a1a1a", margin: "0 0 4px" }}>{user.fullname}</h2>
            <p style={{ color: "#db2777", fontSize: 12, fontWeight: 600, letterSpacing: 1, margin: 0, textTransform: "uppercase" }}>{user.username}</p>
            <span style={{ display: "inline-block", marginTop: 10, background: user.role === "admin" ? "#be185d" : "#f9a8d4", color: user.role === "admin" ? "#fff" : "#be185d", fontSize: 10, fontWeight: 800, padding: "4px 14px", borderRadius: 20, letterSpacing: 1 }}>{user.role?.toUpperCase()}</span>
          </div>
          <div style={{ padding: 28 }}>
            {edit ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Full Name", "fullname", "text"], ["Phone Number", "phone", "tel"], ["Address", "address", "text"]].map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>{label.toUpperCase()}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "#db2777"} onBlur={e => e.target.style.borderColor = "#fce7f3"} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={save} disabled={loading} style={{ flex: 1, background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, padding: "12px 0", cursor: "pointer", opacity: loading ? .7 : 1 }}>{loading ? "SAVING..." : "SAVE CHANGES"}</button>
                  <button onClick={() => setEdit(false)} style={{ flex: 1, background: "#fff", border: "1.5px solid #fce7f3", borderRadius: 10, color: "#be185d", fontWeight: 700, fontSize: 13, padding: "12px 0", cursor: "pointer" }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <div>
                {[["EMAIL", user.email], ["PHONE NUMBER", user.phone || "Not set"], ["ADDRESS", user.address || "Not set"]].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #fce7f3" }}>
                    <p style={{ color: "#aaa", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, margin: "0 0 6px" }}>{label}</p>
                    <p style={{ color: val === "Not set" ? "#ddd" : "#333", fontSize: 14, fontWeight: 600, margin: 0 }}>{val}</p>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={() => setEdit(true)} style={{ flex: 1, background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 13, padding: "12px 0", cursor: "pointer" }}>EDIT PROFILE</button>
                  <button onClick={() => { logout(); setPage("home"); }} style={{ flex: 1, background: "#fff", border: "1.5px solid #fce7f3", borderRadius: 10, color: "#be185d", fontWeight: 700, fontSize: 13, padding: "12px 0", cursor: "pointer" }}>LOGOUT</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ background: "#fff" }}>
      <div style={{ background: "linear-gradient(160deg, #fce7f3 0%, #fbcfe8 60%, #f9a8d4 100%)", padding: "60px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .1, backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=60')", backgroundSize: "cover" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, color: "#1a1a1a", margin: "0 0 12px", letterSpacing: 3 }}>ABOUT FITCHEQUE</h1>
          <p style={{ color: "#be185d", fontSize: 15, fontWeight: 500, maxWidth: 500, margin: "0 auto" }}>Your premier destination for curated thrift fashion since 2023</p>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1a1a1a", borderBottom: "3px solid #fce7f3", paddingBottom: 12, marginBottom: 20 }}>Our Story</h2>
        <p style={{ color: "#555", lineHeight: 1.9, fontSize: 15, marginBottom: 16 }}>FITCHEQUE was founded in 2023 with a simple mission: to make premium fashion accessible to everyone. What started as a small boutique has grown into a leading online thrift fashion destination across the Philippines.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, margin: "40px 0" }}>
          {[["🎯","Our Mission","To provide high-quality thrift fashion at affordable prices while delivering exceptional customer service and supporting sustainable practices."],["👁","Our Vision","To become the Philippines' most trusted thrift fashion brand, where everyone can find their perfect style."]].map(([icon, title, desc]) => (
            <div key={title} style={{ background: "linear-gradient(135deg, #fff5f7, #fce7f3)", borderRadius: 16, padding: 28, border: "1px solid #fce7f3", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#1a1a1a", marginBottom: 10 }}>{title}</h3>
              <p style={{ color: "#777", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background: "#be185d", borderRadius: 20, padding: "40px 32px", color: "#fff", margin: "40px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {[["10,000+","Happy Customers"],["500+","Products"],["50+","Brands"],["24/7","Support"]].map(([n, l]) => (
            <div key={l}><div style={{ fontSize: 28, fontWeight: 900, color: "#fce7f3", marginBottom: 4 }}>{n}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ setPage }) {
  const { user, logout } = useApp();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editP, setEditP] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", discount: "0", category: "", stock: "", featured: false, image_url: "" });
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const categories = ["Tops", "Bottoms", "Dresses", "Jackets", "Accessories"];

  const showMsg = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    Promise.all([apiFetch("/products"), apiFetch("/admin/stats")])
      .then(([p, s]) => { setProducts(p); setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!user || user.role !== "admin") return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#be185d" }}>Admin Access Required</h2>
      <button onClick={() => setPage("login")} style={{ background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 20, color: "#fff", fontWeight: 700, padding: "10px 28px", cursor: "pointer", marginTop: 16 }}>LOGIN AS ADMIN</button>
    </div>
  );

  const openAdd = () => { setForm({ title: "", description: "", price: "", discount: "0", category: "", stock: "", featured: false, image_url: "" }); setEditP(null); setModal(true); };
  const openEdit = p => { setForm({ title: p.title, description: p.description, price: p.price, discount: p.discount, category: p.category, stock: p.stock, featured: !!p.featured, image_url: p.image_url }); setEditP(p); setModal(true); };

  const save = async () => {
    try {
      if (editP) {
        const updated = await apiFetch(`/products/${editP.id}`, { method: "PUT", body: JSON.stringify({ ...form, price: +form.price, discount: +form.discount, stock: +form.stock }) });
        setProducts(ps => ps.map(p => p.id === editP.id ? updated.product : p));
        showMsg("Product updated!");
      } else {
        const created = await apiFetch("/products", { method: "POST", body: JSON.stringify({ ...form, price: +form.price, discount: +form.discount, stock: +form.stock }) });
        setProducts(ps => [created.product, ...ps]);
        showMsg("Product added!");
      }
      setModal(false);
    } catch (err) { showMsg(err.message, "error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await apiFetch(`/products/${id}`, { method: "DELETE" }); setProducts(ps => ps.filter(p => p.id !== id)); showMsg("Deleted!"); }
    catch (err) { showMsg(err.message, "error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff5f7" }}>
      <header style={{ background: "linear-gradient(135deg, #1a1a1a, #2d1d2e)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>FITCHEQUE</span>
          <span style={{ background: "#be185d", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: 1 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>View Store</button>
          <button onClick={() => { logout(); setPage("login"); }} style={{ background: "#be185d", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontWeight: 700 }}>Logout</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 28 }}>
          {[["📦", stats.total_products || 0, "Products", "#be185d"], ["👥", stats.total_customers || 0, "Customers", "#db2777"], ["🛍", stats.total_orders || 0, "Orders", "#f472b6"], ["₱", `₱${(stats.total_revenue || 0).toFixed(0)}`, "Revenue", "#be185d"], ["⚠️", stats.low_stock || 0, "Low Stock", "#9f1239"]].map(([icon, val, label, color]) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #fce7f3", boxShadow: "0 2px 12px rgba(190,24,93,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 2 }}>{val}</div>
              <div style={{ color: "#888", fontSize: 11, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {msg && <div style={{ borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, background: msg.type === "success" ? "#f0fdf4" : "#fff5f7", borderLeft: `4px solid ${msg.type === "success" ? "#22c55e" : "#be185d"}`, color: msg.type === "success" ? "#16a34a" : "#be185d" }}>{msg.type === "success" ? "✓" : "✗"} {msg.text}</div>}

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", overflow: "hidden", boxShadow: "0 2px 16px rgba(190,24,93,0.06)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #fce7f3", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>Product Management</h2>
            <button onClick={openAdd} style={{ background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 12, padding: "9px 20px", cursor: "pointer", letterSpacing: .8 }}>+ ADD PRODUCT</button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 36, height: 36, border: "4px solid #fce7f3", borderTopColor: "#be185d", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} /></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}>
                    {["Image", "Product", "Category", "Price", "Stock", "Featured", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#be185d", letterSpacing: 1.2, textTransform: "uppercase", borderBottom: "1.5px solid #fce7f3" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #fce7f3", background: i % 2 === 0 ? "#fff" : "#fff8fb" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fff5f7"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fff8fb"}>
                      <td style={{ padding: "10px 14px" }}><img src={p.image_url} alt={p.title} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "1px solid #fce7f3" }} onError={e => e.target.src = "https://via.placeholder.com/52/fce7f3/be185d?text=?"} /></td>
                      <td style={{ padding: "10px 14px" }}><div style={{ fontWeight: 700, color: "#1a1a1a" }}>{p.title}</div><div style={{ color: "#bbb", fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div></td>
                      <td style={{ padding: "10px 14px" }}><span style={{ background: "#fff5f7", color: "#be185d", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #fce7f3" }}>{p.category}</span></td>
                      <td style={{ padding: "10px 14px" }}>{p.discount > 0 ? (<div><div style={{ textDecoration: "line-through", color: "#ccc", fontSize: 11 }}>{fmt(p.price)}</div><div style={{ fontWeight: 800, color: "#be185d" }}>{fmt(salePrice(p.price, p.discount))}</div></div>) : <div style={{ fontWeight: 700 }}>{fmt(p.price)}</div>}</td>
                      <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: p.stock === 0 ? "#fff5f5" : p.stock < 5 ? "#fffbeb" : "#f0fdf4", color: p.stock === 0 ? "#ef4444" : p.stock < 5 ? "#f59e0b" : "#22c55e" }}>{p.stock === 0 ? "Out" : p.stock < 5 ? `${p.stock} Low` : p.stock}</span></td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>{p.featured ? <span style={{ color: "#f9a8d4", fontSize: 18 }}>★</span> : <span style={{ color: "#eee" }}>–</span>}</td>
                      <td style={{ padding: "10px 14px" }}><div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#3b82f6", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}>Edit</button>
                        <button onClick={() => del(p.id)} style={{ background: "#fff5f7", border: "1px solid #fce7f3", color: "#be185d", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}>Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ background: "linear-gradient(135deg, #1a1a1a, #2d1d2e)", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "20px 20px 0 0" }}>
              <h3 style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>{editP ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["Title *", "title", "text"], ["Category *", "category", "select"], ["Price (₱) *", "price", "number"], ["Discount (%)", "discount", "number"], ["Stock *", "stock", "number"]].map(([label, key, type]) => (
                  <div key={key} style={key === "title" ? { gridColumn: "1 / -1" } : {}}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>{label.toUpperCase()}</label>
                    {type === "select" ? (
                      <select value={form[key]} onChange={sf(key)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7" }}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={form[key]} onChange={sf(key)} min={type === "number" ? 0 : undefined}
                        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box" }}
                        onFocus={e => e.target.style.borderColor = "#db2777"} onBlur={e => e.target.style.borderColor = "#fce7f3"} />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={sf("description")} rows={3} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box", resize: "none" }} onFocus={e => e.target.style.borderColor = "#db2777"} onBlur={e => e.target.style.borderColor = "#fce7f3"} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: 1.5, marginBottom: 6 }}>IMAGE URL</label>
                <input value={form.image_url} onChange={sf("image_url")} placeholder="https://..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #fce7f3", borderRadius: 10, fontSize: 13, outline: "none", background: "#fff5f7", boxSizing: "border-box" }} />
                {form.image_url && <img src={form.image_url} alt="" style={{ marginTop: 8, height: 80, width: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #fce7f3" }} onError={e => e.target.style.display = "none"} />}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555" }}>
                <input type="checkbox" checked={form.featured} onChange={sf("featured")} style={{ width: 16, height: 16, accentColor: "#be185d" }} />
                ⭐ Feature this product on homepage
              </label>
              <button onClick={save} style={{ background: "linear-gradient(135deg, #f9a8d4, #be185d)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 1, padding: "14px 0", cursor: "pointer", marginTop: 4 }}>
                {editP ? "SAVE CHANGES" : "ADD PRODUCT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background: "#1a1a1a", color: "#fff", padding: "48px 0 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "#f9a8d4", letterSpacing: 2, marginBottom: 12 }}>FITCHEQUE</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>Your premier destination for curated pre-loved fashion. Sustainable style, accessible to all.</p>
          </div>
          <div>
            <h4 style={{ color: "#f9a8d4", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>QUICK LINKS</h4>
            {[["Home","home"],["Products","products"],["About","about"]].map(([l,p]) => (
              <button key={l} onClick={() => setPage(p)} style={{ display: "block", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "left", marginBottom: 8, padding: 0 }}>{l}</button>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f9a8d4", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>HELP</h4>
            {["Shipping Policy","Return Policy","Privacy Policy"].map(l => <p key={l} style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8 }}>{l}</p>)}
          </div>
          <div>
            <h4 style={{ color: "#f9a8d4", fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>CONTACT</h4>
            {["📍 Quezon City, PH","📞 (555) 123-4567","✉️ info@fitcheque.com"].map(t => <p key={t} style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8 }}>{t}</p>)}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          © {new Date().getFullYear()} FITCHEQUE. All rights reserved. Made with 🩷 for fashion lovers.
        </div>
      </div>
    </footer>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("fitcheque_user")); } catch { return null; } });
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  // Load cart from server when user logs in
  useEffect(() => {
    if (user) {
      apiFetch("/cart").then(data => setCart(data)).catch(() => {});
    } else {
      setCart([]);
    }
  }, [user?.id]);

  const login = async (username, password) => {
    const data = await apiFetch("/login", { method: "POST", body: JSON.stringify({ username, password }) });
    localStorage.setItem("fitcheque_token", data.token);
    localStorage.setItem("fitcheque_user", JSON.stringify(data.user));
    setUser(data.user);
    toast(`Welcome back, ${data.user.fullname}! 🌸`, "success");
    setPage(data.user.role === "admin" ? "admin" : "home");
  };

  const logout = () => {
    localStorage.removeItem("fitcheque_token");
    localStorage.removeItem("fitcheque_user");
    setUser(null);
    setCart([]);
    toast("Logged out successfully.", "info");
    setPage("home");
  };

  const registerUser = async (form) => {
    const data = await apiFetch("/register", { method: "POST", body: JSON.stringify(form) });
    localStorage.setItem("fitcheque_token", data.token);
    localStorage.setItem("fitcheque_user", JSON.stringify(data.user));
    setUser(data.user);
    toast(`Welcome to FITCHEQUE, ${data.user.username}! 🌸`, "success");
    setPage("home");
  };

  const updateProfile = async (form) => {
    const data = await apiFetch("/me", { method: "PUT", body: JSON.stringify(form) });
    const updated = { ...user, ...data.user };
    localStorage.setItem("fitcheque_user", JSON.stringify(updated));
    setUser(updated);
    toast("Profile updated! ✨", "success");
  };

  const addToCart = async (product) => {
    if (user) {
      try {
        await apiFetch("/cart", { method: "POST", body: JSON.stringify({ product_id: product.id, quantity: 1 }) });
        const updated = await apiFetch("/cart");
        setCart(updated);
      } catch {}
    } else {
      setCart(c => {
        const found = c.find(i => i.id === product.id);
        if (found) return c.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...c, { ...product, quantity: 1 }];
      });
    }
    toast(`${product.title} added to cart! 🛍`, "success");
  };

  const removeFromCart = async (id) => {
    if (user) {
      try { await apiFetch(`/cart/${id}`, { method: "DELETE" }); const updated = await apiFetch("/cart"); setCart(updated); }
      catch {}
    } else {
      setCart(c => c.filter(i => i.id !== id));
    }
  };

  const updateQty = async (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    if (user) {
      try { await apiFetch(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity: qty }) }); const updated = await apiFetch("/cart"); setCart(updated); }
      catch {}
    } else {
      setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }
  };

  const noNav = ["login", "signup"].includes(page);
  const noFooter = ["login", "signup", "admin"].includes(page);

  const ctx = { user, cart, login, logout, registerUser, updateProfile, addToCart, removeFromCart, updateQty, toast };

  return (
    <AppContext.Provider value={ctx}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #fff5f7; }
        ::-webkit-scrollbar-thumb { background: #f9a8d4; border-radius: 3px; }
      `}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Toast toasts={toasts} />
        {!noNav && <Navbar page={page} setPage={setPage} />}
        <main style={{ flex: 1 }}>
          {page === "home" && <HomePage setPage={setPage} />}
          {page === "products" && <ProductsPage />}
          {page === "cart" && <CartPage setPage={setPage} />}
          {page === "about" && <AboutPage />}
          {page === "login" && <LoginPage setPage={setPage} />}
          {page === "signup" && <SignUpPage setPage={setPage} />}
          {page === "profile" && <ProfilePage setPage={setPage} />}
          {page === "admin" && <AdminDashboard setPage={setPage} />}
        </main>
        {!noFooter && <Footer setPage={setPage} />}
      </div>
    </AppContext.Provider>
  );
}
