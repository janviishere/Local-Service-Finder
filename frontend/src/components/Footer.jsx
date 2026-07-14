import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      style={{
        backgroundColor: 'var(--footer-bg)',
        color: 'var(--footer-text)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
      className="pt-20 pb-10"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-royal-blue text-white p-2 rounded-xl">
                <Wrench size={24} />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Local<span className="text-royal-blue">Finds</span>
              </span>
            </Link>
            <p style={{ color: 'var(--footer-text)', opacity: 0.7 }} className="text-sm leading-relaxed">
              Connecting you with trusted, verified local professionals for all your home and business needs. Reliable service, just a click away.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-royal-blue transition-colors duration-300" style={{ backgroundColor: 'var(--footer-input-bg)', color: 'var(--footer-text)' }}>
                <FaFacebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-royal-blue transition-colors duration-300" style={{ backgroundColor: 'var(--footer-input-bg)', color: 'var(--footer-text)' }}>
                <FaTwitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-royal-blue transition-colors duration-300" style={{ backgroundColor: 'var(--footer-input-bg)', color: 'var(--footer-text)' }}>
                <FaInstagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-royal-blue transition-colors duration-300" style={{ backgroundColor: 'var(--footer-input-bg)', color: 'var(--footer-text)' }}>
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Quick Links</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'All Services', to: '/services' },
                { label: 'Book a Professional', to: '/booking' },
                { label: 'Become a Provider', to: '#' },
                { label: 'Reviews', to: '#' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-sm group transition-colors duration-200 hover:text-royal-blue"
                    style={{ color: 'var(--footer-text)', opacity: 0.75 }}
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0 duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Popular Services</h4>
            <ul className="flex flex-col gap-3">
              {['Electricians', 'Plumbers', 'House Cleaning', 'AC Repair', 'Carpentry', 'Pest Control'].map(service => (
                <li key={service}>
                  <Link
                    to="#"
                    className="flex items-center gap-2 text-sm group hover:text-royal-blue transition-colors duration-200"
                    style={{ color: 'var(--footer-text)', opacity: 0.75 }}
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0 duration-200" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>Contact Us</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-royal-blue mt-0.5 shrink-0" />
                <span className="text-sm" style={{ color: 'var(--footer-text)', opacity: 0.75 }}>123/45 Global City</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-royal-blue shrink-0" />
                <span className="text-sm" style={{ color: 'var(--footer-text)', opacity: 0.75 }}>+91 2536489512</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-royal-blue shrink-0" />
                <span className="text-sm" style={{ color: 'var(--footer-text)', opacity: 0.75 }}>hello@localservicefinder.com</span>
              </li>
            </ul>

            <div className="mt-8">
              <h5 className="font-heading font-medium text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Subscribe to Newsletter</h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-royal-blue"
                  style={{
                    backgroundColor: 'var(--footer-input-bg)',
                    border: '1px solid var(--footer-border)',
                    color: 'var(--footer-text)',
                  }}
                />
                <button className="bg-royal-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors font-semibold whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--footer-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--footer-text)', opacity: 0.5 }}>
            &copy; {new Date().getFullYear()} LocalFinds. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm hover:text-royal-blue transition-colors" style={{ color: 'var(--footer-text)', opacity: 0.5 }}>
              Privacy Policy
            </a>
            <a href="#" className="text-sm hover:text-royal-blue transition-colors" style={{ color: 'var(--footer-text)', opacity: 0.5 }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
