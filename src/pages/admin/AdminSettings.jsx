import { useEffect, useState } from "react";
import API from "../../api/api";

export default function AdminSettings() {
  const [logoPreview, setLogoPreview] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch current logo
    API.get("/settings")
      .then((res) => {
        // Ensure we check the correct nested path from your Mongoose schema
        if (res.data?.logo?.url) setLogoPreview(res.data.logo.url);
      })
      .catch((err) => console.error("Error fetching settings:", err));
      
    // 2. Cleanup function to prevent memory leaks from local blob URLs
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 3. Simple validation: limit size to 2MB to prevent Cloudinary timeouts
    if (selectedFile.size > 2 * 1024 * 1024) {
      return alert("File is too large. Please select an image under 2MB.");
    }

    setFile(selectedFile);
    
    // Revoke previous blob if user changes file multiple times before saving
    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    
    setLogoPreview(URL.createObjectURL(selectedFile)); 
  };

  // ... other imports and state ...

const handleSave = async () => {
  // 1. Validation: Don't send if no file is selected
  if (!file) return alert("Please select a new logo first");
  
  setLoading(true);

  // 2. THE PART YOU ASKED ABOUT:
  // Create the "envelope" for the file
  const formData = new FormData();
  
  // This key "logo" MUST match the name in your backend: upload.single("logo")
  formData.append("logo", file); 

  try {
    // 3. The API call
    // We pass the formData as the body, and Axios handles the boundary headers
    const response = await API.put("/settings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data) {
      alert("Logo updated successfully!");
      // 4. Force the whole app (Header) to see the new logo
      window.location.reload(); 
    }
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    alert("Failed to upload logo. Check console.");
  } finally {
    setLoading(false);
  }
};

// ... rest of the component ...

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>App Branding</h2>
        <p style={{ color: "#666", fontSize: "14px" }}>Upload your logo (PNG/JPG/SVG recommended)</p>
        
        <div className="settings-form" style={{ maxWidth: "400px", marginTop: "20px" }}>
          <label style={{ fontWeight: "600" }}>Website Logo</label>
          
          <div style={{ 
            margin: "15px 0", 
            border: "2px dashed #ddd", 
            borderRadius: "8px",
            padding: "20px", 
            textAlign: "center",
            background: "#f9f9f9",
            minHeight: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: "80px", maxWidth: "100%" }} />
            ) : (
              <span style={{ color: "#999" }}>No logo uploaded</span>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ marginBottom: "20px", display: "block", width: "100%" }}
          />
          
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="admin-save-btn"
            style={{
              padding: "10px 20px",
              background: loading ? "#ccc" : "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              width: "100%"
            }}
          >
            {loading ? "Saving to Cloudinary..." : "Update Logo"}
          </button>
        </div>
      </div>
    </div>
  );
}