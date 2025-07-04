import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../../styles/home.css';

const HomePage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  return (
    <div className="pizza4ps-home">
      {/* Header Section */}
      <header className="navbar">
        <div className="logo">
          PIZZA <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>VIETNAM</span>
        </div>
        <div className="nav-links">
          <a href="/">RESERVATION</a>
          <a href="/" > DELIVERY</a>
          <a href="/"> CAREER</a>
          <a href="/">EN <span style={{ fontSize: '0.8rem' }}>↓</span></a>
          <a href="/"></a>
        </div>
      </header>

      {/* Section 1 - Hero with Video Background */}
      
      <section className="hero-video-section" data-aos="fade">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-bg-video"
          poster="/images/ex.png"
        >
          <source src="/videos/pizza1.mp4" type="video/mp4" />
        </video>

        {/* Vietnam Text */}
        <div className="hero-country-label">
          Vietnam
        </div>

        {/* WOW Box */}
        <div className="hero-wow-box">
          <h2>WOW!!!</h2>
          <p>"WOW" is the highest satisfaction<br />score received from all shops.</p>
          <small>Since 2011～ <a href="/">Learn more</a></small>
          <div className="counter">17,327,653</div>
        </div>
      </section>
      {/* End Section 1 */}

      {/* Section 2 Oneness*/}

      <section className="zero-waste-section" data-aos="fade-up" style={{ backgroundColor: '#763d00' }}>
        <h1>"Oneness"</h1>
        <h1>Compassion through Zero Waste</h1>
        <p>
          Our vision for long-term sustainability is rooted in the belief that having compassion for the Earth or future generations may lead to true happiness.
          Through our zero-waste journey, we aim to inspire people to cultivate a deep sense of compassion for something greater than ourselves.
        </p>
      </section>
      {/* End Section 2 */}

      {/* Section 3 - Location & Menu */}
      <section className="location-menu-section" data-aos="fade-up">
        <div className="location-menu-container">
          {/* Left Column: Location */}
          <div className="location-column">
            <h2>Location</h2>
            <div className="country-tabs">
              <a href="#cambodia">Cambodia</a>
              <a href="#vietnam" className="active">Vietnam</a>
              <a href="#japan">Japan</a>
              <a href="#india">India</a>
              <a href="#indonesia">Indonesia</a>
            </div>
            <div className="shop-selector">
              <span>Select Shop</span>
              <span className="arrow">↓</span>
            </div>
            <div className="location-image-container">
              <img src="/images/pzshop.jpg" alt="Pizza 4P's Shop" />
              <div className="shop-list-overlay">SHOP LIST</div>
            </div>
          </div>

          {/* Right Column: Menu */}
          <div className="menu-column">
            <h2>Menu</h2>
            <div className="menu-image-container">
              <img src="/images/pzmenu.jpg" alt="Pizza 4P's Menu Item" />
              <a href="/menu" className="view-menu-button">
                VIEW<br />MENU
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* End Section 3 */}

      {/* Section 4 - Video Background with Stats */}
      <section className="video-stats-section" data-aos="fade">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/path/to/your-video-poster.jpg"  /* Ảnh hiển thị trước khi video load hoặc nếu không load được */
          className="background-video"
        >
          <source src="/videos/exvd.mp4" type="video/mp4" />
        </video>

        {/* Content Overlay */}
        <div className="video-content-overlay">
          <div className="content-left">
            <h2>Zero Waste</h2>
            <p>We have been highly conscious of zero-waste in every aspect of the restaurant.</p>
            <a href="/zero-waste-details" className="view-more-link">VIEW MORE</a>
          </div>
          <div className="content-right">
            <div className="stat-block">
              <p className="stat-label">Total Waste Amount in 2024</p>
              <p className="stat-value">50,604<span className="unit">kg</span></p>
            </div>
            <div className="stat-block">
              <p className="stat-label">Total Recycled Amount in 2024</p>
              <p className="stat-value">45,690<span className="unit">kg</span></p>
            </div>
          </div>
        </div>
      </section>
      {/* End Section 4 */}

      {/* Section 5 - Sustainability Report */}
      <section
        className="sustainability-section"
        data-aos="fade-up"
        style={{ backgroundImage: "url('/images/xlrt.png')" }}
      >
        <div className="sustainability-overlay">
          <div className="sustainability-left">
            <h1>Sustainability<br />Report</h1>
            <a href="/sustainability" className="view-report-button">VIEW REPORT</a>
          </div>
          <div className="sustainability-right">
            <p>
              This report showcases our<br />
              dedication to the environment<br />
              and society.
            </p>
          </div>
        </div>
      </section>
      {/* End Section 5 */}

      {/* Section 6 - Social Media Grid */}
      <section className="social-media-section" data-aos="fade-up">
        <div className="social-columns">

          {/* Instagram */}
          <div className="social-column">
            <h2>Follow <span>Instagram ↗</span></h2>
            <div className="grid grid-3x3">
              {[...Array(9)].map((_, idx) => (
                <div key={idx} className="grid-item">
                  <img src={`/images/insta-${idx + 1}.jpg`} alt={`Instagram ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* YouTube */}
          <div className="social-column">
            <h2>Subscribe <span>YouTube ↗</span></h2>
            <div className="grid grid-vertical">
              {[...Array(1)].map((_, idx) => (
                <div key={idx} className="grid-item">
                  <img src={`/images/youtube-${idx + 1}.jpg`} alt={`YouTube ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facebook - full width below */}
        <div className="facebook-section">
          <h2>Follow <span>Facebook ↗</span></h2>
          <div className="grid grid-horizontal">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="grid-item">
                <img src={`/images/facebook-${idx + 1}.jpg`} alt={`Facebook ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* End Section 6 */}

      {/* Section 7 - Make the World Smile for Peace */}
      <section className="vision-true-layout" data-aos="fade-up">
        {/* Top Red Banner */}
        <div className="vision-banner">
          <div className="banner-text">
            <small>Our Vision</small>
            <h2>Make the World Smile for Peace</h2>
          </div>
          <a href="/vision" className="vision-btn blue">VIEW MORE</a>
        </div>

        {/* Bottom: Video + Join Us */}
        <div className="vision-main">
          <div className="vision-video-wrapper">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/images/ex.png"
            >
              <source src="/videos/preview.mp4" type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </div>
          <div className="vision-cta-box">
            <h3>Join Us!</h3>
            <p>Join us on the mission of sharing happiness, one pizza at a time.</p>
            <a href="/join" className="vision-btn dark">VIEW MORE</a>
          </div>
        </div>
      </section>
      {/* End Section 7 */}

      {/* Section 8 - Original Products */}
      <section className="original-products-section" data-aos="fade-up">
        <div className="original-products-header">
          <div className="header-left">
            <h2>Original<br />Products</h2>
          </div>
          <div className="header-right">
            <p>
              4P's Originals are goods that offer a variety of products that are artisanal and high quality foods,
              prepared meals, as well as a selection of items produced by our like-minded business partners.
              You can certainly "bring peace home" with 4P's Originals.
            </p>
          </div>
        </div>

        <div className="product-grid">
          {[
            { title: "Frozen pizzas and pastas selection", img: "/products/product-1.jpg" },
            { title: "Goods in Market 4P's", img: "/products/product-2.jpg" },
            { title: "House-made Cheeses", img: "/products/product-3.jpg" },
            { title: "Original Craft Beers", img: "/products/product-4.jpg" },
          ].map((item, idx) => (
            <div className="product-item" key={idx}>
              <img src={item.img} alt={item.title} />
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </section>
      {/* End Section 8 */}

      {/* Section 9 - News */}
      <section className="news-section" data-aos="fade-up">
        <h2 className="news-title">News</h2>
        <div className="news-grid">
          {[
            { date: "2025.4.15", title: "Nurturing Nature: Our Sustainable...", img: "/news/news-1.jpg" },
            { date: "2025.4.4", title: "Seaweed: A Versatile and Sustainable...", img: "/news/news-2.jpg" },
            { date: "2025.3.31", title: "[Seasonal Menu] Taste the Difference 🌿", img: "/news/news-3.jpg" },
            { date: "2025.3.13", title: "Pizza 4P's Featured in Nikkei!", img: "/news/news-4.jpg" },
            { date: "2025.2.18", title: "Featured on CNN!", img: "/news/news-5.jpg" },
            { date: "2025.1.6", title: "Oneness in Pizza – Happy New Year 2025", img: "/news/news-6.jpg" },
            { date: "2024.12.22", title: "Pizza 4P's Indonesia is Officially Open", img: "/news/news-7.jpg" },
            { date: "2024.9.9", title: "Pizza 4P's – A Journey of Making the...", img: "/news/news-8.jpg" },
            { date: "2024.9.17", title: "Pizza 4P's: Spreading Happiness...", img: "/news/news-9.jpg" },
            { date: "2024.7.18", title: "Pizza 4P's Founders Featured on...", img: "/news/news-10.jpg" },
            { date: "2024.6.28", title: "A Story of Sustainability: From...", img: "/news/news-11.jpg" },
          ].map((item, idx) => (
            <div className="news-card" key={idx}>
              <img src={item.img} alt={item.title} />
              <div className="news-meta">
                <small>{item.date}</small>
                <p>{item.title}</p>
              </div>
            </div>
          ))}
          {/* View News Button */}
          <div className="news-view-more">
            <a href="/news" className="view-news-btn">VIEW<br />NEWS</a>
          </div>
        </div>
      </section>
      {/* End Section 9 */}


      {/* Footer */}
      <footer className="site-footer" data-aos="fade-up">
        <div className="footer-container">
          {/* Logo */}
          <div className="footer-logo">
            <img src="/logo-footer.png" alt="Pizza 4P's Logo" />
          </div>

          {/* Links */}
          <div className="footer-links">
            <a href="/company">Company Profile</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/career">Career</a>
          </div>

          {/* Social */}
          <div className="footer-social">
            <p>Follow Us!</p>
            <div className="social-icons">
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-contact">
            <span><strong>For Inquiry</strong> info@pizza4ps.com</span>
            <span><strong>For Feedback</strong> feedback@pizza4ps.com</span>
          </div>
          <p>&copy; 2023 Pizza</p>
        </div>
      </footer>


    </div>
  );
};

export default HomePage; 