import { useState } from 'react';
import styles from './ProductManagement.module.css';
import { Plus, Edit, Trash2 } from 'lucide-react'; // Using lucide-icons

// 1. Import your mock data.
// Create a file in '/src/data/mockProducts.json' with this content.
import mockProductData from '../data/mockProducts.json';

function ProductManagement() {
    // 2. Store the product list in state
    const [products, setProducts] = useState(mockProductData);

    // 3. Placeholder functions for CUD operations
    const handleAddNew = () => {
        console.log("TODO: Open 'Add New Product' modal");
    };

    const handleEdit = (productId) => {
        console.log(`TODO: Open 'Edit' modal for product ${productId}`);
    };

    const handleDelete = (productId) => {
        console.log(`TODO: Open 'Delete' confirmation for product ${productId}`);
        // Example of how you'd update state (once confirmed):
        // setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    };

    return (
        <div className={styles.productPage}>
            {/* 4. Page Header */}
            <div className={styles.header}>
                <h1>Product Management</h1>
                <button className={styles.addButton} onClick={handleAddNew}>
                    <Plus size={20} />
                    Add New Product
                </button>
            </div>

            {/* 5. Product Table */}
            <div className={styles.tableContainer}>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={`${styles.actionButton} ${styles.editButton}`}
                                            onClick={() => handleEdit(product.id)}
                                        >
                                            <Edit size={16} /> Edit
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductManagement;