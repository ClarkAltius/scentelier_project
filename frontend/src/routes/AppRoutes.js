import { Route, Routes } from "react-router-dom";
import Admin from "../pages/Admin.js";
import Home from "../pages/Home.js";
import ProductList from "../pages/ProductList.js";
import ProductDetail from "../pages/ProductDetail.js";
import PerfumeTest from "../pages/PerfumeTest.js";
import PerfumeBlending from "../pages/PerfumeBlending.js";
import Payments from "../pages/Payments.js";
import Login from "../pages/Login.js";
import CartList from "../pages/CartList.js";
import OrderList from "../pages/OrderList.js";

function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/productlist' element={<ProductList />} />
            <Route path='/productdetail' element={<ProductDetail />} />
            <Route path='/perfumetest' element={<PerfumeTest />} />
            <Route path='/perfumeblending' element={<PerfumeBlending />} />
            <Route path='/payments' element={<Payments />} />
            <Route path='/login' element={<Login />} />
            <Route path='/cart/list' element={<CartList />} />
            <Route path='/order/list' element={<OrderList />} />
        </Routes>
    );


}

export default AppRoutes;