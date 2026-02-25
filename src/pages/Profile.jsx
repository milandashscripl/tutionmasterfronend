import { useEffect, useState, useRef } from "react";
import API from "../api/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    API.get("/user/me").then((res) => setUser(res.data)).catch(() => { window.location.href = "/"; });
  }, []);

  const handleEdit = () => setEditing(true);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const preview = URL.createObjectURL(f);
    setForm({ ...form, profilePic: f, preview });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const data = new FormData();
    Object.keys(form).forEach((k) => {
      if (form[k] instanceof File) data.append(k, form[k]);
      else if (form[k] !== undefined) data.append(k, form[k]);
    });
    try {
      const res = await API.put("/user/me", data, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h2>Profile</h2>
      {!editing ? (
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {user.profilePic?.url ? (<img src={user.profilePic.url} alt="profile" style={{ width: 96, height: 96, borderRadius: 12 }} />) : (<div style={{ width: 96, height: 96, borderRadius: 12, background: "#f3eee6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{(user.fullName||"U")[0]}</div>)}
            <div>
              <div style={{ fontWeight: 700 }}>{user.fullName}</div>
              <div className="muted">{user.email}</div>
              <div className="muted">{user.phone}</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={handleEdit}>Edit profile</button>
          </div>
        </div>
      ) : (
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Full name</label>
          <input name="fullName" defaultValue={user.fullName} onChange={handleChange} />

          <label style={{ display: "block", marginBottom: 6 }}>Email</label>
          <input name="email" defaultValue={user.email} onChange={handleChange} />

          <label style={{ display: "block", marginBottom: 6 }}>Phone</label>
          <input name="phone" defaultValue={user.phone} onChange={handleChange} />

          <label style={{ display: "block", marginBottom: 6 }}>Profile picture</label>
          <input type="file" accept="image/*" ref={fileRef} onChange={handleFile} />
          {form.preview && <img src={form.preview} alt="preview" style={{ width: 96, height: 96, borderRadius: 12 }} />}

          <div style={{ marginTop: 12 }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditing(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
