import { useEffect, useState } from "react";
import API from "../../api/api";

export default function AppSettings() {

  const [settings,setSettings] = useState({
    siteName:"",
    themeColor:"#6366f1",
    fontFamily:"Poppins"
  });

  const [logo,setLogo] = useState(null);
  const [preview,setPreview] = useState(null);
  const [loading,setLoading] = useState(false);

  /* LOAD SETTINGS */

  const fetchSettings = async()=>{

    try{

      const res = await API.get("/settings");

      setSettings({
        siteName:res.data.siteName || "",
        themeColor:res.data.themeColor || "#6366f1",
        fontFamily:res.data.fontFamily || "Poppins"
      });

      if(res.data.logo?.url){
        setPreview(res.data.logo.url);
      }

    }catch(err){
      console.log(err);
    }

  };

  useEffect(()=>{
    fetchSettings();
  },[]);

  /* HANDLE INPUT */

  const handleChange = (e)=>{
    setSettings({
      ...settings,
      [e.target.name]:e.target.value
    });
  };

  /* HANDLE LOGO */

  const handleLogo = (e)=>{
    const file = e.target.files[0];
    setLogo(file);

    if(file){
      setPreview(URL.createObjectURL(file));
    }
  };

  /* SAVE SETTINGS */

  const handleSave = async()=>{

    try{

      setLoading(true);

      const form = new FormData();

      form.append("siteName",settings.siteName);
      form.append("themeColor",settings.themeColor);
      form.append("fontFamily",settings.fontFamily);

      if(logo){
        form.append("logo",logo);
      }

      await API.put("/settings",form,{
        headers:{
          "Content-Type":"multipart/form-data"
        }
      });

      alert("Settings Updated Successfully");

      fetchSettings();

    }catch(err){
      console.log(err);
      alert("Failed to update settings");
    }

    setLoading(false);

  };

  return (

    <div className="admin-settings">

      <h2>Website Settings</h2>

      <div className="settings-form">

        {/* SITE NAME */}

        <label>Website Name</label>

        <input
          type="text"
          name="siteName"
          value={settings.siteName}
          onChange={handleChange}
          placeholder="Enter Website Name"
        />

        {/* THEME COLOR */}

        <label>Theme Color</label>

        <input
          type="color"
          name="themeColor"
          value={settings.themeColor}
          onChange={handleChange}
        />

        {/* FONT STYLE */}

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
          <option value="Open Sans">Open Sans</option>

        </select>

        {/* LOGO */}

        <label>Website Logo</label>

        <input
          type="file"
          onChange={handleLogo}
        />

        {preview && (

          <div className="logo-preview">

            <img
              src={preview}
              alt="logo"
              style={{
                width:"120px",
                marginTop:"10px"
              }}
            />

          </div>

        )}

        {/* SAVE BUTTON */}

        <button
          className="settings-save-btn"
          onClick={handleSave}
          disabled={loading}
        >

          {loading ? "Saving..." : "Save Settings"}

        </button>

      </div>

    </div>

  );

}