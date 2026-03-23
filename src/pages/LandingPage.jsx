import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Scroll-reveal animation logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  return (
    <div className="landing-container">
      
      {/* --- MOBILE RESPONSIVE HEADER --- */}
      <header className="brand-header">
        <div className="brand">
          <h2>TuitionMaster</h2>
        </div>
        
        <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`top-nav ${isMenuOpen ? 'open' : ''}`}>
          <a href="#home" className="link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#features" className="link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#about" className="link" onClick={() => setMenuOpen(false)}>About</a>
          <Link to="/login" className="link" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn-primary-sm" onClick={() => setMenuOpen(false)}>Join Now</Link>
        </nav>
      </header>

      {/* 1. HERO SECTION */}
      <section id="home" className="landing-hero">
        <div className="hero-overlay">
          <div className="hero-content reveal">
            <h1 className="welcome-text">Master Your Studies with TuitionMaster</h1>
            <p className="hero-subtext">Connecting students with expert tutors for personalized learning in West Bengal.</p>
            <div className="cta-group">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <a href="#features" className="btn-secondary">Explore Features</a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="stats-bar">
        <div className="stat-item reveal">
          <h3>500+</h3>
          <p>Expert Tutors</p>
        </div>
        <div className="stat-item reveal">
          <h3>2k+</h3>
          <p>Happy Students</p>
        </div>
        <div className="stat-item reveal">
          <h3>50+</h3>
          <p>Colleges Linked</p>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="landing-features">
        <div className="section-header reveal">
          <h2>Why Choose Us?</h2>
          <div className="loader-bar"></div>
        </div>
        <div className="features-grid">
          <div className="feature-card reveal">
            <div className="icon">🎓</div>
            <h3>Verified Tutors</h3>
            <p>We personally vet every educator to ensure top-quality teaching standards.</p>
          </div>
          <div className="feature-card reveal">
            <div className="icon">💬</div>
            <h3>Direct Chat</h3>
            <p>Communicate directly with your teachers via our secure messaging system.</p>
          </div>
          <div className="feature-card reveal">
            <div className="icon">📊</div>
            <h3>Track Progress</h3>
            <p>Admins and students can monitor learning curves and request logs easily.</p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header reveal">
          <h2>How It Works</h2>
        </div>
        <div className="steps-container">
          <div className="step reveal">
            <span>01</span>
            <h4>Create Account</h4>
            <p>Sign up as a student or tutor in seconds.</p>
          </div>
          <div className="step reveal">
            <span>02</span>
            <h4>Find Match</h4>
            <p>Search by subject or college to find the perfect educator.</p>
          </div>
          <div className="step reveal">
            <span>03</span>
            <h4>Start Learning</h4>
            <p>Join classes and boost your academic performance.</p>
          </div>
        </div>
      </section>

      {/* 5. ABOUT US */}
      <section id="about" className="landing-about reveal">
        <div className="section-header">
          <h2>Our Story</h2>
        </div>
        <p className="about-text">
          TuitionMaster was born out of a need for structured, accessible education. 
          By bridging the gap between ambitious students and qualified educators, 
          we are redefining the tuition culture in India.
        </p>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="landing-contact reveal">
        <div className="card contact-card">
          <h2>Get In Touch</h2>
          <p>Have specific requirements? Send us an email.</p>
          <div className="contact-info">
            <div className="info-item"><strong>Email:</strong> support@tuitionmaster.com</div>
            <div className="info-item"><strong>Location:</strong> West Bengal, India</div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 TuitionMaster. All rights reserved.</p>
      </footer>

      <style jsx>{`
        /* --- GLOBAL & MOBILE RESET --- */
        :root {
          --bg: #faf9f7;
          --surface: #ffffff;
          --muted: #8b7968;
          --text: #1f1e1c;
          --accent-1: #c9a35e;
          --accent-2: #f5ede2;
        }

        .landing-container {
          overflow-x: hidden; /* Prevent horizontal scroll on mobile */
          scroll-behavior: smooth;
        }

        /* --- HEADER & NAV --- */
        .brand-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 5%;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .top-nav {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .btn-primary-sm {
          background: var(--accent-1);
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        /* --- MOBILE NAV LOGIC --- */
        @media (max-width: 900px) {
          .hamburger {
            display: flex !important;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            z-index: 1100;
          }

          .hamburger .bar {
            width: 25px;
            height: 3px;
            background: var(--text);
            transition: 0.3s;
          }

          .top-nav {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            height: 100vh;
            background: white;
            flex-direction: column;
            justify-content: center;
            transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          }

          .top-nav.open {
            right: 0;
          }
        }

        /* --- HERO SECTION --- */
        .landing-hero {
          height: 85vh;
          background: url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
          position: relative;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .welcome-text {
          font-size: clamp(2rem, 8vw, 3.5rem);
          color: white;
          margin-bottom: 15px;
          line-height: 1.1;
        }

        .cta-group {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 30px;
        }

        @media (max-width: 480px) {
          .cta-group {
            flex-direction: column;
            width: 100%;
          }
          .btn-primary, .btn-secondary {
            width: 100%;
            text-align: center;
          }
        }

        /* --- STATS BAR --- */
        .stats-bar {
          display: flex;
          justify-content: space-around;
          padding: 50px 20px;
          background: white;
          text-align: center;
        }

        @media (max-width: 768px) {
          .stats-bar {
            flex-direction: column;
            gap: 40px;
          }
        }

        /* --- FEATURES GRID --- */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .feature-card {
          padding: 30px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        /* --- REVEAL ANIMATIONS --- */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* --- FOOTER --- */
        .landing-footer {
          padding: 30px;
          background: #111;
          color: #777;
          text-align: center;
        }
      `}</style>
    </div>
  );
}