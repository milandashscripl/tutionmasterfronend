import { useEffect, useState } from "react";
import API from "../../api/api";

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("");
  const [themeColor, setThemeColor] = useState("#c9a35e");
  const [logoPreview, setLogoPreview] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch current global settings
    API.get("/admin/settings/public")
      .then((res) => {
        if (res.data) {
          setSiteName(res.data.siteName || "TuitionMaster");
          setThemeColor(res.data.themeColor || "#c9a35e");
          if (res.data.logo?.url) setLogoPreview(res.data.logo.url);
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
      
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 2 * 1024 * 1024) {
      return alert("File is too large. Please select an image under 2MB.");
    }
    setFile(selectedFile);
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(selectedFile)); 
  };

  const handleSave = async () => {
    setLoading(true);

    // Use FormData to send both text fields and the image file
    const formData = new FormData();
    formData.append("siteName", siteName);
    formData.append("themeColor", themeColor);
    if (file) formData.append("logo", file); 

    try {
      const response = await API.put("/admin/settings/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        alert("Platform settings updated successfully!");
        // Refresh to apply changes to the Navbar and Landing Page
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Failed to update settings. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page" style={{ padding: '20px', maxWidth: '800px' }}>
      <div className="admin-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2>System Branding</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: '30px' }}>Customize the global appearance of your platform.</p>
        
        <div className="settings-form">
          {/* SITE NAME */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontWeight: "600", display: 'block', marginBottom: '8px' }}>Website Name</label>
            <input 
              type="text" 
              value={siteName} 
              onChange={(e) => setSiteName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          {/* THEME COLOR */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontWeight: "600", display: 'block', marginBottom: '8px' }}>Brand Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input 
                type="color" 
                value={themeColor} 
                onChange={(e) => setThemeColor(e.target.value)}
                style={{ width: '60px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
              />
              <code style={{ background: '#f4f4f4', padding: '5px 10px', borderRadius: '4px' }}>{themeColor}</code>
            </div>
          </div>

          {/* LOGO PREVIEW */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontWeight: "600" }}>Website Logo</label>
            <div style={{ 
              margin: "15px 0", border: "2px dashed #ddd", borderRadius: "8px",
              padding: "20px", textAlign: "center", background: "#f9f9f9",
              minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: "80px", maxWidth: "100%" }} />
              ) : (
                <span style={{ color: "#999" }}>No logo uploaded</span>
              )}
            </div>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ marginBottom: "30px", display: "block", width: "100%" }}
          />
          
          <button 
            onClick={handleSave} 
            disabled={loading} 
            style={{
              padding: "15px 20px",
              background: loading ? "#ccc" : themeColor,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
              width: "100%",
              fontSize: '1rem'
            }}
          >
            {loading ? "Saving Changes..." : "Apply Global Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}