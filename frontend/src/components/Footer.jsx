import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-500 pt-5 pb-5 mt-auto">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-5">
          
          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Equipora</h2>
            <p className="text-gray-500 text-sm mb-4">
              The premier trust-first AI-assisted equipment rental marketplace. Rent with confidence.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Investor Relations</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">We're Hiring</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Customer Care</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Free Listing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Cameras & Lenses</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Drones</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Audio & Mics</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Lighting</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Trust & Safety</Link></li>
              <li><Link to="/" className="hover:text-blue-600 transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>support@equipora.com</li>
              <li>1-800-EQUIP-NOW</li>
              <li>123 Trust Avenue, NY</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-500 pt-5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Equipora Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-600">Facebook</a>
            <a href="#" className="hover:text-blue-600">Twitter</a>
            <a href="#" className="hover:text-blue-600">Instagram</a>
            <a href="#" className="hover:text-blue-600">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
