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

            {/**관리자 전용 경로 */}
            <Route
                path='/admin'
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                }
            />
        </Routes>
    );


}

export default AppRoutes;