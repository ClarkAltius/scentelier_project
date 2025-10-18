import styles from './Admin.module.css';
import Sidebar from '../component/Sidebar';
import Topbar from '../component/Topbar';

function Admin() {

    return (
        <div className={styles.adminPageWrapper}>
            <Sidebar />

            <div className={styles.mainContent}>
                <div className={styles.topbar}>
                    <Topbar />
                </div>

                {/* Admin Main content */}

            </div>
        </div>
    );
}

export default Admin;