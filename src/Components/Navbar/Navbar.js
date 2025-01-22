import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Users, LogOut, LogIn } from 'lucide-react';

function Navbar({ user }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                            Chat App
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link 
                            to="/find-user"
                            className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-700"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Find User
                        </Link>
                        <Link
                            to={user ? '/logout' : '/login'}
                            className="flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors duration-200"
                        >
                            {user ? (
                                <>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {user.Name}/Logout
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/find-user"
                                className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Find User
                            </Link>
                            <Link
                                to={user ? '/logout' : '/login'}
                                className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {user ? (
                                    <>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {user.Name}/Logout
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Login
                                    </>
                                )}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;