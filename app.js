import { useState } from "react";

import Navbar from "./Navbar";
import Footer from "./components/Footer";

import HomePage from "./Pages/HomePage";
import ProductsPage from "./Pages/ProductPage";
import CartPage from "./Pages/CartPage";
import LoginPage from "./Pages/LoginPage";
import SignUpPage from "./Pages/SignUpPage";
import ProfilePage from "./Pages/ProfilePage";
import AboutPage from "./Pages/AboutPage";
import AdminDashboard from "./Pages/AdminDashboard";

import AppContext from "./context/AppContext";

function App() {
  const [page, setPage] = useState("home");

  const contextValue = {
    page,
    setPage
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Navbar page={page} setPage={setPage} />

      <main>
        {page === "home" && <HomePage setPage={setPage} />}
        {page === "products" && <ProductsPage />}
        {page === "cart" && <CartPage setPage={setPage} />}
        {page === "login" && <LoginPage setPage={setPage} />}
        {page === "signup" && <SignUpPage setPage={setPage} />}
        {page === "profile" && <ProfilePage setPage={setPage} />}
        {page === "about" && <AboutPage />}
        {page === "admin" && <AdminDashboard setPage={setPage} />}
      </main>

      <Footer setPage={setPage} />
    </AppContext.Provider>
  );
}

export default App;