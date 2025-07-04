import React, { useEffect, useState } from 'react';
import api from '../../../../../api/axiosConfig';
import '../Attendance.css';

const AttendanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Generate array of years for filter dropdown (current year and 5 years back)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  
  // Generate array of months for filter dropdown
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct API path - note the API is returning staff attendance data
      const response = await api.get(`/attendance/reports/monthly?year=${year}&month=${month}`);
      console.log('Attendance report data received:', response.data);
      setReportData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch attendance report:', err);
      setError('Failed to load attendance report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilterApply = (e) => {
    e.preventDefault();
    fetchReport();
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get the month name for display
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  // Helper function to highlight cells based on conditions
  const getRowClass = (item) => {
    if (item.daysAbsent > 0) return 'highlight-absent';
    if (item.timesLate > 0) return 'highlight-late';
    return '';
  };

  return (
    <div className="attendance-report-container">
      <div className="attendance-report-header">
        <h2>Monthly Attendance Report</h2>
      </div>
      
      <div className="attendance-report-filters">
        <form onSubmit={handleFilterApply} className="filter-form">
          <div className="filter-group">
            <label className="filter-label">Year:</label>
            <select 
              className="filter-select"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Month:</label>
            <select 
              className="filter-select"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="filter-btn">Apply Filter</button>
        </form>
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading report data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Work Days</th>
                  <th>Work Hours</th>
                  <th>Times Late</th>
                  <th>Days Absent</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={`${item.staffCode}-${item.name}`} className={getRowClass(item)}>
                      <td>{item.staffCode}</td>
                      <td>{item.name}</td>
                      <td>{item.totalDays}</td>
                      <td>{item.totalHours}</td>
                      <td>{item.timesLate}</td>
                      <td>{item.daysAbsent}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No attendance data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {reportData.length > itemsPerPage && (
            <div className="pagination">
              <button 
                className="page-control"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                &lt;
              </button>
              <div className="page-info">
                Page {currentPage} of {Math.ceil(reportData.length / itemsPerPage)}
              </div>
              <button 
                className="page-control"
                disabled={currentPage === Math.ceil(reportData.length / itemsPerPage)}
                onClick={() => paginate(currentPage + 1)}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceReport; 