import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    // Create particles animation
    const createParticles = () => {
      const container = particlesRef.current;
      if (!container) return;

      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = 15 + Math.random() * 10 + 's';
        container.appendChild(particle);
      }
    };

    createParticles();

    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        e.preventDefault();
        const id = target.getAttribute('href').slice(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <>
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-glow"></div>
        <div className="particles" ref={particlesRef}></div>

        <div className="hero-content">
          <h1 className="hero-title">
            Master Your <br />
            <span className="gradient-text">Deep Work.</span>
          </h1>
          <p className="hero-subtitle">
            A premium, silence-first library experience. Book your perfect focus pod,
            <br />
            track your progress, unlock achievements, and level up your discipline.
          </p>
          <div className="hero-cta">
            <Link to="/auth" className="btn btn-primary btn-lg">
              Reserve Your Seat
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container" style={{ padding: '100px 20px' }}>
        <div className="text-center" style={{ marginBottom: '60px' }}>
          <h2>
            Why Choose <span className="gradient-text">BookMySeat</span>?
          </h2>
          <p className="text-muted" style={{ fontSize: '1.125rem', marginTop: '16px' }}>
            Everything you need for maximum productivity
          </p>
        </div>

        <div className="features flex flex-wrap gap-6">
          <div className="glass-panel feature-card">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
            <h3 className="text-teal" style={{ marginBottom: '12px' }}>
              Smart Booking
            </h3>
            <p className="text-muted">
              Reserve your preferred seat type in advance. QR code check-in with
              automatic session tracking.
            </p>
          </div>

          <div className="glass-panel feature-card">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
            <h3 className="text-gold" style={{ marginBottom: '12px' }}>
              Achievements
            </h3>
            <p className="text-muted">
              Unlock badges, earn XP, and compete on the leaderboard. Gamify your
              productivity journey.
            </p>
          </div>

          <div className="glass-panel feature-card">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <h3 className="text-primary" style={{ marginBottom: '12px' }}>
              Analytics
            </h3>
            <p className="text-muted">
              Track your focus time, view booking history, and analyze your
              productivity patterns.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ padding: '100px 20px' }}>
        <div className="glass-panel text-center" style={{ padding: '60px 40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Ready to Level Up?</h2>
          <p
            className="text-muted"
            style={{
              fontSize: '1.125rem',
              marginBottom: '40px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Join thousands of focused individuals who have transformed their
            productivity with BookMySeat.
          </p>
          <Link to="/auth" className="btn btn-primary btn-lg">
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '60px 20px',
          borderTop: 'var(--glass-border)',
          marginTop: '60px'
        }}
      >
        <div className="container">
          <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '40px' }}>
            <div>
              <div className="logo" style={{ marginBottom: '16px' }}>
                BookMySeat.
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Premium focus spaces for deep work and productivity.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Product</h4>
              <div className="flex flex-col gap-2">
                <a href="#features" className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Features
                </a>
                <Link to="/leaderboard" className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Leaderboard
                </Link>
                <Link to="/auth" className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
          <div
            className="text-center text-muted"
            style={{ paddingTop: '40px', borderTop: 'var(--glass-border)' }}
          >
            <p style={{ fontSize: '0.875rem' }}>
              © 2026 BookMySeat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
