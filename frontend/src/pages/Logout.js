import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 유저 로그아웃
        logout();

        navigate('/');
    }, [logout, navigate]);

    return null;
}

export default Logout;
