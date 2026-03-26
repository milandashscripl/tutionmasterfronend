import { useEffect, useState } from "react";
import API from "../../api/api";

export default function AdminSettings() {
  const [logoPreview, setLogoPreview] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current logo on load
  useEffect(() => {
    API.get("/settings")
      .then((res) => {
        if (res.data?.logo?.url) setLogoPreview(res.data.logo.url);
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setLogoPreview(URL.createObjectURL(selectedFile)); // Local preview
  };

  const handleSave = async () => {
    if (!file) return alert("Please select a new logo first");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("logo", file); // 'logo' must match your backend upload.single('logo')

    try {
      await API.put("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Logo updated successfully!");
      window.location.reload(); // Refresh to update the header globally
    } catch (err) {
      console.error(err);
      alert("Failed to upload logo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h2>App Branding</h2>
      <div className="settings-form" style={{ maxWidth: "400px" }}>
        <label>Website Logo</label>
        <div style={{ margin: "15px 0", border: "1px dashed #ccc", padding: "10px", textAlign: "center" }}>
          {logoPreview ? (
            <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: "60px" }} />
          ) : (
            <p>No logo uploaded</p>
          )}
        </div>
        
        <input type="file" accept="image/*" onChange={handleFileChange} />
        
        <button onClick={handleSave} disabled={loading} className="admin-save-btn">
          {loading ? "Uploading..." : "Update Logo"}
        </button>
      </div>
    </div>
  );
}