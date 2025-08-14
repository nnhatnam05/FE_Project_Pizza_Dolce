import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';

import HomePage from './components/pages/Home/HomePage';
import AdminLayout from './components/common/Layout/admin_layout/AdminLayout';
import StaffLayout from './components/common/Layout/staff_layout/StaffLayout';
import CustomerLayout from './components/common/Layout/customer_layout';

import FoodList from './components/features/admin/food/FoodList';
import FoodForm from './components/features/admin/food/FoodForm';

import TableList from './components/features/admin/table/TableList';
import TableForm from './components/features/admin/table/TableForm';

import OrderList from './components/features/admin/order/OrderList';
import OrderForm from './components/features/admin/order/OrderForm';

import { VoucherManagement } from './components/features/admin/voucher';
import CustomerVouchers from './components/pages/Home/Vouchers/CustomerVouchers';
import VoucherPolicy from './components/pages/Policies/VoucherPolicy';
import DeliveryPolicy from './components/pages/Policies/DeliveryPolicy';
import AboutUs from './components/pages/Policies/AboutUs';
import ContactUs from './components/pages/Policies/ContactUs';
import CustomerManagement from './components/features/admin/customer/CustomerManagement';
import DetailCustomer from './components/features/admin/customer/Detail_Customer';

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
import Cart from "./components/pages/Home/Cart/Cart";
import OrderManagement from "./components/features/admin/order/Order_Management";
import OrderDeliveryStatus from "./components/features/admin/order/Order_DeliveryStatus";
import AdminDineInOrders from "./components/features/admin/order/AdminDineInOrders";
import AdminTakeAwayOrders from "./components/features/admin/order/AdminTakeAwayOrders";
import Delivery_Status from "./components/features/staff/delivery-status/Delivery_Status";
import ForgotPasswordCustomer from "./components/features/admin/auth/login_customer/forgot_password_cus";
import PaymentDetails from "./components/pages/Home/Cart/payment/payment";
import EditCart from "./components/pages/Home/Cart/payment/editCart";
import OrderHistory from "./components/pages/Home/OrderHistory";
import DetailDelivery from "./components/pages/Home/Cart/detail_delivery/detail_delivery";
import PaymentSuccess from "./components/pages/Home/PaymentSuccess/PaymentSuccess";
import AddressManagement from "./components/pages/Home/AddressManagement/AddressManagement";
import TableOrder from "./components/pages/DineIn/TableOrder";
import ThankYouPage from "./components/pages/DineIn/ThankYouPage";
import TableDashboard from "./components/features/staff/TableDashboard";
import OrderEdit from "./components/features/staff/OrderEdit";
import WebSocketTest from "./components/test/WebSocketTest";
import TakeAwayManagement from "./components/features/staff/takeaway/TakeAwayManagement";


