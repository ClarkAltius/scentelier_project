import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StockManagement.module.css';
import { Package, Beaker, Edit, Save, X, PlusCircle, FileText, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '../config/config';
import { Pagination, Modal, Button, Form } from 'react-bootstrap';
import { saveAs } from 'file-saver';


/**
 * 재고 발주 페이지 기능
 * 현 재고 수량 열람
 * 상품 선택, 수량 선택, 발주서 제작까지
*/
function StockManagement() {
    // === 스테이트 변수 ===

    // 현재 표기 페이지 (완제, 원액)
    const [activeView, setActiveView] = useState('products');

    // 완제 혹은 원액 을 담을 리스트
    const [products, setProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    // State to track selected items for bulk actions.
    const [selectedItems, setSelectedItems] = useState({ products: new Set(), ingredients: new Set() });

    // Loading and error states for data fetching.
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 재고 변동 저장할 스테이트
    const [adjustmentValues, setAdjustmentValues] = useState({});

    // 검색, 필터링 창 용 스테이트
    const [searchTerm, setSearchTerm] = useState('');

    // 페이징 용 스테이트
    const [pageSize, setPageSize] = useState(20);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // 완제품 정렬, 페이징 용 테이블 스테이트
    const [productSortConfig, setProductSortConfig] = useState({ key: 'stock', direction: 'asc' });
    const [productTotalPages, setProductTotalPages] = useState(0);
    const [productCurrentPage, setProductCurrentPage] = useState(0);

    // 원액 정렬, 페이징 용 테이블 스테이트
    const [ingredientSortConfig, setIngredientSortConfig] = useState({ key: 'stock', direction: 'asc' });
    const [ingredientCurrentPage, setIngredientCurrentPage] = useState(0);
    const [ingredientTotalPages, setIngredientTotalPages] = useState(0);

    // 발주서 생성 버튼 모달 용 스테이트
    const [showPORemarksModal, setShowPORemarksModal] = useState(false);
    const [poSummaryItems, setPoSummaryItems] = useState([]);
    const [poRemarks, setPoRemarks] = useState('');

    // === 훅, 페이징 정렬 업데이트 ===
    useEffect(() => {
        const fetchStockData = async () => {
            setIsLoading(true); // 로딩창 활성화
            setError(null); // 에러 초기화

            // 현 view 기반한 액티브 세팅
            const isProducts = activeView === 'products';
            const endpoint = isProducts ? 'products/stock' : 'ingredients/stock';
            const currentPage = isProducts ? productCurrentPage : ingredientCurrentPage;
            const sortConfig = isProducts ? productSortConfig : ingredientSortConfig;

            // 데이터 fetch
            try {
                // 쿼리 파라미터 빌드
                const params = new URLSearchParams();
                params.append('page', currentPage);
                params.append('size', pageSize);
                params.append('sort', `${sortConfig.key},${sortConfig.direction}`);

                // 검색어 있을 시 검색어 파라미터에 포함
                if (debouncedSearchTerm) {
                    params.append('search', debouncedSearchTerm);
                }
                // productController vs. AdminController ? = AdminController 에서 하자. 
                const url = `${API_BASE_URL}/api/admin/${endpoint}?${params.toString()}`;
                const response = await axios.get(url, { withCredentials: true });


                // Set state for the correct table
                if (isProducts) {
                    setProducts(response.data.content || []);
                    setProductTotalPages(response.data.totalPages);
                } else {
                    setIngredients(response.data.content || []);
                    setIngredientTotalPages(response.data.totalPages);
                }
                // console.log(response.data.content);
            } catch (err) {
                console.error("Failed to fetch stock data:", err);
                setError("재고 정보를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStockData();
    }, [activeView, productCurrentPage, productSortConfig, ingredientCurrentPage, ingredientSortConfig, pageSize, debouncedSearchTerm]);

    // 검색창 딜레이 훅
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // === 이벤트 핸들러 ===
    const handleAdjustClick = (item, type) => {

        const newStock = adjustmentValues[item.id];

        if (newStock === undefined || newStock === '' || newStock == 0) {
            alert("발주 수량을 입력해주세요");
            return;
        }
        updateStockOnServer(item.id, newStock, type);
    };

    // 검색 핸들러
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };


    /**
     * 체크박스 이용, 개별 아이템 선택
     * @param {number} itemId - 선택되는 개별 아이템 id
     */
    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => {
            const newSelection = new Set(prev[activeView]);
            if (newSelection.has(itemId)) {
                newSelection.delete(itemId);
            } else {
                newSelection.add(itemId);
            }
            return { ...prev, [activeView]: newSelection };
        });
    };

    /**
     * 현 표기 페이지에서 전체선택
     */
    const handleSelectAll = () => {
        setSelectedItems(prev => {
            const currentSelection = prev[activeView];
            const allItemIds = (activeView === 'products' ? products : ingredients).map(item => item.id);

            const allSelected = currentSelection.size === allItemIds.length;
            const newSelection = allSelected ? new Set() : new Set(allItemIds);

            return { ...prev, [activeView]: newSelection };
        });
    };

    // 대량 주문 기능. updateStockOnServer 반복문 처리
    const handleBulkRestockRequest = async () => {
        const selection = selectedItems[activeView];
        if (selection.size === 0) {
            alert("재입고를 요청할 항목을 선택해주세요.");
            return;
        }

        const sourceData = activeView === 'products' ? products : ingredients;
        const itemsToUpdate = [];

        // 데이터 수집 + Validation (Get name for summary)
        for (const itemId of selection) {
            const newStock = adjustmentValues[itemId];
            const item = sourceData.find(i => i.id === itemId); // Get item for name

            if (newStock === undefined || newStock === '' || newStock == 0) {
                alert(`ID #${itemId} (${item?.name || ''})에 유효한 재고 수량을 입력해주세요`);
                return;
            }
            itemsToUpdate.push({ id: itemId, stock: newStock, name: item?.name || `ID #${itemId}` });
        }

        if (itemsToUpdate.length === 0) {
            alert("수정할 상품을 선택하지 않으셨습니다");
            return;
        }


        const updatePromises = itemsToUpdate.map(item =>
            updateStockOnServer(item.id, item.stock, activeView, false)
                .then(updatedItem => ({ status: 'fulfilled', value: updatedItem }))
                .catch(error => ({ status: 'rejected', reason: error, item: item }))
        );

        const results = await Promise.all(updatePromises);

        const successfulUpdates = [];
        const failedUpdates = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                successfulUpdates.push(result.value);
            } else {
                failedUpdates.push(result.item);
            }
        });

        // --- 메시지 팝업 출력 ---
        let summaryMessage = "재고 변경이 완료되었습니다.\n\n";

        if (successfulUpdates.length > 0) {
            summaryMessage += `✅ 성공 (${successfulUpdates.length}건):\n`;
            summaryMessage += successfulUpdates.map(item => `  - ${item.name} (새 재고: ${item.stock})`).join('\n');
            summaryMessage += "\n\n";
        }

        if (failedUpdates.length > 0) {
            summaryMessage += `❌ 실패 (${failedUpdates.length}건):\n`;
            summaryMessage += failedUpdates.map(item => `  - ${item.name}`).join('\n');
            summaryMessage += "\n\n(실패한 항목은 재고가 변경되지 않았습니다. 서버 콘솔을 확인해주세요.)";
        }

        alert(summaryMessage);

        // 액션 후 선택사항들 초기화
        setSelectedItems(prev => ({ ...prev, [activeView]: new Set() }));
    };

    // 정렬 핸들러
    const handleSort = (key) => {
        const isProducts = activeView === 'products';
        const currentSortConfig = isProducts ? productSortConfig : ingredientSortConfig;

        let direction = 'asc';
        if (currentSortConfig.key === key && currentSortConfig.direction === 'asc') {
            direction = 'desc';
        }

        if (isProducts) {
            setProductSortConfig({ key, direction });
            setProductCurrentPage(0); // Reset to first page
        } else {
            setIngredientSortConfig({ key, direction });
            setIngredientCurrentPage(0); // Reset to first page
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        if (activeView === 'products') {
            setProductCurrentPage(page);
        } else {
            setIngredientCurrentPage(page);
        }
    };


    // === API 호출 ===
    const updateStockOnServer = async (itemId, adjustmentValue, itemType, showAlert = true) => {
        const endpoint = itemType === 'products' ? 'products' : 'ingredients';
        const url = `${API_BASE_URL}/api/admin/${endpoint}/stock/${itemId}`;

        try {
            const response = await axios.patch(url, { adjustment: adjustmentValue }, { withCredentials: true });

            const updatedItem = response.data;
            const newTotalStock = updatedItem.stock;

            if (itemType === 'products') {
                setProducts((prevList) =>
                    prevList.map(p =>
                        p.id === itemId ? { ...p, stock: newTotalStock } : p
                    )
                );
            } else {
                setIngredients((prevList) =>
                    prevList.map(p =>
                        p.id === itemId ? { ...p, stock: newTotalStock } : p
                    )
                );
            }

            setAdjustmentValues(prev => ({ ...prev, [itemId]: '' }));

            if (showAlert) {
                alert(`${itemType} #${itemId} 재고 ${newTotalStock}으로 변경 성공`);
            }

            return updatedItem;

        } catch (err) {
            console.error(`상품 재고 변경 실패`, err);
            if (showAlert) {
                alert(`상품 재고 변경에 실패했습니다. 다시 시도해주세요`);
            }
            throw err;
        }
    };

    // 발주서 생성 버튼 클릭 -> 유효성 검사, 아이템 수집, 모달 띄우기
    const handleGeneratePurchaseOrder = async () => {
        const selection = selectedItems[activeView];
        if (selection.size === 0) {
            alert("발주서를 생성할 항목을 선택해주세요.");
            return;
        }

        const sourceData = activeView === 'products' ? products : ingredients;
        const itemsToOrder = [];

        for (const itemId of selection) {
            const item = sourceData.find(i => i.id === itemId);
            const quantity = adjustmentValues[itemId]; // '발주수량' input 값

            if (!item || quantity === undefined || quantity <= 0) {
                // 수량이 없거나 0 이하인 항목은 스킵
                continue;
            }

            const unitPrice = activeView === 'products' ? 10000 : 1000;

            if (unitPrice === undefined || unitPrice === null) {
                alert(`'${item.name}'의 단가(price) 정보가 없습니다. 백엔드를 확인해주세요. 현재는 프론트에 단가가 하드코딩 되어있습니다.`);
                return;
            }

            itemsToOrder.push({
                name: item.name,
                quantity: Number(quantity), //
                unitPrice: Number(unitPrice)
            });
        }

        if (itemsToOrder.length === 0) {
            alert("발주할 유효한 항목이 없습니다. '발주수량'을 입력했는지 확인해주세요.");
            return;
        }

        // --- 1. API 호출 대신, 상태에 저장하고 모달 실행 ---
        setPoSummaryItems(itemsToOrder); // Set summary data
        setPoRemarks('');                 // Clear previous remarks
        setShowPORemarksModal(true);      // Open the modal
    };


    // 모달에서 '발주서 생성' 확인 버튼 클릭 시 -> API 호출
    const handleConfirmAndGeneratePO = async () => {
        // --- 1. Request DTO 빌드 (모달 상태값 사용) ---
        const today = new Date();
        const poNumber = `PO-${today.toISOString().split('T')[0]}`;
        const orderDate = today.toLocaleDateString('ko-KR');
        const dueDate = new Date(new Date().setDate(today.getDate() + 3)).toLocaleDateString('ko-KR');
        const payDate = new Date(new Date().setDate(today.getDate() + 30)).toLocaleDateString('ko-KR');

        const poRequestData = {
            poNumber: poNumber,
            supplierName: "Pefumare Co.",
            orderDate: orderDate,
            dueDate: dueDate,
            payDate: payDate,
            remarks: poRemarks || "특이사항 없음", // 디폴트 remark
            items: poSummaryItems // 스테이트 사용
        };

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/admin/generate-purchase-order`,
                poRequestData,
                {
                    withCredentials: true,
                    responseType: 'blob'
                }
            );

            // --- 3. 서버에서 받은 파일 저장 ---
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `${poNumber}.xlsx`);

            // --- 4. 모달 닫기 ---
            setShowPORemarksModal(false);
            setPoSummaryItems([]); // 요약 초기화

            if (window.confirm("선택한 항목들을 발주하시겠습니까? (재고가 수정됩니다.)")) {
                await handleBulkRestockRequest();
            }

        } catch (err) {
            console.error("Failed to generate PO:", err);
            alert("발주서 생성에 실패했습니다. (서버 오류)");
            // 실패시 모달 닫지 않고 유지
        }
    };


    // === 정렬 화살표 헬퍼 ===
    const getSortArrow = (key, type) => {
        const sortConfig = type === 'products' ? productSortConfig : ingredientSortConfig;
        if (sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') {
            return <ArrowUp size={16} className={styles.sortIcon} />;
        }
        return <ArrowDown size={16} className={styles.sortIcon} />;
    };

    // 필터링, 검색 로직



    // === 렌더 로직 ===

    const renderTable = (items, type) => {
        const currentSelection = selectedItems[type];
        const allSelected = items.length > 0 && currentSelection.size === items.length;
        const imageBasePath = type === 'products' ? 'products' : 'ingredients'; // 이미지 경로 (완제, 원액) 판별

        return (
            <div>
                <table className={styles.stockTable}>
                    <thead>
                        <tr>
                            <th className={styles.checkboxColumn}>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    aria-label="Select all items"
                                />
                            </th>
                            <th className={styles.imageColumn}>이미지</th>
                            <th onClick={() => handleSort('id')} className={styles.sortableHeader}>
                                ID {getSortArrow('id', type)}
                            </th>
                            <th onClick={() => handleSort('name')} className={styles.sortableHeader}>
                                이름 {getSortArrow('name', type)}
                            </th>
                            <th onClick={() => handleSort('stock')} className={styles.sortableHeader}>
                                현 재고 {getSortArrow('stock', type)}
                            </th>
                            <th>재고 변동</th>
                            <th>기능</th>
                        </tr>
                    </thead>
                    <tbody>

                        {items.length > 0 ? items.map((item) => {
                            const isLowStock = item.stock < 10; // 10개 이하면 강조

                            let imageUrl = '';
                            if (type === 'products') {
                                imageUrl = item.imageUrl
                                    ? `${API_BASE_URL}/uploads/products/${item.imageUrl}`
                                    : `${API_BASE_URL}/uploads/products/placeholder.jpg`;
                            } else { // type === 'ingredients'
                                imageUrl = item.imgUrl
                                    ? `${API_BASE_URL}/uploads/ingredient/${item.imgUrl}`
                                    : `${API_BASE_URL}/uploads/ingredient/placeholder.jpg`; // Using product placeholder as fallback
                            }
                            return (
                                <tr key={item.id} className={isLowStock ? styles.lowStockRow : ''}>
                                    <td className={styles.checkboxColumn}>
                                        <input
                                            type="checkbox"
                                            checked={currentSelection.has(item.id)}
                                            onChange={() => handleSelectItem(item.id)}
                                            aria-label={`Select ${item.name}`}
                                        />
                                    </td>
                                    <td className={styles.imageCell}>
                                        <img
                                            src={imageUrl}
                                            alt={item.name || 'item image'}
                                            className={styles.itemImage}
                                        />
                                    </td>
                                    <td>#{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        <span className={isLowStock ? styles.lowStockText : ''}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className={styles.stockInput}
                                            placeholder="발주수량"
                                            value={adjustmentValues[item.id] || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setAdjustmentValues(prev => ({
                                                    ...prev,
                                                    [item.id]: value === '' ? '' : Number(value)
                                                }));
                                            }}>
                                        </input>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button className={`${styles.actionButton} ${styles.adjustButton}`} onClick={() => handleAdjustClick(item, type)} title="Adjust Stock">
                                                <Edit size={16} /> 재고 수정
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className={styles.noResults}>
                                    {searchTerm ? "검색 결과가 없습니다." : "데이터가 없습니다."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    {/**페이징 렌더링 */ }
    const renderPagination = () => {
        const isProducts = activeView === 'products';
        const currentPage = isProducts ? productCurrentPage : ingredientCurrentPage;
        const totalPages = isProducts ? productTotalPages : ingredientTotalPages;
        return (
            <div className={styles.paginationContainer}>
                <Pagination>
                    <Pagination.Prev
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
                        disabled={currentPage === 0}
                    />
                    <Pagination.Item active>{currentPage + 1}</Pagination.Item>
                    <Pagination.Next
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1}
                    />
                </Pagination>
            </div>
        );
    }

    if (isLoading && products.length === 0 && ingredients.length === 0) {
        return <div className={styles.loading}>재고 로딩중...</div>;
    }

    if (error) {
        return <div className={styles.error}>에러: {error}</div>;
    }

    const currentSelectionCount = selectedItems[activeView].size;

    return (
        <div className={styles.stockManagementPage}>

            <div className={styles.header}>
                <div className={styles.viewToggle}>
                    <button
                        className={activeView === 'products' ? styles.active : ''}
                        onClick={() => setActiveView('products')}
                    >
                        <Package size={16} /> 완제품
                    </button>
                    <button
                        className={activeView === 'ingredients' ? styles.active : ''}
                        onClick={() => setActiveView('ingredients')}
                    >
                        <Beaker size={16} /> 원액
                    </button>
                </div>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="ID, Name으로 검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className={styles.bulkActions}>
                <button
                    className={styles.bulkRequestButton}
                    onClick={handleBulkRestockRequest}
                    disabled={currentSelectionCount === 0}
                >
                    <PlusCircle size={16} /> 선택 상품 발주 ({currentSelectionCount})
                </button>
                <button
                    className={styles.generatePOButton} // 새 버튼 (CSS 클래스 추가 필요)
                    onClick={handleGeneratePurchaseOrder}
                    disabled={currentSelectionCount === 0}
                >
                    <FileText size={16} /> 발주서 생성 ({currentSelectionCount})
                </button>
            </div>

            <div className={styles.tableContainer}>
                {activeView === 'products'
                    ? renderTable(products, 'products')
                    : renderTable(ingredients, 'ingredients')}
            </div>
            {renderPagination()}


            {/* ======== 발주서 버튼 클릭시 보이는 모달 ========= */}
            <Modal show={showPORemarksModal} onHide={() => setShowPORemarksModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>발주서 생성 확인</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>발주 요약</h5>
                    <table className={styles.summaryTable}>
                        <thead>
                            <tr>
                                <th>품명</th>
                                <th>수량</th>
                                <th>단가</th>
                                <th>합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {poSummaryItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unitPrice.toLocaleString('ko-KR')}원</td>
                                    <td>{(item.quantity * item.unitPrice).toLocaleString('ko-KR')}원</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className={styles.summaryTotal}>
                                <td colSpan="3">총 합계 (VAT 별도)</td>
                                <td>
                                    {poSummaryItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toLocaleString('ko-KR')}원
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <Form.Group controlId="poRemarksTextarea" className="mt-4">
                        <Form.Label><strong>비고란 (Remarks)</strong></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={poRemarks}
                            onChange={(e) => setPoRemarks(e.target.value)}
                            placeholder="발주서에 포함될 특이사항을 입력하세요 (예: 긴급 배송 요청)"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPORemarksModal(false)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleConfirmAndGeneratePO}>
                        <FileText size={16} /> 발주서 생성 및 다운로드
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default StockManagement;


