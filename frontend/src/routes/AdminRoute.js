import { useAuth } from "../component/AuthContext";
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

//관리자 페이지 접근 제어용 컴포넌트
const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    // alert 반복으로 뜨던 현상 수정
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            alert('관리자 권한이 필요합니다.');
        }
    }, [user]);

    //회원이 아니거나, 관리자가 아니면 접근 거부
    if (!user || user.role !== 'ADMIN') {
        //관리자가 아닐 시 로그인 페이지로 연결
        return <Navigate to="/login" replace />
    }

    //관리자일 경우 요구된 컴포넌트 반환
    return children;
};

export default AdminRoute;