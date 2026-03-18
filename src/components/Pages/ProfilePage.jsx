import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function ProfilePage({ setPage }) {
  const { user, logout, updateProfile } = useApp();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    fullname: user?.fullname || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p>Please login first.</p>
        <button onClick={() => setPage("login")}>LOGIN</button>
      </div>
    );
  }

  const save = async () => {
    await updateProfile(form);
    setEdit(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>My Profile</h2>

      {edit ? (
        <>
          <input
            value={form.fullname}
            onChange={(e) =>
              setForm({ ...form, fullname: e.target.value })
            }
          />

          <input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <button onClick={save}>Save</button>
          <button onClick={() => setEdit(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p>Name: {user.fullname}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone || "Not set"}</p>
          <p>Address: {user.address || "Not set"}</p>

          <button onClick={() => setEdit(true)}>Edit</button>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );
}