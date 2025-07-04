import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './components/pages/Home/HomePage';
import AdminLayout from './components/common/Layout/admin_layout/AdminLayout';
import StaffLayout from './components/common/Layout/staff_layout/StaffLayout';

import FoodList from './components/features/admin/food/FoodList';
import FoodForm from './components/features/admin/food/FoodForm';

import TableList from './components/features/admin/table/TableList';
import TableForm from './components/features/admin/table/TableForm';

import OrderList from './components/features/admin/order/OrderList';
import OrderForm from './components/features/admin/order/OrderForm';

import Dashboard from './components/features/admin/dashboard/Dashboard';
import Login from './components/features/admin/auth/login_admin/Login';
import LoginCustomer from './components/features/admin/auth/login_customer/login_customer';
import PrivateRoute from './components/common/Protected/PrivateRoute';
import { StaffRoute } from './components/common/Protected/PrivateRoute';
import Register from './components/features/admin/user/user_add/Register';
import UserList from './components/features/admin/user/user_list/User';
import EditUser from './components/features/admin/user/user_edit/EditUser';
import ForgotPassword from './components/common/UI/forgot_password/ForgotPassword';
import SignUp from './components/features/admin/auth/signup/SignUp';
import Monkey404 from './components/pages/Admin/404';
import AttendanceManagement from './components/features/admin/attendance/AttendanceManagement';
import AttendanceQR from './components/features/admin/attendance/qr/AttendanceQR';
import AttendanceScan from './components/features/admin/attendance/qr/AttendanceScan';
import AttendanceReport from './components/features/admin/attendance/reports/AttendanceReport';
import DetailUser from './components/features/admin/user/user_list/Detail_user';
import Loading from './components/features/admin/load/Loading';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/admin" element={<Login />} />
        <Route path="/login/customer" element={<LoginCustomer />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot_password" element={<ForgotPassword />} />

        <Route path="/admin" element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />

            <Route path="foods" element={<FoodList />} />
            <Route path="foods/create" element={<FoodForm />} />
            <Route path="foods/edit/:id" element={<FoodForm />} />

            <Route path="tables" element={<TableList />} />
            <Route path="tables/create" element={<TableForm />} />
            <Route path="tables/edit/:id" element={<TableForm />} />

            <Route path="orders" element={<OrderList />} />
            <Route path="orders/create" element={<OrderForm />} />
            <Route path="orders/edit/:id" element={<OrderForm />} />

            <Route path="users" element={<UserList />} />
            <Route path="register" element={<Register />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="users/details/:id" element={<DetailUser />} />

            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="attendance/qr" element={<AttendanceQR />} />
            <Route path="attendance/scan" element={<AttendanceScan />} />
            <Route path="attendance/reports" element={<AttendanceReport />} />
          </Route>
        </Route>
        
        {/* Staff Routes */}
        <Route path="/staff" element={<StaffRoute />}>
          <Route element={<StaffLayout />}>
            <Route index element={<Dashboard />} />
            
            <Route path="foods" element={<FoodList />} />
            <Route path="tables" element={<TableList />} />
            <Route path="orders" element={<OrderList />} />
          </Route>
        </Route>

        <Route path="/loading" element={<Loading />} />
        <Route path="*" element={<Monkey404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
