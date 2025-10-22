import React, { useState, useEffect } from 'react';
import styles from './StockManagement.module.css';
import { Package, Beaker, Edit, Save, X, PlusCircle } from 'lucide-react';

/**
 * StockManagement Component
 *
 * This component provides an interface for administrators to manage inventory levels
 * for both finished products and raw ingredients for custom perfumes.
 *
 * It features a tabbed view, inline stock editing, and bulk restock request functionality.
 * As the backend is not yet implemented, it uses mock data and placeholder functions.
 */
function StockManagement() {
    // === STATE VARIABLES ===

    // Determines the current view: 'products' or 'ingredients'
    const [activeView, setActiveView] = useState('products');

    // Holds the lists of finished products and raw ingredients.
    const [products, setProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    // State to manage which item is currently being edited inline.
    const [editingItem, setEditingItem] = useState(null);

    // State to track selected items for bulk actions.
    const [selectedItems, setSelectedItems] = useState({ products: new Set(), ingredients: new Set() });

    // Loading and error states for data fetching.
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    // === MOCK DATA ===
    const mockProductsStock = [
        { id: 1, name: "Scent of the Void", stock: 50 },
        { id: 2, name: "Ethereal Bloom", stock: 75 },
        { id: 3, name: "Citrus Solstice", stock: 120 },
        { id: 4, name: "Midnight Blossom", stock: 8 }, // Low stock example
        { id: 5, name: "Woodland Whisper", stock: 25 },
    ];

    const mockIngredientsStock = [
        { id: 101, name: "Rose Absolute", stock: 500 }, // Assuming stock in ml or grams
        { id: 102, name: "Bergamot Oil", stock: 1200 },
        { id: 103, name: "Sandalwood Essence", stock: 350 },
        { id: 104, name: "Jasmine Sambac", stock: 45 }, // Low stock example
        { id: 105, name: "Vetiver", stock: 800 },
        { id: 106, name: "Musk Accord", stock: 1500 },
    ];


    // === LIFECYCLE HOOKS ===
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // Simulate fetching data
        setTimeout(() => {
            try {
                // TODO: Replace with actual API calls
                // const productResponse = await axios.get('/api/admin/products/stock');
                // setProducts(productResponse.data);
                // const ingredientResponse = await axios.get('/api/admin/ingredients/stock');
                // setIngredients(ingredientResponse.data);
                setProducts(mockProductsStock);
                setIngredients(mockIngredientsStock);
            } catch (err) {
                console.error("Failed to fetch stock data:", err);
                setError("재고 정보를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        }, 500);
    }, []);


    // === EVENT HANDLERS & LOGIC ===

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
     * Placeholder for saving the updated stock value.
     * TODO: Implement API call to update stock.
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
     * Handles single item selection via checkbox.
     * @param {number} itemId - The ID of the item being selected/deselected.
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
     * Handles the "select all" checkbox functionality for the current view.
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
     * Placeholder for initiating a bulk restock request for selected items.
     * TODO: This would open a modal to confirm quantities and create a `RestockRequest`.
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

        // Clear selection after the action
        setSelectedItems(prev => ({ ...prev, [activeView]: new Set() }));
    };


    // === RENDER LOGIC ===

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
                        <th>Name</th>
                        <th>Current Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const isEditing = editingItem && editingItem.id === item.id && editingItem.type === type;
                        const isLowStock = item.stock < 50; // Example threshold for low stock

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
                                                    <Save size={16} /> Save
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={handleCancelClick} title="Cancel">
                                                    <X size={16} /> Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button className={`${styles.actionButton} ${styles.adjustButton}`} onClick={() => handleAdjustClick(item, type)} title="Adjust Stock">
                                                <Edit size={16} /> Adjust
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
        return <div className={styles.loading}>Loading stock information...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    const currentSelectionCount = selectedItems[activeView].size;

    return (
        <div className={styles.stockManagementPage}>
            <div className={styles.header}>
                <h1>Stock Management</h1>
                <div className={styles.viewToggle}>
                    <button
                        className={activeView === 'products' ? styles.active : ''}
                        onClick={() => setActiveView('products')}
                    >
                        <Package size={16} /> Finished Products
                    </button>
                    <button
                        className={activeView === 'ingredients' ? styles.active : ''}
                        onClick={() => setActiveView('ingredients')}
                    >
                        <Beaker size={16} /> Raw Ingredients
                    </button>
                </div>
            </div>

            <div className={styles.bulkActions}>
                <button
                    className={styles.bulkRequestButton}
                    onClick={handleBulkRestockRequest}
                    disabled={currentSelectionCount === 0}
                >
                    <PlusCircle size={16} /> Request Restock for Selected ({currentSelectionCount})
                </button>
            </div>

            <div className={styles.tableContainer}>
                {activeView === 'products' ? renderTable(products, 'products') : renderTable(ingredients, 'ingredients')}
            </div>
        </div>
    );
}

export default StockManagement;


