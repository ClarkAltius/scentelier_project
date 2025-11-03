import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StockManagement.module.css';
import { Package, Beaker, Edit, Save, X, PlusCircle, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config/config';

import * as XLSX from 'xlsx';
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


    // === 훅 ===
    useEffect(() => {
        setIsLoading(true); // 로딩창 활성화
        setError(null); // 에러 초기화
        // 데이터 fetch
        setTimeout(async () => {
            try {
                // productController vs. AdminController ? = AdminController 에서 하자. 
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

        const newStock = adjustmentValues[item.id];

        if (newStock === undefined || newStock === '' || newStock == 0) {
            alert("발주 수량을 입력해주세요");
            return;
        }
        updateStockOnServer(item.id, newStock, type);
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

        const itemsToUpdate = [];

        // 데이터 수집 + Validation
        for (const itemId of selection) {
            const newStock = adjustmentValues[itemId];
            if (newStock === undefined || newStock === '' || newStock == 0) {
                alert(`ID #${itemId}에 유효한 재고 수량을 입력해주세요`);
                return; // validation 실패시 정지
            }
            itemsToUpdate.push({ id: itemId, stock: newStock });
        }
        if (itemsToUpdate.length === 0) {
            alert("수정할 상품을 선택하지 않으셨습니다");
            return;
        }

        // 각 상품별로 API 호출
        for (const item of itemsToUpdate) {
            await updateStockOnServer(item.id, item.stock, activeView);
        }

        alert("선택 상품 재고수량 변경 성공");

        // // 액션 후 선택사항들 초기화
        setSelectedItems(prev => ({ ...prev, [activeView]: new Set() }));
    };


    // === API 호출 ===
    const updateStockOnServer = async (itemId, adjustmentValue, itemType) => {
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
            alert(`${itemType} #${itemId} 재고 ${newTotalStock}으로 변경 성공`);
        } catch (err) {
            console.error(`상품 재고 변경 실패`, err);
            alert(`상품 재고 변경에 실패했습니다. 다시 시도해주세요`);
        }
    };

    // 발주서 생성, 다운로드 로직
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
                // 수량이 없거나 0 이하인 항목은 건너뜁니다.
                continue;
            }

            // 품목 별 가격은 통일. 개별 단가로 책정하고자 하면 엔티티 수정까지 필요. 
            const unitPrice = activeView === 'products' ? 10000 : 1000;

            if (unitPrice === undefined || unitPrice === null) {
                alert(`'${item.name}'의 단가(price) 정보가 없습니다. 백엔드를 확인해주세요.`);
                return;
            }

            itemsToOrder.push({
                name: item.name,
                quantity: quantity,
                unitPrice: unitPrice
            });
        }

        if (itemsToOrder.length === 0) {
            alert("발주할 유효한 항목이 없습니다. '발주수량'을 입력했는지 확인해주세요.");
            return;
        }

        // --- 1. Request DTO 빌드 ---
        const today = new Date();
        const poNumber = `PO-${today.toISOString().split('T')[0]}`;
        const orderDate = today.toLocaleDateString('ko-KR');
        // 임시. 입고일은 주문 3일 후
        const dueDate = new Date(today.setDate(today.getDate() + 3)).toLocaleDateString('ko-KR');
        // 임시. 지급일은 주문 30일 후
        const payDate = new Date(today.setDate(today.getDate() + 27)).toLocaleDateString('ko-KR'); // (3 + 27 = 30)

        const poRequestData = {
            poNumber: poNumber,
            supplierName: "Pefumare Co.",
            orderDate: orderDate,
            dueDate: dueDate,
            payDate: payDate,
            remarks: "비고란 코멘트", // 텍스트 입력창 도입 필요 (TODO)
            items: itemsToOrder
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

            // --- 3. Save the file from the server ---
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `${poNumber}.xlsx`);

        } catch (err) {
            console.error("Failed to generate PO:", err);
            alert("발주서 생성에 실패했습니다. (서버 오류)");
        }
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
                        <th>현 재고</th>
                        <th>재고 변동</th>
                        <th>기능</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const isLowStock = item.stock < 10; // 10개 이하면 강조

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
                <button
                    className={styles.generatePOButton} // 새 버튼 (CSS 클래스 추가 필요)
                    onClick={handleGeneratePurchaseOrder}
                    disabled={currentSelectionCount === 0}
                >
                    <FileText size={16} /> 발주서 생성 ({currentSelectionCount})
                </button>
            </div>

            <div className={styles.tableContainer}>
                {activeView === 'products' ? renderTable(products, 'products') : renderTable(ingredients, 'ingredients')}
            </div>
        </div>
    );
}

export default StockManagement;


