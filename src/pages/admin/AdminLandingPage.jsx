import { useEffect, useState, useRef } from "react";
import API from "../../api/api";

export default function AdminLandingPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [fileUploads, setFileUploads] = useState({}); // Track file uploads
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/admin/landing-page");
      setSettings(res.data);
    } catch (err) {
      console.error("Error fetching landing page settings:", err);
    }
  };

  const handleImageUpload = (e, slideIndex, fieldName = 'heroImage') => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileUploads(prev => ({
        ...prev,
        [`${fieldName}_${slideIndex}`]: file,
        [`${fieldName}_${slideIndex}_preview`]: reader.result
      }));

      // Update settings with preview URL temporarily
      updateSettings(`heroSlides.${slideIndex}.imageUrl`, `[File: ${file.name}]`);
    };
    reader.readAsDataURL(file);
  };

  const handleAboutImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileUploads(prev => ({
        ...prev,
        'aboutImage': file,
        'aboutImage_preview': reader.result
      }));
      updateSettings('aboutSection.imageUrl', `[File: ${file.name}]`);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Add all files
      Object.keys(fileUploads).forEach(key => {
        if (!key.includes('_preview')) {
          const file = fileUploads[key];
          formData.append(key, file);
        }
      });

      // Add text fields
      const dataToSend = {
        heroSlides: settings.heroSlides.map((slide, idx) => ({
          title: slide.title,
          subtitle: slide.subtitle,
          imageFile: fileUploads[`heroImage_${idx}`] ? `heroImage_${idx}` : null,
          existingImageUrl: !fileUploads[`heroImage_${idx}`] ? slide.imageUrl : null
        })),
        aboutSection: {
          badge: settings.aboutSection.badge,
          title: settings.aboutSection.title,
          description1: settings.aboutSection.description1,
          description2: settings.aboutSection.description2,
          imageFile: fileUploads['aboutImage'] ? 'aboutImage' : null,
          existingImageUrl: !fileUploads['aboutImage'] ? settings.aboutSection.imageUrl : null
        },
        howItWorks: settings.howItWorks,
        testimonials: settings.testimonials,
        contactSection: settings.contactSection,
        footer: settings.footer
      };

      formData.append('data', JSON.stringify(dataToSend));

      await API.put("/admin/landing-page", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Landing page settings updated successfully!");
      setFileUploads({});
      fetchSettings();
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to update settings: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addHeroSlide = () => {
    setSettings(prev => ({
      ...prev,
      heroSlides: [...prev.heroSlides, {
        title: "",
        subtitle: "",
        imageUrl: ""
      }]
    }));
  };

  const removeHeroSlide = (index) => {
    setSettings(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
    // Clean up file uploads
    setFileUploads(prev => {
      const newUploads = { ...prev };
      delete newUploads[`heroImage_${index}`];
      delete newUploads[`heroImage_${index}_preview`];
      return newUploads;
    });
  };

  const addTestimonial = () => {
    setSettings(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { content: "", author: "" }]
    }));
  };

  const removeTestimonial = (index) => {
    setSettings(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  if (!settings) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  const themeColor = "#6366f1";

  return (
    <div className="admin-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="admin-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2>Landing Page Management</h2>
            <p style={{ color: "#666", fontSize: "14px" }}>Customize all sections of your landing page content and upload images.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: themeColor,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '0' }}>
          {['hero', 'about', 'howItWorks', 'testimonials', 'contact', 'footer'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                color: activeTab === tab ? themeColor : '#666',
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${themeColor}` : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '500',
                textTransform: 'capitalize',
                fontSize: '14px'
              }}
            >
              {tab === 'howItWorks' ? 'How It Works' : tab}
            </button>
          ))}
        </div>

        {/* Hero Slides Tab */}
        {activeTab === 'hero' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Hero Slider Slides</h3>
            {settings.heroSlides.map((slide, index) => (
              <div key={index} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4>Slide {index + 1}</h4>
                  <button
                    onClick={() => removeHeroSlide(index)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Title</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSettings(`heroSlides.${index}.title`, e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                      placeholder="Enter slide title"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Subtitle</label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => updateSettings(`heroSlides.${index}.subtitle`, e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                      placeholder="Enter slide subtitle"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Slide Image</label>
                  
                  {/* Image Preview */}
                  {(fileUploads[`heroImage_${index}_preview`] || (slide.imageUrl && !slide.imageUrl.includes('[File:'))) && (
                    <div style={{ marginBottom: '15px' }}>
                      <img 
                        src={fileUploads[`heroImage_${index}_preview`] || slide.imageUrl} 
                        alt={`Slide ${index + 1}`}
                        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                    </div>
                  )}

                  <input
                    ref={el => fileInputRefs.current[`heroImage_${index}`] = el}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index, 'heroImage')}
                    style={{ display: 'none' }}
                  />

                  <button
                    onClick={() => fileInputRefs.current[`heroImage_${index}`]?.click()}
                    style={{
                      background: '#f0f0f0',
                      color: '#333',
                      border: '2px dashed #ddd',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '10px',
                      width: '100%'
                    }}
                  >
                    📁 Click to Upload Image
                  </button>

                  {fileUploads[`heroImage_${index}`] && (
                    <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                      ✓ Selected: {fileUploads[`heroImage_${index}`].name}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addHeroSlide}
              style={{
                background: themeColor,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              + Add Hero Slide
            </button>
          </div>
        )}

        {/* About Section Tab */}
        {activeTab === 'about' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>About Section</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Badge</label>
                <input
                  type="text"
                  value={settings.aboutSection.badge}
                  onChange={(e) => updateSettings('aboutSection.badge', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="e.g., Our Story"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Title</label>
                <input
                  type="text"
                  value={settings.aboutSection.title}
                  onChange={(e) => updateSettings('aboutSection.title', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Section title"
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Description 1</label>
              <textarea
                value={settings.aboutSection.description1}
                onChange={(e) => updateSettings('aboutSection.description1', e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="First paragraph"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Description 2</label>
              <textarea
                value={settings.aboutSection.description2}
                onChange={(e) => updateSettings('aboutSection.description2', e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Second paragraph"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Section Image</label>

              {(fileUploads['aboutImage_preview'] || (settings.aboutSection.imageUrl && !settings.aboutSection.imageUrl.includes('[File:'))) && (
                <div style={{ marginBottom: '15px' }}>
                  <img 
                    src={fileUploads['aboutImage_preview'] || settings.aboutSection.imageUrl}
                    alt="About section"
                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                </div>
              )}

              <input
                ref={el => fileInputRefs.current['aboutImage'] = el}
                type="file"
                accept="image/*"
                onChange={handleAboutImageUpload}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRefs.current['aboutImage']?.click()}
                style={{
                  background: '#f0f0f0',
                  color: '#333',
                  border: '2px dashed #ddd',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  width: '100%'
                }}
              >
                📁 Click to Upload Image
              </button>

              {fileUploads['aboutImage'] && (
                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                  ✓ Selected: {fileUploads['aboutImage'].name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* How It Works Tab */}
        {activeTab === 'howItWorks' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>How It Works Section</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title</label>
              <input
                type="text"
                value={settings.howItWorks.title}
                onChange={(e) => updateSettings('howItWorks.title', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subtitle</label>
              <input
                type="text"
                value={settings.howItWorks.subtitle}
                onChange={(e) => updateSettings('howItWorks.subtitle', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <h4>Steps</h4>
              {settings.howItWorks.steps.map((step, idx) => (
                <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      value={step.number}
                      onChange={(e) => updateSettings(`howItWorks.steps.${idx}.number`, e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      placeholder="Number"
                    />
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateSettings(`howItWorks.steps.${idx}.title`, e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      placeholder="Step title"
                    />
                    <input
                      type="text"
                      value={step.description}
                      onChange={(e) => updateSettings(`howItWorks.steps.${idx}.description`, e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      placeholder="Description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Testimonials</h3>
            {settings.testimonials.map((testimonial, index) => (
              <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4>Testimonial {index + 1}</h4>
                  <button
                    onClick={() => removeTestimonial(index)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={testimonial.content}
                  onChange={(e) => updateSettings(`testimonials.${index}.content`, e.target.value)}
                  rows="2"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}
                  placeholder="Testimonial content"
                />
                <input
                  type="text"
                  value={testimonial.author}
                  onChange={(e) => updateSettings(`testimonials.${index}.author`, e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Author name"
                />
              </div>
            ))}
            <button
              onClick={addTestimonial}
              style={{ background: themeColor, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
            >
              + Add Testimonial
            </button>
          </div>
        )}

        {/* Contact Section Tab */}
        {activeTab === 'contact' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Contact Section</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title</label>
                <input
                  type="text"
                  value={settings.contactSection.title}
                  onChange={(e) => updateSettings('contactSection.title', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subtitle</label>
                <input
                  type="text"
                  value={settings.contactSection.subtitle}
                  onChange={(e) => updateSettings('contactSection.subtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location</label>
                <input
                  type="text"
                  value={settings.contactSection.location}
                  onChange={(e) => updateSettings('contactSection.location', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  value={settings.contactSection.email}
                  onChange={(e) => updateSettings('contactSection.email', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>Footer</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Copyright Text</label>
              <input
                type="text"
                value={settings.footer.copyright}
                onChange={(e) => updateSettings('footer.copyright', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: themeColor,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
