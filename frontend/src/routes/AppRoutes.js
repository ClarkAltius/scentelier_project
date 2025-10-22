import { Route, Routes } from "react-router-dom";
import Admin from "../pages/Admin.js";
import Home from "../pages/Home.js";
import ProductList from "../pages/ProductList.js";
import ProductDetail from "../pages/ProductDetail.js";
import PerfumeFinder from "../pages/PerfumeFinder.js";
import PerfumeBlending from "../pages/PerfumeBlending.js";
import Payments from "../pages/Payments.js";
import Login from "../pages/Login.js";
import CartList from "../pages/CartList.js";
import OrderList from "../pages/OrderList.js";
import AdminRoute from "./AdminRoute.js";
import Logout from "../pages/Logout.js";
import ProductInsertForm from "../pages/ProductInsertForm.js";
import Inquiry from "../pages/Inquiry.js";
import MyPage from "../pages/MyPage.js";
import Findpass from "../pages/Findpass.js";

import Dashboard from '../component/Dashboard';
import ProductManagement from '../component/ProductManagement';
import StockManagement from '../component/StockManagement';
import OrderManagement from '../component/OrderManagement';
import InquiryManagement from '../component/InquiryManagement';

function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/product/list' element={<ProductList />} />
            <Route path='/product/detail' element={<ProductDetail />} />
            <Route path='/perfume/finder' element={<PerfumeFinder />} />
            <Route path='/perfume/blending' element={<PerfumeBlending />} />
            <Route path='/payments' element={<Payments />} />
            <Route path='/login' element={<Login />} />
            <Route path='/cart/list' element={<CartList />} />
            <Route path='/order/list' element={<OrderList />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/inquiry' element={<Inquiry />} />
            <Route path='/mypage' element={<MyPage />} />
            <Route path='/findpass' element={<Findpass />} />

            {/**관리자 전용 경로 */}
            <Route
                path='/admin'
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                }
            >
            </Route>
            {/**상품 입력 페이지 접근 제한 */}
            <Route
                path='/product/insert'
                element={
                    <AdminRoute>
                        <ProductInsertForm />
                    </AdminRoute>
                }
            >
            </Route>
        </Routes >
    );


}

export default AppRoutes;