import { useEffect, useState, useRef  } from 'react';
import styles from './ProductManagement.module.css';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import { useNavigate } from 'react-router-dom';
import ProductEditModal from './ProductEditModal';
import axios from 'axios';
axios.defaults.withCredentials = true;


function ProductManagement({ setActiveView }) {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [searchText, setSearchText] = useState(''); // 입력값
  const [query, setQuery] = useState('');    
  
  const [editing, setEditing] = useState(null);   // 선택된 상품
  const [showEdit, setShowEdit] = useState(false);

    const [forceSearchTick, setForceSearchTick] = useState(0);
    const abortRef = useRef(null);

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  const category_labels = {
  ALL: '전체',
  CITRUS: '시트러스',
  FLORAL: '플로럴',
  WOODY: '우디',
  CHYPRE: '시프레',
  GREEN: '그린',
  FRUITY: '프루티',
  POWDERY: '파우더리',
  CRYSTAL: '크리스탈',
};

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(searchText.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);


  // 상태 배지
  const renderStatusBadge = (p) => {
    const status = p.isDeleted ? 'STOPPED' : (p.status ?? 'SELLING');
    if (p.stock === 0) return <span className={`${styles.badge} ${styles.badgeStopped}`}>품절</span>;
    if (status === 'SELLING') return <span className={`${styles.badge} ${styles.badgeSelling}`}>판매중</span>;
    if (status === 'STOPPED') return <span className={`${styles.badge} ${styles.badgeStopped}`}>판매중지</span>;
   if (status === 'PENDING') return <span className={`${styles.badge} ${styles.badgePending}`}>주문중</span>;
    return <span>알수없음</span>;
  };

  // 목록 로딩
  useEffect(() => {
  if (abortRef.current) abortRef.current.abort();
  const controller = new AbortController();
  abortRef.current = controller;

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/products`, {
    params: { page, size: 10, includeDeleted: true, q: query },
    signal: controller.signal,  
        withCredentials: true,
      });

      const data = res.data;
      const raw =
        Array.isArray(data) ? data :
        Array.isArray(data?.content) ? data.content :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.rows) ? data.rows : [];

      const normalized = raw.map((p) => {
        const isDelRaw = p.isDeleted ?? p.is_deleted ?? p.isdeleted ?? 0;
        const isDeleted = isDelRaw === true || Number(isDelRaw) === 1;
        const base = p.status ?? (p.selling === true ? 'SELLING' : (p.selling === false ? 'STOPPED' : 'SELLING'));
        const status = (isDeleted || p.stock === 0) ? 'STOPPED' : base;
        return { ...p, isDeleted, status };
      });

      setProducts(normalized);

      const tp =
        Number.isFinite(data?.totalPages) ? data.totalPages :
        Number.isFinite(data?.page?.totalPages) ? data.page.totalPages : 1;
      setTotalPages(tp);
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === 'CanceledError') return;
      console.error('상품 불러오기 에러:', err);
      setError('상품을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchProducts();
  return () => controller.abort();
}, [page, query, forceSearchTick]);

      // 수정 버튼 클릭
    const handleEdit = (product) => {
      setEditing(product);
      setShowEdit(true);
    };
    // 수정 모달 닫기
    const handleEditClose = () => {
      setShowEdit(false);
      setEditing(null);
    };

    // 수정 저장 후 리스트 반영
    const handleEditSaved = (updated) => {
    const uid = updated.id ?? updated.productId; // 어느 쪽이든 대응
    setProducts(prev =>
      prev.map(p => (p.id === uid ? { ...p, ...updated, id: uid } : p))
    );
    handleEditClose();
  };

  // 선택 토글
  const handleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : products.map((p) => p.id));
  };

  // 상태 토글(판매중지/판매시작)
  const handleToggleStatus = async (item) => {
    if (!item || !item.id) {
      alert('상품 ID가 없어 상태를 변경할 수 없습니다.');
      return;
    }

   if (item.stock === 0 && (item.status === 'STOPPED' || item.isDeleted)) {
   alert('재고가 0인 상품은 판매를 시작할 수 없습니다.');
   return;
 }
    const next =
      (item.isDeleted === true || item.isDeleted === 1 || item.status === 'STOPPED')
        ? 'SELLING'
        : 'STOPPED';

    const snapshot = [...products];

    // 낙관적 업데이트
    setProducts((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isDeleted: next === 'STOPPED', status: next } : p)),
    );

    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/admin/products/${encodeURIComponent(item.id)}/status`,
        null,
        { params: { status: next }, withCredentials: true },
      );
      const serverStatus = data?.status ?? next;
const serverIsDeleted = data?.isDeleted ?? (serverStatus === 'STOPPED');
setProducts(prev => prev.map(p =>
  p.id === item.id ? { ...p, isDeleted: serverIsDeleted, status: serverStatus } : p
));
    } catch (err) {
      setProducts(snapshot);
      const msg = err?.response?.data || '상태 변경 실패';
      alert(typeof msg === 'string' ? msg : '상태 변경 실패');
    }
  };
  // 상세 열기/닫기 함수 추가
  const openDetail = async (id) => {
  setShowDetail(true);
  setDetailLoading(true);
  try {
    // 백엔드 상세 엔드포인트(예: GET /api/admin/products/{id})
    const res = await axios.get(`${API_BASE_URL}/api/admin/products/${encodeURIComponent(id)}`, { withCredentials: true });
    setDetail(res.data ?? null);
  } catch (e) {
    // 실패하면 목록의 데이터라도 보여주기
    const fallback = products.find(p => p.id === id) ?? null;
    setDetail(fallback);
  } finally {
    setDetailLoading(false);
  }
};
  const closeDetail = () => { setShowDetail(false); setDetail(null); };

  // CRUD
  const handleAddNew = () => setActiveView('productInsert');

  const handleSelectDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`선택된 ${selectedIds.length}개의 상품을 삭제하시겠습니까?`)) {
      alert('상품 삭제가 취소되었습니다');
      return;
    }

    const snapshot = [...products];
    // 1) 로컬에서 먼저 지워서 즉시 화면에서 사라지게(낙관적 UI)
    const afterLocal = snapshot.filter((p) => !selectedIds.includes(p.id));
    setProducts(afterLocal);

    try {
      const result = await Promise.allSettled(
        selectedIds.map((id) =>
          axios.delete(`${API_BASE_URL}/product/${encodeURIComponent(id)}`, { withCredentials: true })
        )
      );

      const successIds = result
        .map((r, idx) => (r.status === 'fulfilled' ? selectedIds[idx] : null))
        .filter(Boolean);
      const failIds = result
        .map((r, idx) => (r.status === 'rejected' ? selectedIds[idx] : null))
        .filter(Boolean);

      // 2) 실패한 항목만 되돌리기
      if (failIds.length > 0) {
        const failedItems = snapshot.filter((item) => failIds.includes(item.id));
        const survivors = afterLocal; // 이미 성공분은 제거된 상태
        setProducts([...survivors, ...failedItems].sort((a, b) => (a.id > b.id ? 1 : -1)));
        alert(`일부 항목 삭제 실패: 성공 ${successIds.length}개, 실패 ${failIds.length}개`);
      } else {
        alert(`선택한 ${successIds.length}개 상품을 삭제했습니다.`);
        // 3) 이 페이지가 비었으면 이전 페이지로 자동 이동 + 재조회
        if (afterLocal.length === 0 && page > 0) {
          setPage((p) => p - 1);
          setForceSearchTick((t) => t + 1);
        } else {
          // 현재 페이지 유지하되 서버와 동기화(토탈페이지/재고/상태 갱신)
          setForceSearchTick((t) => t + 1);
        }
      }
      setSelectedIds([]);
    } catch (err) {
      console.error('선택 삭제 오류 :', err);
      // 전체 실패 시 UI 롤백
      setProducts(snapshot);
      alert('선택 삭제 중 오류가 발생했습니다');
    }
  };

  

  // 테이블 렌더
  const renderTable = () => {
    if (isLoading) return <div className={styles.loading}>Loading products...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

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
                  {query
                    ? '검색 결과가 없습니다.'
                    : '상품이 없습니다. "신규 상품 추가" 버튼으로 등록해주세요.'}
                </td>
              </tr>
            ) : (
                    products.map((product) => {
            
                const isStoppedRow = product.isDeleted === true || product.isDeleted === 1 || product.status === 'STOPPED';
                return (
                  <tr
                    key={product.id}
                    className={isStoppedRow ? styles.rowStopped : undefined}
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
                        loading="lazy"  
                        decoding="async"  
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{category_labels[product.category] ?? product.category ?? '-'}</td>
                    <td>
                      {(typeof product.price === 'number'
                        ? product.price.toLocaleString('ko-KR')
                        : product.price) + '원'}
                    </td>
                    <td>{product.stock}</td>
                    <td>{renderStatusBadge(product)}</td>
                    <td>
                      <div className={styles.actionButtons}>

                         {/* 수정 */}
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                          aria-label={`${product.name} 수정`}
                          title="수정"
                        >
                          <Edit size={16} />
                        </button>
        
                        <button
                            className={styles.viewButton}
                            onClick={(e) => { e.stopPropagation(); openDetail(product.id); }}
                            title="상세보기"
                          >
                            <Eye size={16} />
                            <span style={{ marginLeft: 4 }}>상세</span>
                          </button>

                            {/* 토글 (판매중지/판매시작) */}
                            <button
                              className={styles.toggleStatusButton}
                              disabled={product.status === 'PENDING'}
                              title={
                                product.status === 'PENDING'
                                  ? '주문중 상태에서는 판매 상태를 변경할 수 없습니다.'
                                  : product.status === 'SELLING'
                                    ? '판매중지'
                                    : '판매시작'
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(product);
                              }}
                            >
                              {product.status === 'SELLING' ? '판매중지' : '판매시작'}
                              </button>
                            {/* 삭제 */}
                            {/* <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                              aria-label={`${product.name} 삭제`}
                            >
                              <Trash2 size={16} />
                            </button> */}
                          </div>
                        </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };



  // 여기서 컴포넌트 *안*에서 return
  return (
    <div className={styles.productPage}>
      <div className={styles.header}>

        {/* 검색창 */}
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
         <input
          type="search"
          placeholder="상품명/카테고리/키워드/ID 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          // ADD: Enter 누르면 즉시 서버검색
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setQuery(searchText.trim());
              setPage(0);
              setForceSearchTick(t => t + 1);
            }
          }}
          aria-label="검색"
        />
        {searchText && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setSearchText('');
              setQuery('');
              setPage(0);
              // ADD: 지우기 후 즉시 재조회
              setForceSearchTick(t => t + 1);
            }}
            title="지우기"
            type="button"
          >
            ×
          </button>
        )}
        </div>
        <button className={styles.addButton} onClick={handleAddNew}>
          <Plus size={20} />
          신규 상품 추가
        </button>

        <button
          className={styles.deleteButton}
          onClick={handleSelectDelete}
          disabled={selectedIds.length === 0}
          title={selectedIds.length === 0 ? '선택된 상품이 없습니다' : `${selectedIds.length}개 삭제`}
          style={{ marginRight: 12 }}
        >
          <Trash2 size={18} />
          <span style={{ marginRight: 6 }}>선택 삭제</span>
        </button>
      </div>
      {renderTable()}

      {/* 상세 모달: 테이블 아래, 컴포넌트 하단에 위치 */}
      {showDetail && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
          onClick={closeDetail}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 92vw)', maxHeight: '85vh', overflow: 'auto',
              background: '#fff', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,.15)', padding: 20
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>상품 상세</h3>
              <button className={styles.toggleStatusButton} onClick={closeDetail}>닫기</button>
            </div>

