import { React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import View from './Components/View/View';
import './index.css';
import Login from './Components/Login/Login';
import Signup from './Components/Signup/Signup';
import { BASE_URL } from './Components/Urls/Urls';
import axios from 'axios';
import Logout from './Components/Login/Logout';
import FindUserPage from './Components/View/FindUser';
import MessagePage from './Components/Messages/MessagePage';
import ChatHomePage from './Components/View/IndexPage';

function App() {
  const [user, setUser] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-user`, { withCredentials: true });
        if (response.data.status) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="App">
      <Router>
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<View />}>
            <Route index element={<ChatHomePage/>} />
            <Route path="find-user" element={<FindUserPage />} />
             <Route path="message/:userId" element={<MessagePage />} /> {/* Route for the Message page */}
          </Route>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/logout" element={<Logout setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
         
        </Routes>
      </Router>
    </div>
  );
}

export default App;
