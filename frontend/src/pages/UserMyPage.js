import { useState } from "react";
import styles from './UserMyPage.module.css';
import UserSidebar from '../component/UserSidebar';
import MyPage from '../pages/MyPage';
import Cart from '../pages/CartList';
import MyInquiry from '../pages/MyInquiry';
import Orders from '../pages/OrderList';
import { useLocation } from 'react-router-dom';
import MyReviews from '../pages/MyReviewListPage';
import ReviewWrite from '../pages/ReviewWriteForm';
import { useEffect } from "react";
import MyPerfume from '../pages/Myperfume';
import Inquiry from '../pages/Inquiry';
import InquiryDetail from '../pages/InquiryDetail';

function UserMyPage() {

    const location = useLocation();

    const [activeView, setActiveView] = useState(
        location.state?.view || 'myPage'
    );

    // 문의 id 저장용 스테이트
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);

    useEffect(() => {
        if (location.state?.view) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const renderView = () => {
        const views = {
            'myPage': <MyPage />,
            'cart': <Cart />,
            'myInquiry': <MyInquiry activeView={activeView} setActiveView={setActiveView} setSelectedInquiryId={setSelectedInquiryId} />,
            'orders': <Orders />,
            'myReviews': <MyReviews activeView={activeView} setActiveView={setActiveView} />,
            'myPerfume': <MyPerfume />,
            'reviewWrite': <ReviewWrite />,
            'inquiry': <Inquiry />,
            'inquiryDetail': <InquiryDetail inquiryId={selectedInquiryId} setActiveView={setActiveView} />
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