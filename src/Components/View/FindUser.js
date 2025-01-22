import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios";
import { BASE_URL } from "../Urls/Urls";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const FindUserPage = () => {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const debouncedUsername = useDebounce(username, 500);

  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    if (debouncedUsername) {
      const handleFindUser = async () => {
        setLoading(true);
        setResult([]);
        setError(null);

        try {
          const formData = { username: debouncedUsername };
          const response = await axios.post(`${BASE_URL}/find-user`, formData, {
            withCredentials: true,
          });
          setResult(response.data);
        } catch (err) {
          setError(err.response?.data?.message || "Error finding users");
        } finally {
          setLoading(false);
        }
      };

      handleFindUser();
    } else {
      setResult([]);
    }
  }, [debouncedUsername]);

  const handleMessageClick = (user) => {
    setSelectedUser(user);
    // Navigate to the message page, passing the user ID as a parameter
    navigate(`/message/${user._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Find User</h1>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Search Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username to search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          )}

          {result.length > 0 && (
            <div className="space-y-3">
              {result.map((user) => (
                <div
                  key={user.UserName}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                > 
                  <div>
                    <p className="font-medium text-gray-900">{user.Name}</p>
                    <p className="font-medium text-gray-900">{user._id}</p>
                    <p className="text-sm text-gray-500">@{user.UserName}</p>
                  </div>
                  <button
                    onClick={() => handleMessageClick(user)} // Navigate on button click
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindUserPage;
