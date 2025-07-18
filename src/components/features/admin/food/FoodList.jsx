import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Food.css';

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const foodsPerPage = 10;

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8080/api/foods/filter?name=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFoods(res.data);
    } catch (error) {
      console.error("Failed to fetch foods:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteFood = async (id) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await axios.delete(`http://localhost:8080/api/foods/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        fetchFoods();
      } catch (error) {
        console.error("Failed to delete food:", error);
      }
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [filter]);

  // Filter foods based on status and type
  const filteredFoods = foods.filter(food => {
    const statusMatch = statusFilter === 'ALL' || food.status === statusFilter;
    const typeMatch = typeFilter === 'ALL' || food.type === typeFilter;
    return statusMatch && typeMatch;
  });

  // Calculate pagination
  const indexOfLastFood = currentPage * foodsPerPage;
  const indexOfFirstFood = indexOfLastFood - foodsPerPage;
  const currentFoods = filteredFoods.slice(indexOfFirstFood, indexOfLastFood);
  const totalPages = Math.ceil(filteredFoods.length / foodsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render food image with fallback
  const renderFoodImage = (food) => {
    const imageUrl = food.imageUrl && food.imageUrl !== 'null' && food.imageUrl !== 'undefined'
      ? `http://localhost:8080${food.imageUrl}`
      : null;

    if (imageUrl) {
      return (
        <div className="food-img-container">
          <img 
            src={imageUrl}
            alt={food.name} 
            className="food-img" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/images/pzmenu.jpg'; // Fallback to default image
            }} 
          />
        </div>
      );
    } else {
      return (
        <div className="food-img-placeholder">
          No Image
        </div>
      );
    }
  };

  return (
    <div className="food-list-container">
      <div className="food-list-header">
        <h2>Food List</h2>
        <Link to="/admin/foods/create" className="add-food-btn">+ Add Food</Link>
      </div>

      <div className="food-list-filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search foods..." 
            className="search-input"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
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
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>
        <div className="filter-container">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="status-filter"
          >
            <option value="ALL">All Types</option>
            <option value="PIZZA">Pizza</option>
            <option value="APPERTIZER">Appetizer</option>
            <option value="SALAD">Salad</option>
            <option value="DRINK">Drink</option>
            <option value="PASTA/MAIN">Pasta/Main</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="food-loading">Loading...</div>
      ) : (
        <>
          <div className="food-table-container">
            <table className="food-table">
              <thead>
                <tr>
                  <th>#</th>
                  {/* <th>ID</th> */}
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentFoods.map((food, idx) => {
                  const actualIndex = indexOfFirstFood + idx + 1;
                  console.log(`Food ${food.name} - Status: ${food.status}, Type: ${food.type}`);
                  
                  return (
                    <tr key={food.id}>
                      <td>{actualIndex}</td>
                      <td>{food.name}</td>
                      <td>{renderFoodImage(food)}</td>
                      <td>{food.price}$</td>
                      <td className="description-cell">
                        <div className="description-wrapper">
                          <div className="description-text">{food.description}</div>
                          {food.description && food.description.length > 50 && (
                            <button 
                              className="description-read-more"
                              onClick={(e) => {
                                e.stopPropagation();
                                const parent = e.target.closest('.description-wrapper');
                                parent.classList.toggle('expanded');
                                e.target.textContent = parent.classList.contains('expanded') ? 'Thu gọn' : 'Xem thêm';
                              }}
                            >
                              Xem thêm
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="food-status-badge">
                          {food.status === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                        </div>
                      </td>
                      <td>
                        <div className={`food-type-badge food-type-${food.type.toLowerCase().replace('/', '-')}`}>
                          {food.type === 'PIZZA' ? 'Pizza' :
                           food.type === 'APPERTIZER' ? 'Appetizer' :
                           food.type === 'SALAD' ? 'Salad' :
                           food.type === 'DRINK' ? 'Drink' :
                           food.type === 'PASTA/MAIN' ? 'Pasta/Main' :
                           food.type === 'OTHER' ? 'Other' : food.type}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <Link to={`/admin/foods/edit/${food.id}`} className="action-btn edit-btn" title="Edit">
                            ✏️
                          </Link>
                          <button onClick={() => deleteFood(food.id)} className="action-btn delete-btn" title="Delete">
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
          
          {currentFoods.length === 0 && (
            <div className="no-results">No foods found</div>
          )}
        </>
      )}
    </div>
  );
} 