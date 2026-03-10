import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import CanvasBg from "../components/CanvasBg";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName:"",
    email:"",
    phone:"",
    password:"",
    aadhar:"",
    registrationType:"",
    gender:"",
    age:"",
    addressText:"",
    lat:"",
    lng:"",
    standard:"",
    board:"",
    subjects:"",
    teachingUpto:"",
    distance:"",
  });

  const [profilePic,setProfilePic] = useState(null);
  const [preview,setPreview] = useState(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  }

  const handleFile=(e)=>{
    const file=e.target.files[0];
    setProfilePic(file);
    if(file) setPreview(URL.createObjectURL(file));
  }

  const handleRegister=async(e)=>{
    e.preventDefault();

    if(!form.fullName || !form.email || !form.phone || !form.password || !form.registrationType){
      return setError("Please fill required fields");
    }

    try{

      const data=new FormData();

      Object.keys(form).forEach(k=>{
        data.append(k,form[k]);
      });

      if(profilePic) data.append("profilePic",profilePic);

      const res=await API.post("/auth/register",data,{
        headers:{ "Content-Type":"multipart/form-data" }
      });

      if(res.data?.message==="OTP_SENT"){
        navigate("/verify",{state:{phone:form.phone}});
      }

    }catch(err){
      setError(err.response?.data?.message || "Registration failed");
    }

  }

  return(

<div className="auth-layout">
<div className="auth-page">

<CanvasBg/>

<div className="card auth-card">

<h2>Create Account</h2>

<form onSubmit={handleRegister}>

<input name="fullName" placeholder="Full Name" onChange={handleChange}/>
<input name="email" placeholder="Email" onChange={handleChange}/>
<input name="phone" placeholder="Phone" onChange={handleChange}/>

<select name="registrationType" onChange={handleChange}>
<option value="">Select Type</option>
<option value="student">Student</option>
<option value="teacher">Teacher</option>
</select>

<input name="aadhar" placeholder="Aadhar Number" onChange={handleChange}/>
<input type="password" name="password" placeholder="Password" onChange={handleChange}/>

<select name="gender" onChange={handleChange}>
<option value="">Gender</option>
<option>Male</option>
<option>Female</option>
</select>

<input name="age" placeholder="Age" onChange={handleChange}/>

<input name="addressText" placeholder="Address" onChange={handleChange}/>

{/* STUDENT FIELDS */}

{form.registrationType==="student" &&(

<>

<input name="standard" placeholder="Class / Standard" onChange={handleChange}/>
<input name="board" placeholder="Board (CBSE / CHSE)" onChange={handleChange}/>
<input name="subjects" placeholder="Subjects (Math, Physics etc)" onChange={handleChange}/>

</>

)}

{/* TEACHER FIELDS */}

{form.registrationType==="teacher" &&(

<>

<input name="teachingUpto" placeholder="Teaching ability" onChange={handleChange}/>
<input name="subjects" placeholder="Subjects expert in" onChange={handleChange}/>
<input name="distance" placeholder="Distance coverage (km)" onChange={handleChange}/>

</>

)}

<input type="file" onChange={handleFile}/>

{preview && <img src={preview} style={{width:80}}/>}

<button type="submit">
Register
</button>

{error && <p>{error}</p>}

</form>

</div>
</div>
</div>

  )

}