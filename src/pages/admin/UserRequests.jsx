import { useEffect, useState } from "react";
import API from "../../api/api";

export default function UserRequests() {

const [users,setUsers] = useState([]);
const [loading,setLoading] = useState(true);


/* FETCH PENDING USERS */

const fetchPending = async ()=>{

try{

const res = await API.get("/admin/pending");

setUsers(res.data);

}catch(err){

console.log(err);
alert("Failed to load pending users");

}

setLoading(false);

};


useEffect(()=>{
fetchPending();
},[]);


/* APPROVE USER */

const approveUser = async(id)=>{

const confirmApprove = window.confirm("Approve this user?");

if(!confirmApprove) return;

try{

await API.put(`/admin/approve/${id}`);

setUsers(prev => prev.filter(u => u._id !== id));

}catch(err){

console.log(err);
alert("Failed to approve user");

}

};


/* REMOVE USER */

const removeUser = async(id)=>{

const confirmDelete = window.confirm("Remove this user?");

if(!confirmDelete) return;

try{

await API.delete(`/admin/remove/${id}`);

setUsers(prev => prev.filter(u => u._id !== id));

}catch(err){

console.log(err);
alert("Failed to remove user");

}

};


/* LOADING STATE */

if(loading){
return <div className="admin-page"><h3>Loading requests...</h3></div>;
}


return (
  <div className="admin-page">
    <style>{`
      /* Mobile Card View */
      @media (max-width: 768px) {
        .admin-table, .admin-table thead, .admin-table tbody, .admin-table th, .admin-table td, .admin-table tr {
          display: block;
        }
        .admin-table thead {
          display: none; /* Hide headers on mobile */
        }
        .admin-table tr {
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 10px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .admin-table td {
          display: flex;
          justify-content: space-between;
          padding: 8px 5px;
          border: none;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        .admin-table td:last-child {
          border-bottom: none;
          justify-content: center;
          gap: 10px;
          padding-top: 15px;
        }
        /* Add labels before data on mobile */
        .admin-table td::before {
          content: attr(data-label);
          font-weight: bold;
          color: #666;
        }
      }

      /* Desktop Table View */
      @media (min-width: 769px) {
        .admin-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .admin-table th, .admin-table td { padding: 12px; border: 1px solid #eee; text-align: left; }
        .admin-table th { background: #f8f9fa; }
      }
    `}</style>

    <h2>Pending User Requests</h2>

    {users.length === 0 ? (
      <p>No pending requests</p>
    ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Aadhar</th>
            <th>Type</th>
            <th>Registered</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td data-label="Name">{u.fullName}</td>
              <td data-label="Email">{u.email}</td>
              <td data-label="Phone">{u.phone}</td>
              <td data-label="Aadhar">{u.aadhar}</td>
              <td data-label="Type">{u.registrationType}</td>
              <td data-label="Registered">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td data-label="Action">
                <button
                  onClick={() => approveUser(u._id)}
                  style={{
                    background: "green",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontWeight: "600"
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => removeUser(u._id)}
                  style={{
                    marginLeft: "5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    fontWeight: "600"
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

}