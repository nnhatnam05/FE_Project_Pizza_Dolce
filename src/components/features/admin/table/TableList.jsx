import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import QRGenerator from '../../../common/QRCode/QRGenerator';
import { useNotification } from '../../../../contexts/NotificationContext';
import './Table.css';

export default function TableList() {
  const [tables, setTables] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { showError, showConfirm } = useNotification();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const tablesPerPage = 10;

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/tables', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTables(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      setLoading(false);
    }
  };

  const deleteTable = async (id) => {
    const confirmed = await showConfirm({
      title: 'Delete Table',
      message: 'Are you sure you want to delete this table?',
      type: 'danger',
      confirmText: 'Delete'
    });
    
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/tables/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchTables();
      } catch (err) {
        console.error("Failed to delete table:", err);
      }
    }
  };

  const showQRCode = async (table) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/tables/${table.id}/qr-code`);
      
      setSelectedTable({
        ...table,
        qrCodeUrl: response.data.qrCode
      });
      setShowQRModal(true);
    } catch (err) {
      console.error("Failed to get QR code:", err);
              showError("Failed to load QR code");
    }
  };

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/tables/${tableId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchTables(); // Refresh the table list
    } catch (err) {
      console.error("Failed to update table status:", err);
              showError("Failed to update table status");
    }
  };

  useEffect(() => { fetchTables(); }, []);

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const getSortedItems = (items) => {
    if (sortConfig.key) {
      return [...items].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  };

  // Filter tables based on search term and status
  const filteredTables = tables.filter(table => {
    const matchesSearch = searchTerm === '' || 
      table.number.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Apply sorting to filtered tables
  const sortedTables = getSortedItems(filteredTables);

  // Calculate pagination
  const indexOfLastTable = currentPage * tablesPerPage;
  const indexOfFirstTable = indexOfLastTable - tablesPerPage;
  const currentTables = sortedTables.slice(indexOfFirstTable, indexOfLastTable);
  const totalPages = Math.ceil(sortedTables.length / tablesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return ' ⇅';
  };

  return (
    <div className="table-list-container">
      <div className="table-list-header">
        <h2>Table List</h2>
        <Link to="/admin/tables/create" className="add-table-btn">+ Add Table</Link>
      </div>

      <div className="table-list-filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by table number..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
          <i className="search-icon">🔍</i>
        </div>
        <div className="filter-container">
          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="status-filter"
          >
            <option value="ALL">All status</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="RESERVED">RESERVED</option>
            <option value="CLEANING">CLEANING</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">Loading...</div>
      ) : (
        <>
          <div className="table-table-container">
            <table className="table-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th className="sortable" onClick={() => requestSort('number')}>
                    Table Number{getSortDirectionIndicator('number')}
                  </th>
                  <th className="sortable" onClick={() => requestSort('capacity')}>
                    Capacity{getSortDirectionIndicator('capacity')}
                  </th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>QR Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTables.map((table, idx) => {
                  const actualIndex = indexOfFirstTable + idx + 1;
                  
                  return (
                    <tr key={table.id}>
                      <td>{actualIndex}</td>
                      <td>F{table.number}</td>
                      <td>{table.capacity} persons</td>
                      <td>{table.location || 'Not specified'}</td>
                      <td>
                        <select 
                          value={table.status} 
                          onChange={(e) => updateTableStatus(table.id, e.target.value)}
                          className={`status-select status-${table.status.toLowerCase()}`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="OCCUPIED">OCCUPIED</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="CLEANING">CLEANING</option>
                        </select>
                      </td>
                      <td className="qr-cell">
                        <button 
                          onClick={() => showQRCode(table)} 
                          className="qr-btn" 
                          title="View QR Code"
                        >
                          📱 QR
                        </button>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <Link to={`/admin/tables/edit/${table.id}`} className="action-btn edit-btn" title="Edit">
                            ✏️
                          </Link>
                          <button onClick={() => deleteTable(table.id)} className="action-btn delete-btn" title="Delete">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-control" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, idx) => {
                  // Show limited page numbers with ellipsis
                  const pageNum = idx + 1;
                  
                  // Always show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button 
                        key={idx} 
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    (pageNum === currentPage - 2 && pageNum > 2) || 
                    (pageNum === currentPage + 2 && pageNum < totalPages - 1)
                  ) {
                    return <span key={idx} className="page-ellipsis">...</span>;
                  }
                  
                  return null;
                })}
              </div>
              <button 
                className="page-control" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
          
          {currentTables.length === 0 && (
            <div className="no-results">No tables found</div>
          )}
        </>
      )}
      
      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <QRGenerator
          tableId={selectedTable.id}
          tableNumber={selectedTable.number}
          qrCodeUrl={selectedTable.qrCodeUrl}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}
