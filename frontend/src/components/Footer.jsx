import { Link } from 'react-router-dom';
import { Wrench, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-deep-navy text-warm-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-royal-blue text-white p-2 rounded-xl">
                <Wrench size={24} />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                Local<span className="text-royal-blue">Finds</span>
              </span>
            </Link>
            <p className="text-soft-gray/80 text-sm leading-relaxed">
              Connecting you with trusted, verified local professionals for all your home and business needs. Reliable service, just a click away.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-soft-gray hover:text-white transition-colors"><FaFacebook size={20} /></a>
              <a href="#" className="text-soft-gray hover:text-white transition-colors"><FaTwitter size={20} /></a>
              <a href="#" className="text-soft-gray hover:text-white transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="text-soft-gray hover:text-white transition-colors"><FaLinkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/about" className="text-soft-gray/80 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/services" className="text-soft-gray/80 hover:text-white transition-colors text-sm">All Services</Link></li>
              <li><Link to="/booking" className="text-soft-gray/80 hover:text-white transition-colors text-sm">Book a Professional</Link></li>
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">Become a Provider</Link></li>
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">Reviews</Link></li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 text-white">Popular Services</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">Electricians</Link></li>
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">Plumbers</Link></li>
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">House Cleaning</Link></li>
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">AC Repair</Link></li>
              <li><Link to="#" className="text-soft-gray/80 hover:text-white transition-colors text-sm">Carpentry</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-6 text-white">Contact Us</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-royal-blue mt-0.5 shrink-0" />
                <span className="text-soft-gray/80 text-sm">SAGE University - Bhopal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-royal-blue shrink-0" />
                <span className="text-soft-gray/80 text-sm">000000000000000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-royal-blue shrink-0" />
                <span className="text-soft-gray/80 text-sm">hello@localservicefinder.com</span>
              </li>
            </ul>

            <div className="mt-8">
              <h5 className="font-heading font-medium text-sm mb-3">Subscribe to Newsletter</h5>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-royal-blue w-full" />
                <button className="bg-royal-blue hover:bg-royal-blue/90 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-soft-gray/60 text-sm">
            &copy; {new Date().getFullYear()} LocalFinds. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-soft-gray/60 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-soft-gray/60 hover:text-white text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
