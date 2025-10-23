import { Navigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        // 로그인되지 않은 경우 로그인 페이지로
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
