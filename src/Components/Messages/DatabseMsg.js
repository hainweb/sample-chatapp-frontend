import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import axios from "axios";
import socket from "./Socket";
import { BASE_URL } from "../Urls/Urls";

const MessagePage = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Fetch current user data
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-user`, {
          withCredentials: true
        });
        console.log('response in bvbhb');
        
        if (response.data.status) {
          setCurrentUser(response.data.user);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError("Authentication error");
        navigate('/login');
      }
    };

    getCurrentUser();
  }, [navigate]);

  // Socket connection setup
  useEffect(() => {
    if (!currentUser) return;

    const setupSocket = () => {
      // Ensure socket is connected
      if (!socket.connected) {
        socket.connect();
      }

      socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
        setSocketConnected(true);
        
        // Join rooms for both current user and chat partner
        socket.emit("joinRoom", { userId: currentUser._id });
        socket.emit("joinRoom", { userId });
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
        setError('Connection error. Messages may be delayed.');
      });

      // Handle incoming messages
      const handleReceiveMessage = (newMessage) => {
        console.log('Received new message:', newMessage);
        setMessages(prevMessages => {
          // Check if message already exists
          const messageExists = prevMessages.some(msg => msg.messageId === newMessage.messageId);
          if (messageExists) return prevMessages;
          
          const updatedMessages = [...prevMessages, newMessage];
          scrollToBottom();
          return updatedMessages;
        });
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        console.log('Cleaning up socket connections');
        socket.off('connect');
        socket.off('connect_error');
        socket.off('receiveMessage', handleReceiveMessage);
        socket.emit("leaveRoom", { userId: currentUser._id });
        socket.emit("leaveRoom", { userId });
        socket.disconnect();
      };
    };

    const socketCleanup = setupSocket();
    return () => socketCleanup();
  }, [userId, currentUser]);

  // Fetch messages
  useEffect(() => {
    if (!currentUser) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/get-user-messages`,
          { userId },
          { withCredentials: true }
        );
        if (response.data.status) {
          setUser(response.data.user);
          setMessages(response.data.messages);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, [userId, currentUser]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/send-message`,
        { receiverId: userId, message: message.trim() }, 
        { withCredentials: true }
      );

      if (response.data.status) {
        const sentMessage = response.data.message;
        console.log('Sending message via socket:', sentMessage);
        
        // Add message to local state immediately
        setMessages(prev => [...prev, sentMessage]);
        
        // Emit via socket if connected
        if (socketConnected) {
          socket.emit("sendMessage", sentMessage);
        } else {
          console.warn('Socket not connected, message sent via HTTP only');
        }

        setMessage("");
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Rest of the component remains the same...

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = (senderId) => {
    return currentUser && currentUser._id === senderId;
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate("/")}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-lg">
                  {user.Name?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.Name}</h2>
                <p className="text-sm text-gray-500">@{user.UserName}</p>
                {!socketConnected && (
                  <p className="text-xs text-yellow-600">Connecting...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* Messages Area */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    isOwnMessage(msg.senderId) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isOwnMessage(msg.senderId)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p className="break-words">{msg.message}</p>
                    <span className="text-xs opacity-70">
                      {new Date(msg.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(msg.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t">
            <div className="flex items-center px-4 py-2">
              <textarea
                className="w-full p-2 border rounded-md"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim()}
                className={`ml-2 p-2 ${
                  sendingMessage || !message.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-400"
                } text-white rounded-full`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default MessagePage;
