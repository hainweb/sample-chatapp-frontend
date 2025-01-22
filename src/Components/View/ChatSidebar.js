import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Urls/Urls";
import { useNavigate } from "react-router-dom";

const ChatSidebar = () => {
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate()
  useEffect(() => {
    const fetchChatList = async () => {
      try {

        const response = await axios.get(`${BASE_URL}/get-chat-list`, {
          withCredentials: true,
        });
        console.log('chat list', response);

        setChatList(response.data);
      } catch (error) {
        console.error("Error fetching chat list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, []);

  if (loading) {
    return <div className="w-64 h-screen bg-gray-100 border-r flex items-center justify-center">Loading...</div>;
  }

  if (chatList.length === 0) {
    return (
      <div className="w-64 h-screen bg-gray-100 border-r flex items-center justify-center text-gray-500">
        No chats available. Select a person to chat.
      </div>
    );
  }
  const handleClick = (userId)=> {
    navigate(`/message/${userId}`)
  }

  return (
    <div className="w-64 h-screen bg-gray-100 border-r">
      <div className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold">Chats</h1>
      </div>
      <div className="p-2">
        {chatList.map((chat) => (

          <div onClick={() => handleClick(chat._id)}
            key={chat._id}
            className="flex items-center p-2 mb-2 rounded-lg hover:bg-gray-200 cursor-pointer"
          >

            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-800">
                {chat.Name}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {chat.lastMessage.message}
              </p>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
