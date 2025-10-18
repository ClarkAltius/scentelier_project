import styles from './Topbar.module.css';

function Topbar() {
    const username = "ADMIN";

    return (
        <div className={styles.topbar}>
            <div>관리자 페이지</div>
            <div className={styles.userInfo}>{username}</div>
        </div>
    );
}
export default Topbar;