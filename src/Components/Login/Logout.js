import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../Urls/Urls';

const Logout = ({ setUser }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Call the backend logout API
        axios.get(`${BASE_URL}/logout`, { withCredentials: true })
            .then((response) => {
                if (response.data.logout) {
                    console.log('Logged out successfully');
                    setUser(null);         // Clear user data
                    // Reset cart count to 0
                    navigate('/login');        // Redirect to login page (or change to '/login' if needed)
                }
            })
            .catch((error) => {
                console.error('Logout failed', error);
            });
    }, [setUser, navigate]);

    return null; // No UI needed
};

export default Logout;
