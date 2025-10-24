import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StockManagement.module.css';
import { Package, Beaker, Edit, Save, X, PlusCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/config';

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

    // State to manage which item is currently being edited inline.
    const [editingItem, setEditingItem] = useState(null);

    // State to track selected items for bulk actions.
    const [selectedItems, setSelectedItems] = useState({ products: new Set(), ingredients: new Set() });

    // Loading and error states for data fetching.
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);



    // === 훅 ===
    useEffect(() => {
        setIsLoading(true); // 로딩창 활성화
        setError(null); // 에러 초기화
        // 데이터 fetch
        setTimeout(async () => {
            try {
                // productController vs. AdminController ?
                const productResponse = await axios.get(`${API_BASE_URL}/api/admin/products/stock`, { withCredentials: true });

                if (Array.isArray(productResponse.data)) {
                    setProducts(productResponse.data);
                } else {
                    console.error("Product data is not an array:", productResponse.data);
                    setError("Failed to load product data (invalid format).");
                }

                const ingredientResponse = await axios.get(`${API_BASE_URL}/api/admin/ingredients/stock`, { withCredentials: true });
                if (Array.isArray(ingredientResponse.data)) {
                    setIngredients(ingredientResponse.data);
                } else {
                    console.error("Ingredient data is not an array:", ingredientResponse.data);
                    setError("Failed to load ingredient data (invalid format).");
                }
            } catch (err) {
                console.error("Failed to fetch stock data:", err);
                setError("재고 정보를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        }, 500);
    }, []);


    // === 이벤트 핸들러 ===

    const handleAdjustClick = (item, type) => {
        setEditingItem({ id: item.id, type, stock: item.stock });
    };

    const handleStockChange = (e) => {
        const value = Math.max(0, parseInt(e.target.value, 10) || 0);
        setEditingItem(prev => ({ ...prev, stock: value }));
    };

    const handleCancelClick = () => {
        setEditingItem(null);
    };

    /**
     * 발주서 제작 페이지
     * TODO: 재고 수정 API 요청 추가
     * TODO: 발주서 제작
     */
    const handleSaveClick = () => {
        if (!editingItem) return;
        console.log(`TODO: API call to update ${editingItem.type} #${editingItem.id} to stock ${editingItem.stock}`);
        alert(`[Placeholder] ${editingItem.type} #${editingItem.id}의 재고를 ${editingItem.stock}(으)로 업데이트합니다.`);

        if (editingItem.type === 'product') {
            setProducts(products.map(p => p.id === editingItem.id ? { ...p, stock: editingItem.stock } : p));
        } else {
            setIngredients(ingredients.map(i => i.id === editingItem.id ? { ...i, stock: editingItem.stock } : i));
        }
        setEditingItem(null);
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

    /**
     * 대량주문 플레이스홀더
     * TODO: 모달로 작성. 재고 요청 데이터를 만들어야하나?.
     */
    const handleBulkRestockRequest = () => {
        const selection = selectedItems[activeView];
        if (selection.size === 0) {
            alert("재입고를 요청할 항목을 선택해주세요.");
            return;
        }

        const itemsToRequest = (activeView === 'products' ? products : ingredients)
            .filter(item => selection.has(item.id))
            .map(item => `- ${item.name} (ID: #${item.id})`)
            .join('\n');

        console.log(`TODO: Open bulk restock request modal for:\n${itemsToRequest}`);
        alert(`[Placeholder] 다음 항목에 대한 재입고 요청이 생성됩니다:\n${itemsToRequest}`);

        // 액션 후 선택사항들 초기화
        setSelectedItems(prev => ({ ...prev, [activeView]: new Set() }));
    };


    // === 렌더 로직 ===

    const renderTable = (items, type) => {
        const currentSelection = selectedItems[type];
        const allSelected = items.length > 0 && currentSelection.size === items.length;

        return (
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
                        <th>ID</th>
                        <th>이름</th>
                        <th>재고</th>
                        <th>기능</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const isEditing = editingItem && editingItem.id === item.id && editingItem.type === type;
                        const isLowStock = item.stock < 10; // 10개 이하면 강조

                        return (
                            <tr key={item.id} className={isLowStock && !isEditing ? styles.lowStockRow : ''}>
                                <td className={styles.checkboxColumn}>
                                    <input
                                        type="checkbox"
                                        checked={currentSelection.has(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                        aria-label={`Select ${item.name}`}
                                    />
                                </td>
                                <td>#{item.id}</td>
                                <td>{item.name}</td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className={styles.stockInput}
                                            value={editingItem.stock}
                                            onChange={handleStockChange}
                                            autoFocus
                                        />
                                    ) : (
                                        <span className={isLowStock ? styles.lowStockText : ''}>
                                            {item.stock}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        {isEditing ? (
                                            <>
                                                <button className={`${styles.actionButton} ${styles.saveButton}`} onClick={handleSaveClick} title="Save">
                                                    <Save size={16} /> 저장
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={handleCancelClick} title="Cancel">
                                                    <X size={16} /> 취소
                                                </button>
                                            </>
                                        ) : (
                                            <button className={`${styles.actionButton} ${styles.adjustButton}`} onClick={() => handleAdjustClick(item, type)} title="Adjust Stock">
                                                <Edit size={16} /> 수정
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    if (isLoading) {
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
            </div>

            <div className={styles.bulkActions}>
                <button
                    className={styles.bulkRequestButton}
                    onClick={handleBulkRestockRequest}
                    disabled={currentSelectionCount === 0}
                >
                    <PlusCircle size={16} /> 선택 상품 발주 ({currentSelectionCount})
                </button>
            </div>

            <div className={styles.tableContainer}>
                {activeView === 'products' ? renderTable(products, 'products') : renderTable(ingredients, 'ingredients')}
            </div>
        </div>
    );
}

export default StockManagement;