function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Main customer page */}
          <Route path="/" element={
            <CustomerLayout>
              <Main />
            </CustomerLayout>
          } />

          {/* Dine-in table order page */}
          <Route path="/order" element={<TableOrder />} />
          <Route path="/dinein/thank-you" element={<ThankYouPage />} />

          {/* WebSocket Test page */}
          <Route path="/websocket-test" element={<WebSocketTest />} />
          <Route path="/pizza" element={
            <CustomerLayout>
              <List_Pizza />
            </CustomerLayout>
          } />
          <Route path="/pizza/:id" element={
            <CustomerLayout>
              <Detail_Pizza />
            </CustomerLayout>
          } />
          <Route path="/appetizers" element={
            <CustomerLayout>
              <List_Appetizers />
            </CustomerLayout>
          } />
          <Route path="/appetizers/:id" element={
            <CustomerLayout>
              <Detail_Appetizers />
            </CustomerLayout>
          } />
          <Route path="/salads" element={
            <CustomerLayout>
              <List_Salads />
            </CustomerLayout>
          } />
          <Route path="/salads/:id" element={
            <CustomerLayout>
              <Detail_Salad />
            </CustomerLayout>
          } />
          <Route path="/drinks" element={
            <CustomerLayout>
              <List_Drinks />
            </CustomerLayout>
          } />
          <Route path="/drinks/:id" element={
            <CustomerLayout>
              <Detail_Drinks />
            </CustomerLayout>
          } />
          <Route path="/pasta" element={
            <CustomerLayout>
              <List_Pasta />
            </CustomerLayout>
          } />
          <Route path="/pasta/:id" element={
            <CustomerLayout>
              <Detail_Pasta />
            </CustomerLayout>
          } />
          <Route path="/other" element={
            <CustomerLayout>
              <List_Other />
            </CustomerLayout>
          } />
          <Route path="/other/:id" element={
            <CustomerLayout>
              <Detail_Other />
            </CustomerLayout>
          } />
          <Route path="/cart" element={
            <CustomerLayout>
              <Cart />
            </CustomerLayout>
          } />

          <Route path="/payment-details/:orderId" element={
            <CustomerLayout>
              <PaymentDetails />
            </CustomerLayout>
          } />

          <Route path="/order/edit/:orderId" element={
            <CustomerLayout>
              <EditCart />
            </CustomerLayout>
          } />

          <Route path="/order-history" element={
            <CustomerLayout>
              <OrderHistory />
            </CustomerLayout>
          } />

          <Route path="/addresses" element={
            <CustomerLayout>
              <AddressManagement />
            </CustomerLayout>
          } />

          <Route path="/vouchers" element={
            <CustomerLayout>
              <CustomerVouchers />
            </CustomerLayout>
          } />
          
          <Route path="/voucher-policy" element={
            <CustomerLayout>
              <VoucherPolicy />
            </CustomerLayout>
          } />
          
          <Route path="/delivery-policy" element={
            <CustomerLayout>
              <DeliveryPolicy />
            </CustomerLayout>
          } />
          
          <Route path="/about-us" element={
            <CustomerLayout>
              <AboutUs />
            </CustomerLayout>
          } />
          
          <Route path="/contact-us" element={
            <CustomerLayout>
              <ContactUs />
            </CustomerLayout>
          } />

          <Route path="/detail-delivery/:orderId" element={
            <CustomerLayout>
              <DetailDelivery />
            </CustomerLayout>
          } />

          <Route path="/payment-success" element={
            <CustomerLayout>
              <PaymentSuccess />
            </CustomerLayout>
          } />


          {/* <Route path="/main" element={<HomePage />} /> */}
          <Route path="/login/admin" element={<Login />} />
          <Route path="/login/customer" element={<LoginCustomer />} />
          <Route path="/forgot_password_customer" element={<ForgotPasswordCustomer />} />
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
              <Route path="orders/delivery" element={<OrderDeliveryStatus />} />
              <Route path="orders/dine-in" element={<AdminDineInOrders />} />
              <Route path="orders/take-away" element={<AdminTakeAwayOrders />} />
              <Route path="orders/completed" element={<OrderList />} />
              <Route path="orders/create" element={<OrderForm />} />
              <Route path="orders/edit/:id" element={<OrderForm />} />


              <Route path="vouchers" element={<VoucherManagement />} />

              <Route path="users" element={<UserList />} />
              <Route path="register" element={<Register />} />
              <Route path="users/edit/:id" element={<EditUser />} />
              <Route path="users/details/:id" element={<DetailUser />} />

              <Route path="customers" element={<CustomerManagement />} />
              <Route path="customers/details/:id" element={<DetailCustomer />} />

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
              <Route index element={<TakeAwayManagement />} />
              <Route path="dinein-dashboard" element={<TableDashboard />} />
              <Route path="takeaway-dashboard" element={<TakeAwayManagement />} />
              <Route path="orders/:orderId/edit" element={<OrderEdit />} />

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
        <NotificationContainer />
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
