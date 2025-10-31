import { useEffect, useState } from 'react';
import styles from './ProductManagement.module.css';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;


function ProductManagement({ setActiveView }) {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true); //로딩 스테이트
    const [error, setError] = useState(null); // 에러 표기용 스테이트
    const [selectedIds, setSelectedIds] = useState([]); // 체크박스용 스테이트

    const isAllSelected = products.length > 0 && selectedIds.length === products.length; // 모든 행 선택 

    //페이지네이션 대비
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);



            //상품 로딩 기능. 페이지네이션 기능 포함
        useEffect(() => {
        let ignore = false;                        // 늦은 응답 무시 플래그
        const controller = new AbortController();  // axios 취소용

        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            try {
            const response = await axios.get(
                `${API_BASE_URL}/product/list`,
                { params: { page, size: 10 }, signal: controller.signal } // <= 중요
            );

            const data = response.data;
            const raw =
                Array.isArray(data) ? data :
                Array.isArray(data.content) ? data.content :
                Array.isArray(data.data) ? data.data :
                Array.isArray(data.rows) ? data.rows : [];

            if (ignore) return; // 늦게 도착한 응답은 버림
                const normalized = raw.map(p => {
                const isDelRaw = p.isDeleted ?? p.is_deleted ?? p.isdeleted ?? 0;
                const isDel = Number(isDelRaw) === 1 || isDelRaw === true ? 1 : 0;

                // 서버가 PENDING 주면 우선
                const base =
                    p.status ??
                    (p.selling === true ? 'SELLING' : (p.selling === false ? 'STOPPED' : 'SELLING'));

                // is_deleted=1 이면 화면상 STOPPED로 강제
                const computedStatus = isDel ? 'STOPPED' : base;

                return {
                    ...p,
                    isDeleted: isDel,
                    status: computedStatus,
                };
                });
                setProducts(normalized);

            const tp =
                Number.isFinite(data?.totalPages) ? data.totalPages :
                Number.isFinite(data?.page?.totalPages) ? data.page.totalPages :
                1;
            setTotalPages(tp);
            } catch (err) {
            if (axios.isCancel?.(err)) return; // 사용자가 페이지 이동/리렌더로 취소된 경우
            if (err?.name === 'CanceledError') return; // axios@1의 취소 에러명
            console.error('상품 불러오기 에러:', err);
            setError('상품을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
            if (!ignore) setIsLoading(false);
            }
        };

        fetchProducts();

        // cleanup: 다음 렌더/언마운트 시 이전 요청 무시/취소
        return () => {
            ignore = true;
            controller.abort();
        };
        }, [page, API_BASE_URL]);

    const renderStatusBadge = (status) => {
        if (status === "SELLING")
            return <span className={`${styles.badge} ${styles.badgeSelling}`}>판매중</span>;
        if (status === "STOPPED")
            return <span className={`${styles.badge} ${styles.badgeStopped}`}>판매중지</span>;
        if (status === "PENDING")
            return <span className={`${styles.badge} ${styles.badgePending}`}>주문중</span>;

        return <span>알수없음</span>;
    };


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

    // 개별 선택 토글
    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // 전체 선택 토글
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);

        } else {
            setSelectedIds(products.map((p) => p.id));
        }
    };

       const tryRestoreOnServer = async (id) => {
        const url = `${API_BASE_URL}/product/restore/${encodeURIComponent(id)}`;
        try {
          return await axios.patch(url, null, { withCredentials: true });
        } catch (err) {
          if (err?.response?.status === 404) {
            // 백엔드 복구 API가 없다면 여기서 명확히 알림
            throw new Error('복구 API(/product/restore/{id})가 없습니다. 백엔드 추가가 필요해요.');
          }
          throw err;
        }
        };