{detailLoading ? (
  <div className={styles.loading}>불러오는 중...</div>
) : !detail ? (
  <div className={styles.error}>상세 정보를 불러오지 못했습니다.</div>
) : (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
      <div>
        <img
          src={
            detail.imageUrl
              ? `${API_BASE_URL}/uploads/products/${detail.imageUrl}`
              : `${API_BASE_URL}/uploads/products/placeholder.jpg`
          }
          alt={detail.name ?? '상품 이미지'}
          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
        />
      </div>
      <div style={{ lineHeight: 1.8 }}>
        <div><strong>ID</strong> : {detail.id}</div>
        <div><strong>상품명</strong> : {detail.name}</div>
        <div><strong>카테고리</strong> : {detail.category ?? '-'}</div>
        <div><strong>가격</strong> : {Number(detail.price)?.toLocaleString('ko-KR')}원</div>
        <div><strong>재고</strong> : {detail.stock ?? 0}</div>
        <div>
          <strong>상태</strong> : {detail.stock === 0 || detail.isDeleted || detail.status === 'STOPPED'
            ? '판매중지'
            : (detail.status === 'PENDING' ? '주문중' : '판매중')}
        </div>
        {detail.description && (
          <div style={{ marginTop: 8 }}>
            <strong>설명</strong><br />
            <div style={{ whiteSpace: 'pre-wrap', color: '#555' }}>{detail.description}</div>
          </div>
        )}
      </div>
    </div>

    {/* 하단 버튼 */}
    <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button
        className={styles.editButton}
        onClick={() => { closeDetail(); handleEdit(detail); }}
      >
        <Edit size={16} style={{ verticalAlign: 'text-bottom' }} /> 수정
      </button>
      {/* <button
        className={styles.toggleStatusButton}
        onClick={() => { closeDetail(); handleToggleStatus(detail); }}
        disabled={detail?.status === 'PENDING'}
        title={detail?.status === 'PENDING' ? '주문중 상태에서는 변경 불가' : ''}
      >
        {detail?.status === 'SELLING' ? '판매중지' : '판매시작'}
      </button> */}
      {/* <button
        className={styles.deleteButton}
        onClick={() => { closeDetail(); handleDelete(detail.id); }}
      >
        <Trash2 size={16} style={{ verticalAlign: 'text-bottom' }} /> 삭제
      </button> */}
    </div>
  </>
)}
<div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {/* 수정 버튼 */}
        <button
          className={styles.editButton}
          onClick={() => {
            closeDetail();
            handleEdit(detail); // detail 상품을 수정 모달로 넘기기
          }}
        >
          <Edit size={16} style={{ verticalAlign: 'text-bottom' }} /> 수정
        </button>
        <button
          className={styles.toggleStatusButton}
          onClick={() => { closeDetail(); handleToggleStatus(detail); }}
          disabled={detail?.status === 'PENDING'}
          title={detail?.status === 'PENDING' ? '주문중 상태에서는 변경 불가' : ''}
        >
          {detail?.status === 'SELLING' ? '판매중지' : '판매시작'}
        </button>
        {/* <button className={styles.deleteButton} onClick={() => { closeDetail(); handleDelete(detail.id); }}>
          <Trash2 size={16} style={{ verticalAlign: 'text-bottom' }} /> 삭제
        </button> */}
      </div>
    </div>
  </div>
)}

      {!isLoading && !error && totalPages > 0 && (
        <div className={styles.pagination}>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            이전
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => (p < totalPages - 1 ? p + 1 : p))} disabled={page >= totalPages - 1}>
            다음
          </button>
        </div>
      )}
      {/* 수정 모달 */}
      {showEdit && editing && (
        <ProductEditModal
          show={showEdit}
          product={editing}
          onClose={handleEditClose}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  )
}

export default ProductManagement;
