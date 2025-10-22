import { useState } from 'react';
import styles from './ProductManagement.module.css';
import { Plus, Edit, Trash2 } from 'lucide-react';

// 1. Import your mock data.
// Create a file in '/src/data/mockProducts.json' with this content.
import mockProductData from '../data/mockProducts.json';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductManagement() {
    const [products, setProducts] = useState(mockProductData);

    const navigate = useNavigate();

    // 3. Placeholder functions for CUD operations
    const handleAddNew = () => {
        navigate('/product/insert');
    };

    const handleEdit = (productId) => {
        console.log(`TODO: Open 'Edit' modal for product ${productId}`);
    
        try{
            axios.delete(`api/products/${productId}`);

            setProducts((prevProducts)=>
            prevProducts.filter((p)=>p.id !== productId)
            );
            alert('상품이 삭제되었습니다.');
        }catch(error){
            console.error('삭제 중 오류 :', error);
            alert('상품 삭제 중 오류가 발생하였습니다.');
        }
    };

    const handleDelete = (productId) => {
        if (window.confirm('정말 삭제하시겠습니까?')){
            setProducts((prevProducts)=>prevProducts.filter((p)=>p.id!==productId));
        console.log(`TODO: Open 'Delete' confirmation for product ${productId}`);
        // Example of how you'd update state (once confirmed):
        // setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        }
    };

    return (
        <div className={styles.productPage}>
            {/* 4. Page Header */}
            <div className={styles.header}>
                <button className={styles.addButton} onClick={handleAddNew}>
                    <Plus size={20} />
                    신규 상품 추가
                </button>
            </div>

            {/* 5. Product Table */}
            <div className={styles.tableContainer}>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th>상품명</th>
                            <th>카테고리</th>
                            <th>가격</th>
                            <th>재고</th>
                            <th>변경</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.price.toFixed(2)}</td>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductManagement;