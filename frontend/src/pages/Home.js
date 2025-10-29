import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [stats, setStats] = useState({
    customers: 0,
    professionals: 0,
    services: 0,
    satisfaction: 0
  });

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate statistics on mount
  useEffect(() => {
    const animateCounter = (target, key, suffix = '') => {
      let current = 0;
      const increment = target / 100;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 20);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(10000, 'customers');
          animateCounter(500, 'professionals');
          animateCounter(50000, 'services');
          animateCounter(98, 'satisfaction');
          observer.unobserve(entry.target);
        }
      });
    });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const services = [
    {
      icon: 'fas fa-wrench',
      title: 'Plumbing',
      description: 'Expert plumbing services for leaks, installations, and repairs. Available 24/7 for emergencies.',
      link: '/book-service?service=plumbing'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Electrical',
      description: 'Licensed electricians for installations, repairs, and safety inspections.',
      link: '/book-service?service=electrical'
    },
    {
      icon: 'fas fa-paint-roller',
      title: 'Painting',
      description: 'Professional interior and exterior painting with premium materials.',
      link: '/book-service?service=painting'
    },
    {
      icon: 'fas fa-broom',
      title: 'Cleaning',
      description: 'Deep cleaning services with eco-friendly products.',
      link: '/book-service?service=cleaning'
    },
    {
      icon: 'fas fa-wind',
      title: 'HVAC',
      description: 'Heating and cooling system installation and maintenance.',
      link: '/book-service?service=hvac'
    },
    {
      icon: 'fas fa-hammer',
      title: 'Carpentry',
      description: 'Custom woodwork and furniture repairs by skilled craftsmen.',
      link: '/book-service?service=carpentry'
    }
  ];

  const whyChooseUs = [
    {
      icon: 'fas fa-user-check',
      title: 'Verified Professionals',
      description: 'All our service providers undergo rigorous background checks and verification processes.'
    },
    {
      icon: 'fas fa-clock',
      title: 'Quick Response',
      description: 'Get fast responses and scheduling for your service needs with our efficient platform.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options available.'
    },
    {
      icon: 'fas fa-star',
      title: 'Quality Guarantee',
      description: 'We stand behind our service with quality guarantees and customer satisfaction focus.'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Local Services',
      description: "Connect with local professionals who understand your community's needs."
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you whenever you need assistance.'
    }
  ];

  return (
    <div className="home">
      {/* Navigation */}
      <nav className={`navbar ${navScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo">
            <i className="fas fa-tools"></i>
            <span>FixItNow</span>
          </Link>

          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#why-us">Why Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-login">Dashboard</Link>
                <Link to="/profile" className="btn-signup">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-login">Login</Link>
                <Link to="/signup" className="btn-signup">Sign Up</Link>
              </>
            )}
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <button className="mobile-menu-close" onClick={closeMobileMenu}>
          <i className="fas fa-times"></i>
        </button>
        <ul className="mobile-nav-links">
          <li><a href="#home" onClick={closeMobileMenu}>Home</a></li>
          <li><a href="#services" onClick={closeMobileMenu}>Services</a></li>
          <li><a href="#about" onClick={closeMobileMenu}>About</a></li>
          <li><a href="#why-us" onClick={closeMobileMenu}>Why Us</a></li>
          <li><a href="#contact" onClick={closeMobileMenu}>Contact</a></li>
        </ul>
        <div className="mobile-auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-login" onClick={closeMobileMenu}>Dashboard</Link>
              <Link to="/profile" className="btn-signup" onClick={closeMobileMenu}>Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login" onClick={closeMobileMenu}>Login</Link>
              <Link to="/signup" className="btn-signup" onClick={closeMobileMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
      {mobileMenuOpen && <div className="overlay active" onClick={closeMobileMenu}></div>}

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-star"></i>
            <span>Trusted by 10,000+ Customers</span>
          </div>

          <h1 className="hero-title">
            Professional Home Services at Your Fingertips
          </h1>

          <p className="hero-description">
            Connect with verified professionals for all your home service needs.
            Fast, reliable, and affordable solutions for plumbing, electrical, cleaning, and more.
          </p>

          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="btn-primary">
              <span>Get Started</span>
              <i className="fas fa-arrow-right"></i>
            </button>
            <a href="#services" className="btn-secondary">
              <span>Browse Services</span>
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.customers.toLocaleString()}+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.professionals.toLocaleString()}+</div>
              <div className="stat-label">Verified Professionals</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.services.toLocaleString()}+</div>
              <div className="stat-label">Services Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.satisfaction}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <div className="section-header">
          <span className="section-badge">Our Services</span>
          <h2 className="section-title">What We Offer</h2>
          <p className="section-description">
            Professional services for every home need. Our verified experts are ready to help you.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">
                <i className={service.icon}></i>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <Link to={service.link} className="service-link">
                Book Now <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-content">
          <div className="about-text">
            <h2>About FixItNow</h2>
            <p>
              FixItNow is your trusted partner for all home service needs. We connect
              homeowners with verified, professional service providers in your area.
            </p>
            <p>
              Our mission is to make home services accessible, affordable, and hassle-free.
              With thousands of satisfied customers and hundreds of trusted professionals,
              we're revolutionizing home services.
            </p>
            <button onClick={handleGetStarted} className="btn-primary">
              Get Started Today <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose" id="why-us">
        <div className="section-header">
          <span className="section-badge">Why Choose Us</span>
          <h2 className="section-title">What Makes Us Different</h2>
          <p className="section-description">
            We're committed to providing the best home service experience.
          </p>
        </div>

        <div className="why-grid">
          {whyChooseUs.map((item, index) => (
            <div className="why-card" key={index}>
              <div className="why-icon">
                <i className={item.icon}></i>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" id="contact">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>
            Join thousands of happy customers who trust FixItNow for all their home service needs.
          </p>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-cta white">
                  <i className="fas fa-tachometer-alt"></i> Go to Dashboard
                </Link>
                <Link to="/book-service" className="btn-cta outline">
                  <i className="fas fa-calendar-check"></i> Book Service
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-cta white">
                  <i className="fas fa-user-plus"></i> Create Free Account
                </Link>
                <Link to="/login" className="btn-cta outline">
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>FixItNow</h3>
            <p>Your trusted partner for professional home services.</p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About Us</a></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><Link to="/book-service?service=plumbing">Plumbing</Link></li>
              <li><Link to="/book-service?service=electrical">Electrical</Link></li>
              <li><Link to="/book-service?service=painting">Painting</Link></li>
              <li><Link to="/book-service?service=cleaning">Cleaning</Link></li>
              <li><Link to="/book-service?service=hvac">HVAC</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <ul className="footer-links">
              <li><i className="fas fa-envelope"></i> support@fixitnow.com</li>
              <li><i className="fas fa-phone"></i> +1 (555) 123-4567</li>
              <li><i className="fas fa-map-marker-alt"></i> 123 Service St, City, State</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FixItNow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
