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
import MyInquiry from "../pages/MyInquiry.js";
import InquiryDetail from "../pages/InquiryDetail.js";
import MyPage from "../pages/MyPage.js";
import Findpass from "../pages/Findpass.js";
import PrivateRoute from './PrivateRoute.js';
import ReviewWriteForm from '../pages/ReviewWriteForm.js'
import MyReviewListPage from '../pages/MyReviewListPage.js'
import ReviewBoardPage from '../pages/ReviewBoardPage.js'
import SignUp from '../pages/Signup.js'
import Myperfume from '../pages/Myperfume.js'

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
            <Route path='/product/detail/:id' element={<ProductDetail />} />
            <Route path='/perfume/finder' element={<PerfumeFinder />} />
            <Route path='/login' element={<Login />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/inquiry' element={<Inquiry />} />
            <Route path='/mypage' element={<MyPage />} />
            <Route path='/mypage/review' element={<MyReviewListPage />} />
            <Route path='/findpass' element={<Findpass />} />
            <Route path='/myinquiry' element={<MyInquiry />} />
            <Route path='/inquirydetail' element={<InquiryDetail />} />
            <Route path='/inquiry/:id' element={<InquiryDetail />} />
            <Route path='/reviews/list' element={<ReviewBoardPage />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/myperfume' element={<Myperfume />} />

            {/**로그인 사용자 전용 */}

            <Route
                path='/perfume/blending' element={
                    <PrivateRoute>
                        <PerfumeBlending />
                    </PrivateRoute>} />

            <Route
                path="/cart/list"
                element={
                    <PrivateRoute>
                        <CartList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/payments"
                element={
                    <PrivateRoute>
                        <Payments />
                    </PrivateRoute>
                }
            />
            <Route
                path="/order/list"
                element={
                    <PrivateRoute>
                        <OrderList />
                    </PrivateRoute>
                }
            />
            <Route
                path="/reviews/write"
                element={
                    <PrivateRoute>
                        <ReviewWriteForm />
                    </PrivateRoute>
                }
            />
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