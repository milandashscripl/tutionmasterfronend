import { useEffect, useState } from "react";
import API from "../../api/api";
import Loader from "../../components/Loader";

export default function AdminLandingPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

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

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Convert settings to FormData for file uploads
      Object.keys(settings).forEach(key => {
        if (key === 'heroSlides') {
          settings.heroSlides.forEach((slide, index) => {
            formData.append(`heroSlides[${index}][title]`, slide.title);
            formData.append(`heroSlides[${index}][subtitle]`, slide.subtitle);
            formData.append(`heroSlides[${index}][imageUrl]`, slide.imageUrl);
            if (slide.public_id) formData.append(`heroSlides[${index}][public_id]`, slide.public_id);
          });
        } else if (key === 'aboutSection') {
          Object.keys(settings.aboutSection).forEach(subKey => {
            formData.append(`aboutSection[${subKey}]`, settings.aboutSection[subKey]);
          });
        } else if (key === 'howItWorks') {
          formData.append('howItWorks[title]', settings.howItWorks.title);
          formData.append('howItWorks[subtitle]', settings.howItWorks.subtitle);
          settings.howItWorks.steps.forEach((step, index) => {
            formData.append(`howItWorks[steps][${index}][number]`, step.number);
            formData.append(`howItWorks[steps][${index}][title]`, step.title);
            formData.append(`howItWorks[steps][${index}][description]`, step.description);
          });
        } else if (key === 'testimonials') {
          settings.testimonials.forEach((testimonial, index) => {
            formData.append(`testimonials[${index}][content]`, testimonial.content);
            formData.append(`testimonials[${index}][author]`, testimonial.author);
          });
        } else if (key === 'contactSection') {
          Object.keys(settings.contactSection).forEach(subKey => {
            formData.append(`contactSection[${subKey}]`, settings.contactSection[subKey]);
          });
        } else if (key === 'footer') {
          formData.append('footer[copyright]', settings.footer.copyright);
        } else {
          formData.append(key, settings[key]);
        }
      });

      await API.put("/admin/landing-page", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Landing page settings updated successfully!");
      fetchSettings();
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to update settings. Check console.");
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
        imageUrl: "",
        public_id: ""
      }]
    }));
  };

  const removeHeroSlide = (index) => {
    setSettings(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index)
    }));
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

  if (!settings) return <Loader message="Loading landing page settings..." className="mx-auto" />;

  return (
    <div className="admin-page" style={{ padding: '20px', maxWidth: '1200px' }}>
      <div className="admin-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2>Landing Page Management</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: '30px' }}>Customize all sections of your landing page content.</p>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          {['hero', 'about', 'howItWorks', 'testimonials', 'contact', 'footer'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                background: activeTab === tab ? settings.themeColor : '#f5f5f5',
                color: activeTab === tab ? 'white' : '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'howItWorks' ? 'How It Works' : tab}
            </button>
          ))}
        </div>

        {/* Hero Slides Tab */}
        {activeTab === 'hero' && (
          <div>
            <h3>Hero Slider</h3>
            {settings.heroSlides.map((slide, index) => (
              <div key={index} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4>Slide {index + 1}</h4>
                  <button
                    onClick={() => removeHeroSlide(index)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label>Title</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSettings(`heroSlides.${index}.title`, e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label>Subtitle</label>
                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => updateSettings(`heroSlides.${index}.subtitle`, e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div>
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={slide.imageUrl}
                    onChange={(e) => updateSettings(`heroSlides.${index}.imageUrl`, e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addHeroSlide}
              style={{ background: settings.themeColor, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Add Hero Slide
            </button>
          </div>
        )}

        {/* About Section Tab */}
        {activeTab === 'about' && (
          <div>
            <h3>About Section</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label>Badge</label>
                <input
                  type="text"
                  value={settings.aboutSection.badge}
                  onChange={(e) => updateSettings('aboutSection.badge', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Title</label>
                <input
                  type="text"
                  value={settings.aboutSection.title}
                  onChange={(e) => updateSettings('aboutSection.title', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Description 1</label>
              <textarea
                value={settings.aboutSection.description1}
                onChange={(e) => updateSettings('aboutSection.description1', e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Description 2</label>
              <textarea
                value={settings.aboutSection.description2}
                onChange={(e) => updateSettings('aboutSection.description2', e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Image URL</label>
              <input
                type="text"
                value={settings.aboutSection.imageUrl}
                onChange={(e) => updateSettings('aboutSection.imageUrl', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

        {/* How It Works Tab */}
        {activeTab === 'howItWorks' && (
          <div>
            <h3>How It Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Title</label>
                <input
                  type="text"
                  value={settings.howItWorks.title}
                  onChange={(e) => updateSettings('howItWorks.title', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Subtitle</label>
                <input
                  type="text"
                  value={settings.howItWorks.subtitle}
                  onChange={(e) => updateSettings('howItWorks.subtitle', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            {settings.howItWorks.steps.map((step, index) => (
              <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                  <span>Step {index + 1}</span>
                  <input
                    type="text"
                    placeholder="Title"
                    value={step.title}
                    onChange={(e) => updateSettings(`howItWorks.steps.${index}.title`, e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={step.description}
                    onChange={(e) => updateSettings(`howItWorks.steps.${index}.description`, e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div>
            <h3>Testimonials</h3>
            {settings.testimonials.map((testimonial, index) => (
              <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4>Testimonial {index + 1}</h4>
                  <button
                    onClick={() => removeTestimonial(index)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>Content</label>
                  <textarea
                    value={testimonial.content}
                    onChange={(e) => updateSettings(`testimonials.${index}.content`, e.target.value)}
                    rows="3"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>Author</label>
                  <input
                    type="text"
                    value={testimonial.author}
                    onChange={(e) => updateSettings(`testimonials.${index}.author`, e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addTestimonial}
              style={{ background: settings.themeColor, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Add Testimonial
            </button>
          </div>
        )}

        {/* Contact Section Tab */}
        {activeTab === 'contact' && (
          <div>
            <h3>Contact Section</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label>Title</label>
                <input
                  type="text"
                  value={settings.contactSection.title}
                  onChange={(e) => updateSettings('contactSection.title', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Location</label>
                <input
                  type="text"
                  value={settings.contactSection.location}
                  onChange={(e) => updateSettings('contactSection.location', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Subtitle</label>
              <textarea
                value={settings.contactSection.subtitle}
                onChange={(e) => updateSettings('contactSection.subtitle', e.target.value)}
                rows="2"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Email</label>
              <input
                type="email"
                value={settings.contactSection.email}
                onChange={(e) => updateSettings('contactSection.email', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div>
            <h3>Footer</h3>
            <div>
              <label>Copyright Text</label>
              <input
                type="text"
                value={settings.footer.copyright}
                onChange={(e) => updateSettings('footer.copyright', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            marginTop: '30px',
            padding: "15px 20px",
            background: loading ? "#ccc" : settings.themeColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
            width: "100%",
            fontSize: '1rem'
          }}
        >
          {loading ? "Saving Changes..." : "Save All Landing Page Settings"}
        </button>
      </div>
    </div>
  );
}