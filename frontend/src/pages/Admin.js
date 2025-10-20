import styles from './Admin.module.css';
import Sidebar from '../component/Sidebar';
import Topbar from '../component/Topbar';
import Dashboard from '../component/Dashboard';
import { useEffect, useState } from 'react';

//임시
import ProductManagement from '../component/ProductManagement';
import StockManagement from '../component/StockManagement';
import OrderManagement from '../component/OrderManagement';
import CustomerInquiries from '../component/CustomerInquiries';

function Admin() {

    //useEffect. 액티브뷰 패널용 state
    const [activeView, setActiveView] = useState('dashboard');

    //render view function

    const renderView = () => {
        const views = {
            'dashboard': <Dashboard />,
            'products': <ProductManagement />,
            'stock': <StockManagement />,
            'orders': <OrderManagement />,
            'inquiries': <CustomerInquiries />
        };
        return views[activeView] || <Dashboard />;
    };


    return (

        <div className={styles.adminPageWrapper}>
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <div className={styles.mainContent}>
                {/* Just render the Topbar component directly */}
                <Topbar />

                {/* Admin Main content. Active View. */}
                <div style={{ padding: '20px' }}>
                    <h2>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
                    {renderView()}
                </div>

            </div>
        </div>
    );
}

export default Admin;