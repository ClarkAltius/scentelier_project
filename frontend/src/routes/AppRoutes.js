import { Route, Routes } from "react-router-dom";
import Admin from "../pages/Admin.js";
import Home from "../pages/Home.js";
import Payments from "../pages/Payments.js";
import Login from "../pages/Login.js";
import Cart from "../pages/Cart.js";

function AppRoutes() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/payments' element={<Payments />} />
            <Route path='/login' element={<Login />} />
            <Route path='/cart' element={<Cart />} />
        </Routes>
    );


}

export default AppRoutes;