import { Route, Routes } from "react-router-dom";
import Admin from "../pages/Admin.js";
import Home from "../pages/Home.js";
<<<<<<< HEAD
import ProductList from "../pages/ProductList.js";
import ProductDetail from "../pages/ProductDetail.js";
import PerfumeTest from "../pages/PerfumeTest.js";
import PerfumeBlending from "../pages/PerfumeBlending.js";
=======
import Payments from "../pages/Payments.js";
import Login from "../pages/Login.js";
>>>>>>> 87be8c1fc7d9164b1e63bd99cecf89eaef17a79b

function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/admin' element={<Admin />} />
<<<<<<< HEAD
            <Route path='/productlist' element={<ProductList />} />
            <Route path='/productdetail' element={<ProductDetail />} />
            <Route path='/perfumetest' element={<PerfumeTest />} />
            <Route path='/perfumeblending' element={<PerfumeBlending />} />
=======
            <Route path='/payments' element={<Payments />} />
            <Route path='/login' element={<Login />} />
>>>>>>> 87be8c1fc7d9164b1e63bd99cecf89eaef17a79b
        </Routes>
    );


}

export default AppRoutes;