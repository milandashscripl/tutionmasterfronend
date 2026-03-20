import { useEffect,useState } from "react";
import API from "../../api/api";

export default function StudentsTable(){

const [students,setStudents] = useState([]);
const [search,setSearch] = useState("");

const [page,setPage] = useState(1);

const ITEMS_PER_PAGE = 15;

const fetchStudents = async()=>{

const res = await API.get("/admin/users");

const students = res.data.filter(
(u)=>
u.registrationType==="student" &&
u.isVerified === true &&
u.isApproved === true
);

setStudents(students);

};

useEffect(()=>{
fetchStudents();
},[]);

const deleteStudent = async(id)=>{

if(!window.confirm("Delete this student?")) return;

await API.delete(`/admin/remove/${id}`);

setStudents(prev=>prev.filter(s=>s._id!==id));

};

const filteredStudents = students.filter((s)=>{

const value = search.toLowerCase();

return(
s.fullName?.toLowerCase().includes(value) ||
s.email?.toLowerCase().includes(value) ||
s.phone?.includes(value) ||
s.aadhar?.includes(value)
);

});

/* PAGINATION */

const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

const start = (page-1)*ITEMS_PER_PAGE;
const end = start + ITEMS_PER_PAGE;

const paginatedStudents = filteredStudents.slice(start,end);

return(

<div className="admin-table-section">

<h3>Students</h3>

<input
className="admin-search"
placeholder="Search..."
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

{paginatedStudents.map((s)=>(

<tr key={s._id}>

<td>{s.fullName}</td>
<td>{s.email}</td>
<td>{s.phone}</td>
<td>{s.aadhar}</td>

<td>
<button
className="admin-delete-btn"
onClick={()=>deleteStudent(s._id)}
>
Remove
</button>
</td>

</tr>

))}

</tbody>

</table>

{/* PAGINATION */}

<div className="pagination">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
>
Prev
</button>

<span>
Page {page} / {totalPages}
</span>

<button
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
>
Next
</button>

</div>

</div>

);

}