import { useEffect, useState } from 'react';
import styles from './ProductManagement.module.css';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function ProductManagement({ setActiveView }) {
    const [products, setProducts] = useState([]); //mock 데이터에서 실제 상품 데이터로 변경
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true); //로딩 스테이트
    const [error, setError] = useState(null); // 에러 표기용 스테이트

    //페이지네이션 대비
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);


    //상품 로딩 기능. 페이지네이션 기능 포함
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true); //훅 시작시 로딩 활성화
            setError(null); //훅 시작시 에러 초기화

            const url = `${API_BASE_URL}/product/list`;
            const config = {
                params: {
                    page: page,
                    size: 10 // 고정 최대 사이즈 10페이지
                }
            };

            try {
                const response = await axios.get(url, config); //답변 대기를 위한 async 
                console.log('Full API Response:', response.data);

                setProducts(response.data.content || []); //상품 내용 set
                setTotalPages(response.data.totalPages || 0); //페이지 설정
            } catch (err) {
                console.error('상품 불러오기 에러:', err);
                setError('상품을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                setIsLoading(false); //상품 가져오기 시도 후 로딩 비활성화
            }
        };

        fetchProducts();
    }, [page]); // '페이지' 스테이트 변경시마다 재실행

    //페이징 핸들러
    const handleNextPage = () => {
        // 페이지 0 인덱스, 총 페이지 1 인덱스
        if (page < totalPages - 1) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };



    // CRUD 기능 플레이스홀더
    const handleAddNew = () => {
        setActiveView('productInsert');
    };

    const handleEdit = (productId) => {
        console.log(`TODO: Open 'Edit' modal for product ${productId}`);

        try {
            axios.delete(`api/products/${productId}`);

            setProducts((prevProducts) =>
                prevProducts.filter((p) => p.id !== productId)
            );
            alert('상품이 삭제되었습니다.');
        } catch (error) {
            console.error('삭제 중 오류 :', error);
            alert('상품 삭제 중 오류가 발생하였습니다.');
        }
    };

    const handleDelete = (productId) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
            console.log(`TODO: Open 'Delete' confirmation for product ${productId}`);
            // Example of how you'd update state (once confirmed):
            // setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        }
    };


    //페이지 렌더링 용 함수
    const renderTable = () => {
        if (isLoading) {
            return <div className={styles.loading}>Loading products...</div>;
        }

        if (error) {
            return <div className={styles.error}>{error}</div>;
        }



        return (
            <div className={styles.tableContainer}>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th>이미지</th>
                            <th>상품명</th>
                            <th>카테고리</th>
                            <th>가격</th>
                            <th>재고</th>
                            <th>변경</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.emptyCell}>
                                    상품이 없습니다. '신규 상품 추가' 버튼을 눌러 상품을 등록해주세요.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            // 백엔드 이미지 경로
                                            src={`${API_BASE_URL}/uploads/products/${product.imageUrl}`}
                                            alt={product.name}
                                            className={styles.productThumbnail}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>{product.price.toLocaleString('ko-KR')}원</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleEdit(product.id)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div className={styles.productPage}>
            <div className={styles.header}>
                <button className={styles.addButton} onClick={handleAddNew}>
                    <Plus size={20} />
                    신규 상품 추가
                </button>
            </div>

            {/* 로딩, 에러 혹은 표 내용물 표기 */}
            {renderTable()}

            {/* 페이징 컨트롤 */}
            {!isLoading && !error && totalPages > 0 && (
                <div className={styles.pagination}>
                    <button onClick={handlePrevPage} disabled={page === 0}>
                        이전
                    </button>
                    <span>
                        Page {page + 1} of {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={page >= totalPages - 1}>
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}
export default ProductManagement;