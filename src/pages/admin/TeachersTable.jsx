import { useEffect, useState } from "react";
import API from "../../api/api";

export default function TeachersTable(){

  const [teachers,setTeachers] = useState([]);
  const [search,setSearch] = useState("");

  const fetchTeachers = async () => {

    try{

      const res = await API.get("/admin/users");

      const teachers = res.data.filter(
        (u)=>u.registrationType === "teacher"
      );

      setTeachers(teachers);

    }catch(err){
      console.log(err);
    }

  };

  useEffect(()=>{
    fetchTeachers();
  },[]);


  /* DELETE TEACHER */

  const deleteTeacher = async (id)=>{

    const confirmDelete = window.confirm("Delete this teacher?");

    if(!confirmDelete) return;

    try{

      // ✅ correct API
      await API.delete(`/admin/remove/${id}`);

      setTeachers((prev)=>
        prev.filter((t)=>t._id !== id)
      );

    }catch(err){
      console.log(err);
      alert("Failed to delete teacher");
    }

  };


  const filteredTeachers = teachers.filter((t)=>{

    const value = search.toLowerCase();

    return (
      t.fullName?.toLowerCase().includes(value) ||
      t.email?.toLowerCase().includes(value) ||
      t.phone?.includes(value) ||
      t.aadhar?.includes(value)
    );

  });


  return(

    <div className="admin-table-section">

      <h3>Teachers</h3>

      <input
        type="text"
        placeholder="Search by Name, Email, Phone, Aadhar..."
        className="admin-search"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      <table className="admin-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Aadhar</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

        {filteredTeachers.map((t)=>(
          <tr key={t._id}>
            <td>{t.fullName}</td>
            <td>{t.email}</td>
            <td>{t.phone}</td>
            <td>{t.aadhar}</td>

            <td>
              <button
                className="admin-delete-btn"
                onClick={()=>deleteTeacher(t._id)}
              >
                Remove
              </button>
            </td>

          </tr>
        ))}

        </tbody>

      </table>

    </div>

  );

}