import { useState } from "react";
import styles from './UserMyPage.module.css';
import UserSidebar from '../component/UserSidebar';
import MyPage from '../pages/MyPage';
import Cart from '../pages/CartList';
import MyInquiry from '../pages/MyInquiry';
import Orders from '../pages/OrderList';
import { useLocation } from 'react-router-dom';
import MyReviews from '../pages/MyReviewListPage';
import { useEffect } from "react";
import MyPerfume from '../pages/Myperfume';

function UserMyPage() {

    const location = useLocation();

    const [activeView, setActiveView] = useState(
        location.state?.view || 'myPage'
    );

    useEffect(() => {
        if (location.state?.view) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const renderView = () => {
        const views = {
            'myPage': <MyPage />,
            'cart': <Cart />,
            'myInquiry': <MyInquiry />,
            'orders': <Orders />,
            'myReviews': <MyReviews />,
            'myPerfume': <MyPerfume />
        };
        return views[activeView] || <MyPage />;
    };


    return (
        <div className={styles.myPageWrapper}>
            <UserSidebar activeView={activeView} setActiveView={setActiveView} />
            <div className={styles.mainContent}>
                <div className={styles.contentPanel}>
                    {renderView()}
                </div>
            </div>
        </div>
    );
}

export default UserMyPage;