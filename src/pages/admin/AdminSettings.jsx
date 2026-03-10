import { useEffect,useState } from "react";
import API from "../../api/api";

export default function AdminSettings(){

const [settings,setSettings] = useState({
siteName:"",
themeColor:"#6366f1",
fontFamily:"Poppins"
});

const [logo,setLogo] = useState(null);

const fetchSettings = async()=>{

const res = await API.get("/settings");

setSettings(res.data);

};

useEffect(()=>{
fetchSettings();
},[]);

const handleChange=(e)=>{
setSettings({...settings,[e.target.name]:e.target.value});
};

const handleSave = async()=>{

const form = new FormData();

form.append("siteName",settings.siteName);
form.append("themeColor",settings.themeColor);
form.append("fontFamily",settings.fontFamily);

if(logo){
form.append("logo",logo);
}

await API.put("/settings",form);

alert("Settings updated");

};

return(

<div className="admin-page">

<h2>Website Settings</h2>

<input
name="siteName"
value={settings.siteName}
onChange={handleChange}
placeholder="Website Name"
/>

<label>Theme Color</label>

<input
type="color"
name="themeColor"
value={settings.themeColor}
onChange={handleChange}
/>

<select
name="fontFamily"
value={settings.fontFamily}
onChange={handleChange}
>

<option>Poppins</option>
<option>Roboto</option>
<option>Inter</option>
<option>Montserrat</option>

</select>

<input
type="file"
onChange={(e)=>setLogo(e.target.files[0])}
/>

<button onClick={handleSave}>
Save Settings
</button>

</div>

);

}