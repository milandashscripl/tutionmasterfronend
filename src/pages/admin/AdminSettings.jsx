import { useEffect, useState } from "react";
import API from "../../api/api";

export default function AdminSettings() {

const [settings,setSettings] = useState({
siteName:"",
themeColor:"#6366f1",
fontFamily:"Poppins"
});

const [loading,setLoading] = useState(false);


/* FETCH SETTINGS */

const fetchSettings = async()=>{

try{

const res = await API.get("/settings")

if(res.data){

setSettings({
siteName:res.data.siteName || "",
themeColor:res.data.themeColor || "#6366f1",
fontFamily:res.data.fontFamily || "Poppins"
})

}

}catch(err){
console.error(err)
}

}

useEffect(()=>{
fetchSettings();
},[]);


/* HANDLE INPUT */

const handleChange=(e)=>{

setSettings({
...settings,
[e.target.name]:e.target.value
});

};


/* SAVE SETTINGS */

const handleSave = async()=>{

try{

setLoading(true)

await API.put("/settings",settings)

alert("Settings updated successfully")

fetchSettings()

}catch(err){

console.error(err)

alert("Failed to update settings")

}

setLoading(false)

}


return(

<div className="admin-page">

<h2>Website Settings</h2>

<div className="settings-form">

<label>Website Name</label>

<input
type="text"
name="siteName"
value={settings.siteName}
onChange={handleChange}
placeholder="Enter website name"
/>


<label>Theme Color</label>

<input
type="color"
name="themeColor"
value={settings.themeColor}
onChange={handleChange}
/>


<label>Font Style</label>

<select
name="fontFamily"
value={settings.fontFamily}
onChange={handleChange}
>

<option value="Poppins">Poppins</option>
<option value="Roboto">Roboto</option>
<option value="Inter">Inter</option>
<option value="Montserrat">Montserrat</option>

</select>


<button
onClick={handleSave}
disabled={loading}
className="admin-save-btn"
>

{loading ? "Saving..." : "Save Settings"}

</button>

</div>

</div>

);

}