import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../component/AuthContext';

function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // 유저 로그아웃
        logout();

        //로그아웃 후 홈페이지로 이동
        console.log('take me home!')
        navigate(`/`);
    }, [logout, navigate]);

    return null;
}

export default Logout;
