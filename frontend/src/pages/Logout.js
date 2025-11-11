import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../component/AuthContext';
import { Modal, Button } from 'react-bootstrap';
import styles from './Logout.module.css'


function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(true);

    const handleConfirmLogout = () => {
        setShowModal(false);
        logout();
    };

    const handleCancelLogout = () => {
        setShowModal(false);
        navigate(-1);
    };

    return (
        <Modal
            show={showModal}
            onHide={handleCancelLogout}
            centered
            contentClassName={styles.logoutModalContent}
        >
            <Modal.Header
                closeButton
                className={styles.logoutModalHeader}
            >
                <Modal.Title>로그아웃 확인</Modal.Title>
            </Modal.Header>
            <Modal.Body
                className={styles.logoutModalBody}
            >
                정말로 로그아웃 하시겠습니까?
            </Modal.Body>
            <Modal.Footer
                className={styles.logoutModalFooter}
            >
                <Button variant="secondary" onClick={handleCancelLogout}>
                    취소
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirmLogout}
                    className={styles.logoutButton}
                >
                    로그아웃
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default Logout;
