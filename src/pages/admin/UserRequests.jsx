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


return(

<div className="admin-page">

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

{users.map((u)=>(

<tr key={u._id}>

<td>{u.fullName}</td>
<td>{u.email}</td>
<td>{u.phone}</td>
<td>{u.aadhar}</td>
<td>{u.registrationType}</td>

<td>
{new Date(u.createdAt).toLocaleDateString()}
</td>

<td>

<button
onClick={()=>approveUser(u._id)}
style={{
marginRight:"10px",
background:"green",
color:"white",
border:"none",
padding:"6px 12px",
cursor:"pointer"
}}
>
Approve
</button>

<button
onClick={()=>removeUser(u._id)}
style={{
background:"red",
color:"white",
border:"none",
padding:"6px 12px",
cursor:"pointer"
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