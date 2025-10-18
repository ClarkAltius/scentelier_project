import styles from './Admin.module.css';
import Sidebar from '../component/Sidebar';
import Topbar from '../component/Topbar';
import Dashboard from '../component/Dashboard';

function Admin() {

    return (

        <div className={styles.adminPageWrapper}>
            <Sidebar />

            <div className={styles.mainContent}>
                {/* Just render the Topbar component directly */}
                <Topbar />

                {/* Admin Main content */}
                <div style={{ padding: '20px' }}>
                    <h2>주문 트렌드</h2>
                    <Dashboard />
                </div>

            </div>
        </div>
    );
}

export default Admin;