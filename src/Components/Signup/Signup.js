import axios from 'axios'; 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../Urls/Urls';
import { User, Lock, Phone, ShoppingCart } from 'lucide-react';

const Signup = ({ setUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    UserName: '',
    Mobile: '',
    Password: '',
  });
  const [info, setInfo] = useState('');

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();

    axios.post(`${BASE_URL}/signup`, formData, { withCredentials: true }).then((response) => {
      console.log('res sign',response);
      
      if (response.data.status) {
        setUser(response.data.user);
        navigate('/');
        setLoading(false);
      } else {
        setInfo(response.data.message);
        setLoading(false);
        navigate('/signup');
      }
    });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-70"
          style={{
            transform: `translate(${mousePosition.x / 10}px, ${mousePosition.y / 10}px)`,
          }}
        ></div>
        <div className="absolute inset-0 grid grid-cols-4 gap-2 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                animationDelay: `${Math.random() * -10}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-white bg-blue-500 rounded-full">
            <ShoppingCart size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-800">Sign Up</h2>
          <p className="mb-6 text-sm text-gray-600">Create an account with us</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-3 left-3 text-gray-400" />
            <input
              className="w-full px-10 py-3 text-gray-800 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <div className="relative">
            <User className="absolute top-3 left-3 text-gray-400" />
            <input
              className="w-full px-10 py-3 text-gray-800 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="text"
              name="UserName"
              value={formData.UrserName}
              onChange={handleChange}
              placeholder="User Name"
            />
          </div>

          <div className="relative">
            <Phone className="absolute top-3 left-3 text-gray-400" />
            <input
              className="w-full px-10 py-3 text-gray-800 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="number"
              name="Mobile"
              value={formData.Mobile}
              onChange={handleChange}
              placeholder="Mobile"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-400" />
            <input
              className="w-full px-10 py-3 text-gray-800 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          <p className="text-sm text-red-500">{info}</p>

          <Link to="/login">
            <p className="text-sm text-blue-500 hover:underline">Already have an account?</p>
          </Link>

          <button
            type="submit"
            className="flex items-center justify-center w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {loading ? (
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
