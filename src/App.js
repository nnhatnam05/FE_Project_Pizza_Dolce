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
import AttendanceScan from './components/features/admin/attendance/qr/AttendanceScan';
import AttendanceReport from './components/features/admin/attendance/reports/AttendanceReport';
import DetailUser from './components/features/admin/user/user_list/Detail_user';
import Loading from './components/features/admin/load/Loading';
import FormRequest from "./components/features/staff/request/Form_Request";
import HistoryRequest from "./components/features/staff/request/History_Request";
import RequestManagement from "./components/features/staff/request/Request_Management";
import RequestList from "./components/features/admin/request/Request_List";
import RequestManagementAdmin from "./components/features/admin/request/Request_Management";
import RequestPendingConfirmation from "./components/features/admin/request/Request_Pending_Confirmation";
import Main from "./components/pages/Home/Main";
import List_Pizza from "./components/pages/Home/Menu/Pizza/List_Pizza";
import List_Appetizers from "./components/pages/Home/Menu/Apperizers/List_Appetizers";
import List_Salads from "./components/pages/Home/Menu/Salads/List_Salads";
import List_Drinks from "./components/pages/Home/Menu/Drinks/List_Drinks";
import List_Pasta from "./components/pages/Home/Menu/Pasta-Main/List_Pasta-Main";
import List_Other from "./components/pages/Home/Menu/Other/List_Other";
import Detail_Pizza from "./components/pages/Home/Menu/Pizza/Detail_Pizza";
import Detail_Appetizers from "./components/pages/Home/Menu/Apperizers/Detail_Appetizers";
import Detail_Salad from "./components/pages/Home/Menu/Salads/Detail_Salad";
import Detail_Drinks from "./components/pages/Home/Menu/Drinks/Detail_Drinks";
import Detail_Pasta from "./components/pages/Home/Menu/Pasta-Main/Detail_Pasta-Main";
import Detail_Other from "./components/pages/Home/Menu/Other/Detail_Other";
import List_Payment from "./components/features/admin/payment/List_Payment";
import Form_Payment from "./components/features/admin/payment/Form_Payment";
import OrderManagement from "./components/features/admin/order/Order_Management";
import OrderWaitingConfirmation from "./components/features/admin/order/Order_WaitingConfirm";
import OrderDeliveryStatus from "./components/features/admin/order/Order_DeliveryStatus";
import Delivery_Status from "./components/features/staff/delivery-status/Delivery_Status";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main customer page */}
        <Route path="/" element={<Main />} />
        <Route path="/pizza" element={<List_Pizza />} />
        <Route path="/pizza/:id" element={<Detail_Pizza />} />
        <Route path="/appetizers" element={<List_Appetizers />} />
        <Route path="/appetizers/:id" element={<Detail_Appetizers />} />
        <Route path="/salads" element={<List_Salads />} />
        <Route path="/salads/:id" element={<Detail_Salad />} />
        <Route path="/drinks" element={<List_Drinks />} />
        <Route path="/drinks/:id" element={<Detail_Drinks />} />
        <Route path="/pasta" element={<List_Pasta />} />
        <Route path="/pasta/:id" element={<Detail_Pasta />} />
        <Route path="/other" element={<List_Other />} />
        <Route path="/other/:id" element={<Detail_Other />} />

        {/* <Route path="/main" element={<HomePage />} /> */}
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

            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/waiting" element={<OrderWaitingConfirmation />} />
            <Route path="orders/delivery" element={<OrderDeliveryStatus />} />
            <Route path="orders/completed" element={<OrderList />} />
            <Route path="orders/create" element={<OrderForm />} />
            <Route path="orders/edit/:id" element={<OrderForm />} />

            <Route path="payment-methods" element={<List_Payment />} />
            <Route path="payment-methods/create" element={<Form_Payment />} />
            <Route path="payment-methods/edit/:id" element={<Form_Payment />} />

            <Route path="users" element={<UserList />} />
            <Route path="register" element={<Register />} />
            <Route path="users/edit/:id" element={<EditUser />} />
            <Route path="users/details/:id" element={<DetailUser />} />

            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="attendance/scan" element={<AttendanceScan />} />
            <Route path="attendance/reports" element={<AttendanceReport />} />

            <Route path="request" element={<RequestManagementAdmin />} />
            <Route path="request/pending" element={<RequestPendingConfirmation />} />
            <Route path="request/list" element={<RequestList />} />
          </Route>
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<StaffRoute />}>
          <Route element={<StaffLayout />}>
            <Route index element={<Dashboard />} />

            <Route path="foods" element={<FoodList />} />
            <Route path="tables" element={<TableList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="delivery-status" element={<Delivery_Status />} />

            <Route path="request" element={<RequestManagement />} />
            <Route path="request/form" element={<FormRequest />} />
            <Route path="request/history" element={<HistoryRequest />} />
          </Route>
        </Route>

        <Route path="/loading" element={<Loading />} />
        <Route path="*" element={<Monkey404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