// 기존 handleToggleStatus가 없으면 추가, 있으면 이 로직으로 교체
const handleToggleStatus = async (id, currentStatus, isDeletedFlag) => {
  // 1) 주문중이면 금지
  // if (currentStatus === 'PENDING') {
  //   alert('주문중(PENDING) 상태에서는 판매 상태를 변경할 수 없습니다.');
  //   return;
  // }

  // 2) 판매중 → 판매중지: 기존처럼 소프트삭제 DELETE /product/{id}
  if (currentStatus === 'SELLING') {
    console.log('[SELLING → STOPPED] try DELETE /product/', id);
    const snapshot = [...products];
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, isDeleted: 1, status: 'STOPPED' } : p)
    );

    try {
      await axios.delete(`${API_BASE_URL}/product/${encodeURIComponent(id)}`, {
        withCredentials: true,
      });
      alert('해당 상품을 판매중지했습니다.');
      return;
    } catch (err) {
      setProducts(snapshot);
      const msg = err?.response?.data || '판매중지 실패';
      alert(typeof msg === 'string' ? msg : '판매중지 실패');
      return;
    }
  }

  // 3) 판매시작(STOPPED) → 복구 PATCH /product/restore/{id}
  if (currentStatus === 'STOPPED' || isDeletedFlag === 1 || isDeletedFlag === true) {
    console.log('[STOPPED → SELLING] try RESTORE /product/restore/', id);
    const snapshot = [...products];
    // 낙관적 업데이트
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, isDeleted: 0, status: 'SELLING' } : p)
    );

    try {
      const res = await tryRestoreOnServer(id);
      const isDel = res?.data?.is_deleted ?? 0;

      // 서버 결과로 확정 반영
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, isDeleted: isDel, status: isDel ? 'STOPPED' : 'SELLING' }
            : p
        )
      );
      alert(res?.data?.message || '상품이 복구되었습니다.');
      return;
    } catch (err) {
      // 롤백
      setProducts(snapshot);
      const msg = err?.message || err?.response?.data || '판매시작(복구) 실패';
      alert(typeof msg === 'string' ? msg : '판매시작(복구) 실패');
      return;
    }
  }

  // 이외 케이스 방어
  alert('상태 변경을 진행할 수 없습니다.');
};

    // CRUD 기능 플레이스홀더
    const handleAddNew = () => {
        setActiveView('productInsert');
    };

    const handleEdit = (productId) => {
        console.log(`TODO: Open 'Edit' modal for product ${productId}`);

    };

    const handleDelete = async (productId) => {

        if (!window.confirm('정말 삭제하시겠습니까?'))
            return;

        const del = products;
        setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
        await axios.delete(`${API_BASE_URL}/product/${encodeURIComponent(productId)}`, {
        withCredentials: true,
        });
        alert('상품이 삭제되었습니다.'); 
        setSelectedIds(prev => prev.filter(id => id !== productId)); 
    } catch (error) {
        console.error('삭제 중 오류:', error);
        setProducts(del);
        alert('상품 삭제 중 오류가 발생하였습니다.');
    }
    };

    const handleSelectDelete = async () => {
        if (selectedIds.length === 0) return;

        if (!window.confirm(`선택된 ${selectedIds.length}개의 상품을 삭제하시겠습니까?`))

            return alert('상품 삭제가 취소되었습니다');

        setProducts((prev) => prev.filter((products) => !selectedIds.includes(products.id)));

        const del = products;

        try {
            const result = await Promise.allSettled(
                selectedIds.map((id) =>
                    axios.delete(`${API_BASE_URL}/product/${encodeURIComponent(id)}`, { withCredentials: true })));


            const successCount = result.filter((result) => result.status === 'fulfilled').length;
            const failCount = result.length - successCount;

            if (failCount > 0) {
                // 실패한부분 롤백
                const failedIds = result
                    .map((r, idx) => ({ r, id: selectedIds[idx] }))
                    .filter((x) => x.r.status === 'rejected')
                    .map((x) => x.id);


                setProducts((curr) => {

                    const failedItems = del.filter((item) => failedIds.includes(item.id));
                    const survivors = curr.filter((item) => !failedIds.includes(item.id));
                    return [...survivors, ...failedItems].sort((a, b) => a.id - b.id);
                });

                alert(`일부 항목 삭제 실패: 성공 ${successCount}개, 실패 ${failCount}개`);
            } else {
                alert(`선택한 ${successCount}개 상품을 삭제했습니다.`);
            }
            setSelectedIds([]);
        } catch (err) {
            console.error('선택 삭제 오류 :', err);
            setProducts(del); // 전면 롤백
            alert('선택 삭제 중 오류가 발생했습니다');
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

            // const handleToggleStatus = async (id, currentStatus, isDeletedFlag) => {
            //     // 프리체크
            //     if (isDeletedFlag === true || isDeletedFlag === 1) {
            //         alert('삭제된(is_deleted=1) 상품은 상태 변경할 수 없습니다.');
            //         return;
            //     }
            //     if (currentStatus === 'PENDING') {
            //         alert('주문중(PENDING) 상태에서는 판매 상태를 변경할 수 없습니다.');
            //         return;
            //     }

            //     // 다음 상태 계산
            //     const nextStatus = currentStatus === 'SELLING' ? 'STOPPED' : 'SELLING';

            //     // 낙관적 업데이트
            //     const snapshot = [...products];
            //     setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));

            //     try {
            //         const res = await tryToggleStatusOnServer(id, nextStatus); // ★ 여기! 필수

            //         // 서버 응답 정규화: 문자열 or 객체 모두 수용
            //         let serverStatus = null;
            //         if (typeof res.data === 'string') {
            //         serverStatus = res.data; // 'SELLING' | 'STOPPED' | 'PENDING'
            //         } else if (res.data && typeof res.data === 'object') {
            //         // { is_deleted: 0|1, message?: string } 같은 형태일 수 있음
            //         const isDel = res.data.isDeleted ?? res.data.is_deleted;
            //         if (isDel !== undefined) {
            //             serverStatus = isDel ? 'STOPPED' : 'SELLING';
            //         }
            //         }

            //         if (serverStatus) {
            //         setProducts(prev =>
            //             prev.map(p =>
            //             p.id === id
            //                 ? { ...p, status: serverStatus, isDeleted: serverStatus === 'STOPPED' ? 1 : 0 }
            //                 : p
            //             )
            //         );
            //         }
            //     } catch (err) {
            //         // 롤백 + 메시지
            //         setProducts(snapshot);
            //         const msg = err?.response?.data || '상태 변경 실패';
            //         alert(typeof msg === 'string' ? msg : '상태 변경 실패');
            //     }
            //     };

        return (
      <div className={styles.tableContainer}>
        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  aria-label="전체 선택"
                />
              </th>
              <th>이미지</th>
              <th>상품명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>재고</th>
              <th>상태</th>
              <th>변경</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  상품이 없습니다. '신규 상품 추가' 버튼을 눌러 상품을 등록해주세요.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className={product.status === 'STOPPED' ? styles.rowStopped : undefined}
                  onClick={(e) => {
                    if (e.target.closest('button') || e.target.tagName === 'INPUT') return;
                    handleSelect(product.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onClick={(e) => {
                      // e.stopPropagation();
                      // handleToggleStatus(product.id, product.status, product.isDeleted);
}}
                      onChange={() => handleSelect(product.id)}
                      aria-label={`${product.name} 선택`}
                    />
                  </td>

                  <td>
                    <img
                      src={
                        product.imageUrl
                          ? `${API_BASE_URL}/uploads/products/${product.imageUrl}`
                          : `${API_BASE_URL}/uploads/products/placeholder.jpg`
                      }
                      alt={product.name || '상품 이미지'}
                      className={styles.productThumbnail}
                    />
                  </td>

                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {(typeof product.price === 'number'
                      ? product.price.toLocaleString('ko-KR')
                      : product.price) + '원'}
                  </td>
                  <td>{product.stock}</td>

                  <td>{renderStatusBadge(product.status)}</td>

                  <td>
                    <div className={styles.actions}>
                     <button
                    className={styles.toggleStatusButton}
                    disabled={product.status === 'PENDING'}
                    title={
                        product.status === 'PENDING'
                        ? '주문중 상태에서는 판매 상태를 변경할 수 없습니다.'
                        : (product.status === 'SELLING' ? '판매중지' : '판매시작')
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(product.id, product.status, product.isDeleted);
                    }}
                    >
                    {product.status === 'SELLING' ? '판매중지' : '판매시작'}
                    </button>

                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                        aria-label={`${product.name} 삭제`}
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

                {/* 선택 삭제 버튼 */}
                <button
                    className={styles.deleteButton}
                    onClick={handleSelectDelete}
                    disabled={selectedIds.length === 0}
                    title={selectedIds.length === 0 ? '선택된 상품이 없습니다' : `${selectedIds.length}개 삭제`}
                    style={{ marginRight: 12 }}
                >
                    < Trash2 size={18} />
                    <span style={{ marginRight: 6 }}>선택 삭제</span>
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