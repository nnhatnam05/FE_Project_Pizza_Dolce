import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdEdit, MdDelete } from 'react-icons/md';
import './Order.css';
import { format } from 'date-fns';


export default function OrderList() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Delete this order?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchOrders();
      } catch (err) {
        console.error("Failed to delete order:", err);
      }
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="container mt-4">
      <div className="orderlist-header d-flex justify-content-between align-items-center mb-4">
        <h2 className="orderlist-title">
          <i className="fa-solid fa-pizza-slice"></i>Order List
        </h2>
        <Link to="/admin/orders/create" className="create-icon-btn" title="Create Order">
          <i className="fas fa-plus-circle"></i>
        </Link>
      </div>
      <table className="table-order" >
        <thead className="table-light">
          <tr>
            <th>Table</th>
            <th>Foods</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>Table #{o.table?.number}</td>
              <td>
                {o.foods.map(f => f.name).join(', ')}
              </td>
              <td>{o.totalPrice} đ</td>
              <td>
                <span className={`status-badge ${o.status === 'COMPLETED' ? 'status-available' :
                  o.status === 'PENDING' ? 'status-onhold' : 'status-open'}`}>
                  {o.status}
                </span>
              </td>
              <td>{o.createdAt ? format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''}</td>
              <td className="action-icons">
                <Link to={`/admin/orders/edit/${o.id}`} className="icon-button edit">
                  <MdEdit />
                </Link>
                <button onClick={() => deleteOrder(o.id)} className="icon-button delete">
                  <MdDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}