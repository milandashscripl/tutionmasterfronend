import { useState } from "react";
import API from "../../api/api";

export default function AddStudent() {

  const [form, setForm] = useState({
    fullName:"",
    email:"",
    phone:"",
    password:"",
    aadhar:"",
  });

  const submit = async (e) => {

    e.preventDefault();

    try {

      await API.post("/admin/create-user",{
        ...form,
        registrationType:"student"
      });

      alert("Student Created");

    } catch(err){
      console.log(err);
    }

  };

  return (

    <form onSubmit={submit} className="admin-form">

      <h2>Add Student</h2>

      <input placeholder="Name"
      onChange={(e)=>setForm({...form,fullName:e.target.value})}/>

      <input placeholder="Email"
      onChange={(e)=>setForm({...form,email:e.target.value})}/>

      <input placeholder="Phone"
      onChange={(e)=>setForm({...form,phone:e.target.value})}/>

      <input type="password" placeholder="Password"
      onChange={(e)=>setForm({...form,password:e.target.value})}/>

      <input placeholder="Aadhar"
      onChange={(e)=>setForm({...form,aadhar:e.target.value})}/>

      <button>Create Student</button>

    </form>

  );

}