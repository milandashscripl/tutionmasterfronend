import { useEffect, useState } from "react";
import API from "../../api/api";

export default function UserRequests() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FETCH PENDING USERS */
  const fetchPending = async () => {
    try {
      const res = await API.get("/admin/pending");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load pending users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  /* APPROVE USER */
  const approveUser = async (id) => {
    const confirmApprove = window.confirm("Approve this user?");
    if (!confirmApprove) return;
    try {
      await API.put(`/admin/approve/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.log(err);
      alert("Failed to approve user");
    }
  };

  /* REMOVE USER */
  const removeUser = async (id) => {
    const confirmDelete = window.confirm("Remove this user?");
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/remove/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.log(err);
      alert("Failed to remove user");
    }
  };

  if (loading) {
    return <div className="admin-page"><Loader message="Loading requests..." className="mx-auto" /></div>;
  }

  return (
    <div className="admin-page">
      {/* INTERNAL CSS FOR REFINEMENT */}
      <style>{`
        .admin-page { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .request-header { margin-bottom: 20px; border-bottom: 2px solid var(--accent-1); padding-bottom: 10px; }
        
        /* Desktop Style */
        .desktop-view { display: block; }
        .mobile-view { display: none; }
        .admin-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .admin-table th { background: #f4f4f4; padding: 15px; text-align: left; font-size: 14px; color: #666; }
        .admin-table td { padding: 15px; border-top: 1px solid #eee; font-size: 14px; }

        /* Mobile Style */
        @media (max-width: 768px) {
          .desktop-view { display: none; }
          .mobile-view { display: block; }
          .user-card { background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #eee; }
          .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .card-label { font-weight: bold; color: #888; }
          .card-actions { display: flex; gap: 10px; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; }
          .card-actions button { flex: 1; }
        }

        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.8; }
        .btn-approve { background: #28a745; color: white; }
        .btn-remove { background: #dc3545; color: white; }
      `}</style>

      <div className="request-header">
        <h2>Pending User Requests ({users.length})</h2>
      </div>

      {users.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "50px", color: "#999" }}>No pending requests at the moment.</p>
      ) : (
        <>
          {/* 1. DESKTOP VIEW (TABLE) */}
          <div className="desktop-view">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Aadhar</th>
                  <th>Type</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: "600" }}>{u.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#777" }}>{u.email} | {u.phone}</div>
                    </td>
                    <td>{u.aadhar}</td>
                    <td><span style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>{u.registrationType}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-approve" onClick={() => approveUser(u._id)}>Approve</button>
                      <button className="btn btn-remove" style={{ marginLeft: "8px" }} onClick={() => removeUser(u._id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE VIEW (CARDS) */}
          <div className="mobile-view">
            {users.map((u) => (
              <div className="user-card" key={u._id}>
                <div className="card-row">
                  <span className="card-label">Name</span>
                  <span style={{ fontWeight: "600" }}>{u.fullName}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Email</span>
                  <span>{u.email}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Phone</span>
                  <span>{u.phone}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Aadhar</span>
                  <span>{u.aadhar}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Type</span>
                  <span style={{ color: "#4f46e5", fontWeight: "600" }}>{u.registrationType}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Date</span>
                  <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="card-actions">
                  <button className="btn btn-approve" onClick={() => approveUser(u._id)}>Approve</button>
                  <button className="btn btn-remove" onClick={() => removeUser(u._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}  