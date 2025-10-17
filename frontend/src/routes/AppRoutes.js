import { Route, Routes } from "react-router-dom";
import Admin from "../pages/Admin.js";
import Home from "../pages/Home.js";
import ProductList from "../pages/ProductList.js";
import ProductDetail from "../pages/ProductDetail.js";
import PerfumeTest from "../pages/PerfumeTest.js";
import PerfumeBlending from "../pages/PerfumeBlending.js";

function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/productlist' element={<ProductList />} />
            <Route path='/productdetail' element={<ProductDetail />} />
            <Route path='/perfumetest' element={<PerfumeTest />} />
            <Route path='/perfumeblending' element={<PerfumeBlending />} />
        </Routes>
    );


}

export default AppRoutes;