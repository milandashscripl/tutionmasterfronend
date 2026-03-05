// import { useEffect, useState } from "react";
// import API from "../api/api";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer
// } from "recharts";

// export default function RegistrationChart(){

//   const [data,setData] = useState([]);

//   const fetchUsers = async ()=>{

//     try{

//       const res = await API.get("/admin/users");

//       const users = res.data;

//       const map = {};

//       users.forEach((u)=>{

//         const date = new Date(u.createdAt)
//         .toLocaleDateString();

//         map[date] = (map[date] || 0) + 1;

//       });

//       const chartData = Object.keys(map).map((d)=>({
//         date:d,
//         users:map[d]
//       }));

//       setData(chartData);

//     }catch(err){
//       console.log(err);
//     }

//   };

//   useEffect(()=>{
//     fetchUsers();
//   },[]);

//   return(

//     <div style={{width:"100%",height:300}}>

//       <h3>Registrations</h3>

//       <ResponsiveContainer>

//         <LineChart data={data}>

//           <CartesianGrid strokeDasharray="3 3"/>

//           <XAxis dataKey="date"/>

//           <YAxis/>

//           <Tooltip/>

//           <Line type="monotone"
//           dataKey="users"
//           stroke="#6366f1"/>

//         </LineChart>

//       </ResponsiveContainer>

//     </div>

//   );

// }


import { useEffect, useState } from "react";
import API from "../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function RegistrationChart(){

  const [data,setData] = useState([]);

  const COLORS = ["#6366f1","#22c55e"];

  const fetchUsers = async ()=>{

    try{

      const res = await API.get("/admin/users");

      const users = res.data;

      let students = 0;
      let teachers = 0;

      users.forEach((u)=>{

        if(u.registrationType === "student"){
          students++;
        }

        if(u.registrationType === "teacher"){
          teachers++;
        }

      });

      const chartData = [
        { name:"Students", value:students },
        { name:"Teachers", value:teachers }
      ];

      setData(chartData);

    }catch(err){
      console.log(err);
    }

  };

  useEffect(()=>{
    fetchUsers();
  },[]);

  return(

    <div style={{width:"100%",height:320}}>

      <h3>Registration Ratio</h3>

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >

            {data.map((entry,index)=>(
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}

          </Pie>

          <Tooltip/>

          <Legend/>

        </PieChart>

      </ResponsiveContainer>

    </div>

  );

}