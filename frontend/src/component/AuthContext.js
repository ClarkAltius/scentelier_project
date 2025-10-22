import React, { createContext, useState, useContext, Children } from 'react';

const AuthContext = createContext(null);

/**
 * provider 컴포넌트. 전체 애플리케이션을 wrap 해서 로그인,로그아웃 기능에 
 * 사용자 state 전달
 */

export const AuthProvider = ({ children }) => {
    //유저 정보를 저장할 state
    //유저 정보를 기억하기 위한 sessionStorage 추가
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('user');

        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.log("sessionStorage 에서 유저정보 Parse 실패", error)
            return null;
        }
    });


    //로그인 기능

    const login = (userData) => {
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log("사용자 정보 스트링으로 변경 후 저장: ", userData);

    };

    //로그아웃 기능
    const logout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
    };

    //사용하는 컴포넌트들에 전달할 값(value) 들
    const value = {
        user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

};

/**
 * 커스텀 훅을 사용하면 다른 컴포넌트에서 auth context 를 사
 * 사용하기 쉬워진다
 */

export const useAuth = () => {
    return useContext(AuthContext);
}