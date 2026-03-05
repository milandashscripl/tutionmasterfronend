import { useEffect, useState } from "react";
import API from "../../api/api";

export default function StudentsTable(){

  const [students,setStudents] = useState([]);
  const [search,setSearch] = useState("");

  const fetchStudents = async () => {
    try{
      const res = await API.get("/admin/users");

      const students = res.data.filter(
        (u)=>u.registrationType === "student"
      );

      setStudents(students);

    }catch(err){
      console.log(err);
    }
  };

  useEffect(()=>{
    fetchStudents();
  },[]);


  const filteredStudents = students.filter((s)=>{
    const value = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(value) ||
      s.email.toLowerCase().includes(value) ||
      s.phone.includes(value) ||
      s.aadhar.includes(value)
    );
  });

  return(

    <div className="admin-table-section">

      <h3>Students</h3>

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
          </tr>
        </thead>

        <tbody>

        {filteredStudents.map((s)=>(
          <tr key={s._id}>
            <td>{s.fullName}</td>
            <td>{s.email}</td>
            <td>{s.phone}</td>
            <td>{s.aadhar}</td>
          </tr>
        ))}

        </tbody>

      </table>

    </div>

  );
}