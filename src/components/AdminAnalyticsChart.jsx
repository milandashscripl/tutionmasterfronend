import { useEffect, useState } from "react";
import API from "../api/api";

import {
PieChart,
Pie,
Cell,
Tooltip,
ResponsiveContainer,
Legend,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid
} from "recharts";

const COLORS = ["#6366f1","#22c55e"];

export default function AdminCharts(){

const [activeTab,setActiveTab] = useState("registration");

const [registrationData,setRegistrationData] = useState([]);
const [genderData,setGenderData] = useState([]);
const [standardData,setStandardData] = useState([]);

const fetchData = async()=>{

const res = await API.get("/admin/users");
const users = res.data;

let students=0;
let teachers=0;
let male=0;
let female=0;

const standardMap={};

users.forEach(u=>{

if(u.registrationType==="student") students++;
if(u.registrationType==="teacher") teachers++;

if(u.gender==="Male") male++;
if(u.gender==="Female") female++;

if(u.registrationType==="student"){

const std = u.studentDetails?.standard;

if(std){
standardMap[std] = (standardMap[std]||0)+1;
}

}

});

setRegistrationData([
{name:"Students",value:students},
{name:"Teachers",value:teachers}
]);

setGenderData([
{name:"Male",value:male},
{name:"Female",value:female}
]);

setStandardData(
Object.keys(standardMap).map(k=>({
standard:k,
students:standardMap[k]
}))
);

};

useEffect(()=>{
fetchData();
},[]);

return(

<div className="admin-charts">

{/* TABS */}

<div className="chart-tabs">

<button
className={activeTab==="registration"?"active":""}
onClick={()=>setActiveTab("registration")}
>
Registrations
</button>

<button
className={activeTab==="gender"?"active":""}
onClick={()=>setActiveTab("gender")}
>
Gender
</button>

<button
className={activeTab==="standards"?"active":""}
onClick={()=>setActiveTab("standards")}
>
Student Standards
</button>

</div>

{/* CHART AREA */}

<div className="chart-container">

{activeTab==="registration" &&(

<ResponsiveContainer width="100%" height={320}>

<PieChart>

<Pie
data={registrationData}
dataKey="value"
nameKey="name"
outerRadius={100}
label
>

{registrationData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]}/>
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

)}

{activeTab==="gender" &&(

<ResponsiveContainer width="100%" height={320}>

<PieChart>

<Pie
data={genderData}
dataKey="value"
nameKey="name"
outerRadius={100}
label
>

{genderData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]}/>
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

)}

{activeTab==="standards" &&(

<ResponsiveContainer width="100%" height={350}>

<BarChart data={standardData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="standard"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="students" fill="#6366f1"/>

</BarChart>

</ResponsiveContainer>

)}

</div>

</div>

);

}