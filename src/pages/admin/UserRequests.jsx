import { useEffect, useState } from "react";
import API from "../../api/api";

export default function UserRequests() {

  const [users, setUsers] = useState([]);

  const fetchPending = async () => {

    try {

      const res = await API.get("/admin/pending");

      setUsers(res.data);

    } catch (err) {
      console.log(err);
    }

  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approveUser = async (id) => {

    try {

      await API.put(`/admin/approve/${id}`);

      fetchPending();

    } catch (err) {
      console.log(err);
    }

  };

  return (

    <div className="admin-page">

      <h2>Pending User Requests</h2>

      <table className="admin-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {users.map((u) => (

            <tr key={u._id}>

              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.registrationType}</td>

              <td>
                <button onClick={() => approveUser(u._id)}>
                  Approve
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}