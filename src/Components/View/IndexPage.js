import React from 'react';
import { MessageCircle, UserPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 shadow-2xl relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-20"></div>
        <div className="p-8 relative">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-0.5 rounded-full w-20 h-20 mx-auto mb-6">
              <div className="bg-gray-900 w-full h-full rounded-full flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent mb-3">
              Welcome to ChatApp
            </h1>
            <p className="text-gray-400">Experience premium conversations</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button 
              className="w-full py-6 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-gray-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 rounded-xl"
            >
              Start Chatting
              <ArrowRight className="w-5 h-5" />
            </button>
<Link to='/find-user' >
            <button 
              className="w-full py-6 text-lg flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-yellow-500/20 hover:border-yellow-500/30 text-gray-300 rounded-xl transition-all duration-300"
            >
              <UserPlus className="w-5 h-5" />
              Add New Chat
            </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <p className="mt-8 text-sm text-gray-500">
        © 2025 ChatApp. All rights reserved.
      </p>
    </div>
  );
};

export default ChatHomePage;