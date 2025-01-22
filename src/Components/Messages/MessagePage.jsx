import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Check } from "lucide-react";
import axios from "axios";
import socket from "./Socket";
import { BASE_URL } from "../Urls/Urls";

const MessagePage = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageStatus, setMessageStatus] = useState({});
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [userStatuses, setUserStatuses] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);



  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  function generateObjectId() {
    const timestamp = Math.floor(Date.now() / 1000).toString(16); // 4-byte timestamp
    const randomBytes = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    return (timestamp + randomBytes).slice(0, 24); // 24-character ObjectId
  }

  // Fetch current user data
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-user`, {
          withCredentials: true
        });
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
      if (!socket.connected) {
        socket.connect();
      }

      // Connect and setup initial status
      socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
        setSocketConnected(true);

        // Join rooms and set online status
        socket.emit("joinRoom", { userId: currentUser._id });
        socket.emit("joinRoom", { userId });
        socket.emit("userOnline", { userId: currentUser._id });
      });

      // Handle connection errors
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
        setError('Connection error. Messages may be delayed.');
      });

      // Handle receiving messages
      socket.on("receiveMessage", (newMessage) => {
        console.log('Received new message:', newMessage);
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg.messageId === newMessage.messageId);
          if (messageExists) return prevMessages;

          // Update message status
          setMessageStatus(prev => ({
            ...prev,
            [newMessage.messageId]: { status: newMessage.status || 'delivered' }
          }));

          // Mark message as seen if recipient is current user
          if (newMessage.receiverId === currentUser._id) {
            socket.emit("markAsSeen", {
              messageId: newMessage.messageId,
              senderId: newMessage.senderId,
              receiverId: currentUser._id
            });

            setMessageStatus(prev => ({
              ...prev,
              [newMessage.messageId]: { status: 'seen' }
            }));
          }

          return [...prevMessages, newMessage];
        });
        scrollToBottom();
      });

      // Handle message delivery status
      socket.on("messageDelivered", ({ messageId }) => {
        setMessageStatus(prev => ({
          ...prev,
          [messageId]: { status: 'delivered' }
        }));
      });

      // Handle message seen status
      socket.on("messageSeen", ({ messageId }) => {
        setMessageStatus(prev => ({
          ...prev,
          [messageId]: { status: 'seen' }
        }));
      });

      // Handle user status changes
      socket.on("userStatusChanged", ({ userId, status, lastSeen: userLastSeen }) => {
        setUserStatuses(prev => ({
          ...prev,
          [userId]: status
        }));

        if (userLastSeen) {
          setLastSeen(prev => ({
            ...prev,
            [userId]: userLastSeen
          }));
        }
      });

      // Handle typing indicators
      socket.on('userTyping', (data) => {
        if (data.userId === userId) {
          setIsTyping(data.isTyping);
        }
      });


      // Handle browser window visibility
      const handleVisibilityChange = () => {
        if (document.hidden) {
          socket.emit("userOffline", { userId: currentUser._id });
        } else {
          socket.emit("userOnline", { userId: currentUser._id });
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup function
      return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('receiveMessage');
        socket.off('messageDelivered');
        socket.off('messageSeen');
        socket.off('userStatusChanged');
        socket.off('userTyping');

        document.removeEventListener("visibilitychange", handleVisibilityChange);

        // Clean up rooms and set offline status
        socket.emit("userOffline", { userId: currentUser._id });
        socket.emit("leaveRoom", { userId: currentUser._id });
        socket.emit("leaveRoom", { userId });
        socket.disconnect();
      };
    };

    const socketCleanup = setupSocket();
    return () => socketCleanup();
  }, [userId, currentUser]);



  // Handle user typing
  const handleTyping = useCallback(() => {
    if (!socket || !userId || !socketConnected) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Emit typing event
    socket.emit('typing', {
      userId: currentUser._id,
      receiverId: userId
    });

    // Set new timeout to stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      socket.emit('stopTyping', {
        userId: currentUser._id,
        receiverId: userId
      });
    }, 2000);

    setTypingTimeout(timeout);
  }, [socket, userId, currentUser, socketConnected, typingTimeout]);




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

          if (response.data.user.lastSeen) {
            console.log('the data last seen is in the reso=pson s', response.data.user.lastSeen, 'status', response.data.user.status);

            setUserStatuses(prev => ({
              ...prev,
              [userId]: response.data.user.status
            }));

            setLastSeen(prev => ({
              ...prev,
              [userId]: response.data.user.lastSeen
            }));
          }

          // Initialize message statuses from database
          const statusObj = {};
          response.data.messages.forEach(msg => {
            statusObj[msg.messageId] = {
              status: msg.status || 'sent'
            };
          });
          setMessageStatus(statusObj);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, [userId, currentUser]);

  // Mark messages as seen
  useEffect(() => {
    if (!currentUser || !socketConnected) return;

    const unreadMessages = messages.filter(msg =>
      msg.senderId !== currentUser._id &&
      messageStatus[msg.messageId]?.status !== 'seen'
    );

    if (unreadMessages.length > 0) {
      unreadMessages.forEach(msg => {
        socket.emit("markAsSeen", {
          messageId: msg.messageId,
          senderId: msg.senderId,
          receiverId: currentUser._id
        });
      });
    }
  }, [messages, currentUser, socketConnected, messageStatus]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    const messageData = {
      messageId: generateObjectId(),
      senderId: currentUser._id,
      receiverId: userId,
      message: message.trim(),
      status: 'sent',
      date: new Date().toISOString()
    };
    console.log('message data', messageData);


    try {
      // Set initial status
      setMessageStatus(prev => ({
        ...prev,
        [messageData.messageId]: { status: 'sent' }
      }));

      // Update UI
      setMessages(prev => [...prev, messageData]);
      setMessage("");
      scrollToBottom();

      // Send via socket if connected
      if (socketConnected) {
        socket.emit("sendMessage", messageData);
      }

      // Store in database
      const response = await axios.post(
        `${BASE_URL}/send-message`,
        {
          receiverId: userId,
          message: messageData.message,
          messageId: messageData.messageId
        },
        { withCredentials: true }
      );

      if (response.data.status) {
        const newMessageId = response.data.message.messageId;

        // Update message ID while maintaining status
        setMessages(prev => prev.map(msg => {
          if (msg.messageId === messageData.messageId) {
            return {
              ...msg,
              messageId: newMessageId,
              status: messageStatus[messageData.messageId]?.status || 'sent'
            };
          }
          return msg;
        }));

        // Update status mapping with new message ID
        setMessageStatus(prev => {
          const currentStatus = prev[messageData.messageId]?.status || 'sent';
          const newStatus = {
            ...prev,
            [newMessageId]: { status: currentStatus }
          };
          // Remove temporary message ID
          delete newStatus[messageData.messageId];
          return newStatus;
        });
      }
    } catch (err) {
      console.error('Error in message flow:', err);
      setError("Message sending failed. Please try again.");
    }
  };

  const MessageStatus = ({ messageId }) => {
    const status = messageStatus[messageId]?.status || 'sent';




    return (
      <span className="flex items-center space-x-0.5">
        {status === 'seen' ? (
          <div className="text-green-800">
            <Check className="w-3 h-3 inline" />
            <Check className="w-3 h-3 inline -ml-1" />
          </div>
        ) : status === 'delivered' ? (
          <div className="text-gray-400">
            <Check className="w-3 h-3 inline" />
            <Check className="w-3 h-3 inline -ml-1" />
          </div>
        ) : status === 'sent' ? (
          <div className="text-gray-400">
            <Check className="w-3 h-3 inline" />
          </div>
        ) : (
          <span className="text-gray-400">⏱</span>
        )}
      </span>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = (senderId) => {
    return currentUser && currentUser._id === senderId;
  };

  const renderMessage = (msg, index) => {
    const isOwn = isOwnMessage(msg.senderId);

    return (
      <div
        key={index}
        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[70%] px-4 py-2 rounded-lg ${isOwn ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
        >
          <p className="break-words">{msg.message}</p>
          <div className="flex items-center justify-end space-x-1 mt-1">
            <span className="text-xs opacity-70">
              {new Date(msg.date).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
            {isOwn && <MessageStatus messageId={msg.messageId} />}
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  function formatLastSeen(lastSeenDate) {
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
  
    const isToday = now.toDateString() === lastSeen.toDateString();
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      lastSeen.toDateString();
  
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  
    if (isToday) {
      return `Today ${lastSeen.toLocaleTimeString(undefined, options)}`;
    } else if (isYesterday) {
      return `Yesterday ${lastSeen.toLocaleTimeString(undefined, options)}`;
    } else {
      return `${lastSeen.toLocaleDateString()} ${lastSeen.toLocaleTimeString(undefined, options)}`;
    }
  }

  return (
    <div className="min-h-300 bg-gray-50">
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
                <div className="px-4 text-sm text-gray-500">
                  {userStatuses[userId] === 'online' ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    <span>Last seen: {formatLastSeen(lastSeen[userId])}</span>

                  )}
                  {isTyping && <span className="ml-2 italic">typing...</span>}
                </div>

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
              {messages.map((msg, index) => renderMessage(msg, index))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t">
            <div className="flex items-center px-4 py-2">
              <textarea
                className="w-full p-2 border rounded-lg resize-none"
                placeholder="Type a message..."
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const content = e.target.value.trim();

                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`ml-2 p-2 ${!message.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400"
                  } text-white rounded-full`}
              >
                <Send className="w-5 h-3" />
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