import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from "../api/api"; 

export default function LandingPage() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ tutors: 0, students: 0, colleges: 0 });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Master Your Studies with TuitionMaster",
      sub: "Connecting students with expert tutors for personalized learning in Western Odisha.",
      img: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepEZRl6IFxGi_n6TcpbRtEQ9srhwzfDaDqnK5nbRbvzbaCivXzzdj5adMpeV34oBcI8eZSePIEbQUL_3olivyUXx7HEmq8HmRV9iFyweGJ7BAQ4vzdb62uuugh1m6oJEKis2dA0=s1360-w1360-h1020-rw"
    },
    {
      title: "Verified Tutors, Proven Results",
      sub: "Every educator is vetted to ensure your academic success is in the right hands.",
      img: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerIfG5Pibc4u8ATDgI86ze8DKt_t7CwNLk1mnxuxqHvL2DjrUForWK5KRBQbUGhdKB0heYoqxIC1iay6Lo9vH1tqv3Fh3sUEEFBeHdkkiVvW1o-52Ph-RXBvEVUqxD5Kw2-1w56=s1360-w1360-h1020-rw"
    },
    {
      title: "Learning Without Boundaries",
      sub: "Access the best teaching talent from colleges across the state, all in one place.",
      img: "https://images.unsplash.com/photo-1513258496099-48168024adb0?auto=format&fit=crop&w=1920&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/users");  
        const allUsers = res.data || [];
        const activeUsers = allUsers.filter(u => u.isApproved && u.isVerified);
        const students = activeUsers.filter(u => u.registrationType === "student");
        const tutors = activeUsers.filter(u => u.registrationType === "teacher");
        const uniqueColleges = [...new Set(tutors.map(t => t.teacherDetails?.college).filter(Boolean))];

        setStats({
          students: students.length,
          tutors: tutors.length,
          colleges: uniqueColleges.length || 15
        });
      } catch (error) {
        setStats({ tutors: 450, students: 1200, colleges: 25 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="landing-container">
      <header className="brand-header">
        <div className="brand"><h2>TuitionMaster</h2></div>
        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!isMenuOpen)}>
          <span className="bar"></span><span className="bar"></span><span className="bar"></span>
        </button>
        <nav className={`top-nav ${isMenuOpen ? 'open' : ''}`}>
          <a href="#home" className="link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" className="link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#how-it-works" className="link" onClick={() => setMenuOpen(false)}>Process</a>
          <a href="#testimonials" className="link" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#contact" className="link" onClick={() => setMenuOpen(false)}>Contact</a>
          <Link to="/login" className="link">Login</Link>
          <Link to="/register" className="btn-primary-sm">Join Now</Link>
        </nav>
      </header>

      {/* HERO SLIDER */}
      <section id="home" className="hero-slider">
        {slides.map((slide, index) => (
          <div key={index} className={`slide ${currentSlide === index ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.img})` }}>
            <div className="hero-overlay">
              <div className="hero-content">
                <h1 className="welcome-text">{slide.title}</h1>
                <p className="hero-subtext">{slide.sub}</p>
                <Link to="/register" className="btn-primary">Start Your Journey</Link>
              </div>
            </div>
          </div>
        ))}
        <div className="slider-indicators">
          {slides.map((_, i) => (
            <div key={i} className={`dot ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
          ))}
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="about-section reveal">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="badge">Our Story</span>
              <h2>Empowering Education in Western Odisha</h2>
              <p>TuitionMaster was born from a simple observation: students struggle to find quality mentors nearby, while talented educators lack a platform to reach them.</p>
              <p>Our mission is to ensure every student has access to the academic guidance they deserve through direct and verified connections.</p>
            </div>
            <div className="about-image">
               <img src="https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&w=800&q=80" alt="Education" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-it-works reveal">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to start your academic success</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Register</h3>
            <p>Create your profile as a Student or Teacher and verify your credentials.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Connect</h3>
            <p>Browse through verified profiles and initiate a direct chat instantly.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Learn</h3>
            <p>Schedule your sessions and track your growth through our dashboard.</p>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar reveal">
        <div className="stat-item"><h3>{loading ? "..." : `${stats.tutors}+`}</h3><p>Tutors</p></div>
        <div className="stat-item"><h3>{loading ? "..." : stats.students}+</h3><p>Students</p></div>
        <div className="stat-item"><h3>{loading ? "..." : stats.colleges}</h3><p>Institutions</p></div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="testimonials reveal">
        <div className="section-header">
          <h2>Student & Tutor Success</h2>
        </div>
        <div className="testimonial-grid">
          <div className="test-card">
            <p>"Found a great Physics tutor from Jadavpur University within hours. Highly recommended!"</p>
            <h5>— Rahul S. (Student)</h5>
          </div>
          <div className="test-card">
            <p>"As a teacher, managing my batch logs and student chats has never been this organized."</p>
            <h5>— Priyanka D. (Tutor)</h5>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section reveal">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>Have questions? Our team is here to help you navigate your journey.</p>
            <div className="info-item"><strong>📍 Location:</strong> Western Odisha, India</div>
            <div className="info-item"><strong>📧 Email:</strong> support@tuitionmaster.com</div>
          </div>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Email Address" required />
            <textarea placeholder="Your Message" rows="4" required></textarea>
            <button className="btn-primary">Send Message</button>
          </form>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 TuitionMaster. All rights reserved.</p>
      </footer>

      <style jsx>{`
        :root {
          --bg: #faf9f7;
          --text: #1f1e1c;
          --accent-1: #c9a35e;
        }

        .landing-container { background: var(--bg); color: var(--text); overflow-x: hidden; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 5%; }

        /* HEADER & MOBILE NAV FIX */
        .brand-header { position: sticky; top: 0; z-index: 1000; background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 15px 5%; border-bottom: 1px solid #eee; }
        .top-nav { display: flex; gap: 20px; align-items: center; }
        .link { text-decoration: none; color: var(--text); font-weight: 500; font-size: 0.9rem; }
        .btn-primary-sm { background: var(--accent-1); color: white; padding: 8px 18px; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 0.85rem; }

        /* HERO SLIDER */
        .hero-slider { height: 75vh; min-height: 450px; position: relative; overflow: hidden; z-index: 1; }
        .slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: 1.2s ease-in-out; }
        .slide.active { opacity: 1; }
        .hero-overlay { height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; text-align: center; }
        .welcome-text { font-size: clamp(1.8rem, 5vw, 3.5rem); color: #fff; margin-bottom: 15px; }
        .hero-subtext { color: #ccc; margin-bottom: 25px; max-width: 600px; padding: 0 20px; }

        .slider-indicators { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 5; }
        .dot { width: 8px; height: 8px; background: rgba(255,255,255,0.4); border-radius: 50%; cursor: pointer; }
        .dot.active { background: var(--accent-1); width: 25px; border-radius: 10px; }

        /* SECTIONS */
        .about-section, .how-it-works, .testimonials, .contact-section { padding: 80px 0; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .about-image img { width: 100%; border-radius: 15px; box-shadow: 15px 15px 0 var(--accent-1); }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; margin-top: 40px; padding: 0 5%; }
        .step-card { background: #fff; padding: 40px 25px; border-radius: 15px; position: relative; }
        .step-num { font-size: 3rem; font-weight: 800; color: #f5f5f5; position: absolute; top: 10px; right: 20px; }
        
        .testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; padding: 0 5%; margin-top: 40px; }
        .test-card { background: #fff; padding: 30px; border-radius: 15px; text-align: left; border-left: 4px solid var(--accent-1); }
        
        .stats-bar { display: flex; justify-content: space-around; padding: 50px 5%; background: var(--text); color: #fff; text-align: center; }

        .contact-container { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 0 5%; }
        .contact-form { display: flex; flex-direction: column; gap: 12px; }
        .contact-form input, .contact-form textarea { padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; }
        .btn-primary { background: var(--accent-1); color: white; padding: 12px 30px; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; }

        /* MOBILE SIDEBAR FIX */
        @media (max-width: 900px) {
          .hamburger { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; z-index: 2000; }
          .hamburger .bar { width: 22px; height: 2px; background: #333; transition: 0.3s; }
          
          .top-nav { 
            position: fixed; top: 0; right: -100%; width: 70%; height: 100vh; 
            background: #fff; flex-direction: column; justify-content: center; 
            transition: 0.4s ease-in-out; z-index: 1500; 
            box-shadow: -10px 0 20px rgba(0,0,0,0.1); 
          }
          .top-nav.open { right: 0; }
          .about-grid, .contact-container { grid-template-columns: 1fr; text-align: center; }
          .about-image { order: -1; }
        }

        .reveal { opacity: 0; transform: translateY(30px); transition: 0.8s ease-out; }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .landing-footer { padding: 30px; background: #111; color: #555; text-align: center; }
      `}</style>
    </div>
  );
}