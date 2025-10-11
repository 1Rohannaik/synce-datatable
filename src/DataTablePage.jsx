import React, { useState, useMemo, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { 
  generateDynamicColumns, 
  generateDefaultVisibleColumns, 
  generateColumnLabels,
  tableColumns, // Fallback
  defaultVisibleColumns, // Fallback
  columnLabels // Fallback
} from './config/columns.js';
import employeeData from './data/employeeData.json';
import './styles/DataTablePage.css';

const DataTablePage = () => {
  // State management
  const [data, setData] = useState(employeeData);
  const [filterText, setFilterText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Ref for dropdown
  const dropdownRef = useRef(null);
  
  // Generate dynamic configurations based on data
  const dynamicColumns = useMemo(() => generateDynamicColumns(data), [data]);
  const dynamicDefaultVisibleColumns = useMemo(() => generateDefaultVisibleColumns(data), [data]);
  const dynamicColumnLabels = useMemo(() => generateColumnLabels(data), [data]);
  
  // Initialize visible columns with dynamic defaults
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return dynamicDefaultVisibleColumns.length > 0 ? dynamicDefaultVisibleColumns : defaultVisibleColumns;
  });
  
  // Update visible columns when data changes (new columns added)
  useEffect(() => {
    const newDefaults = generateDefaultVisibleColumns(data);
    if (newDefaults.length > 0 && JSON.stringify(newDefaults) !== JSON.stringify(visibleColumns)) {
      // Only update if there are new columns that aren't currently visible
      const newColumns = newDefaults.filter(col => !visibleColumns.includes(col));
      if (newColumns.length > 0) {
        setVisibleColumns(prev => [...prev, ...newColumns]);
      }
    }
  }, [data]); // Remove visibleColumns from dependencies to avoid infinite loops

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!filterText) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        value.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [data, filterText]);

  // Filter columns based on visibility settings
  const visibleTableColumns = useMemo(() => {
    return dynamicColumns
      .filter(column => visibleColumns.includes(column.id))
      .filter(column => !column.omit); // Filter out omitted columns unless specifically made visible
  }, [dynamicColumns, visibleColumns]);

  // Handle search input change
  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  // Handle column visibility toggle
  const handleColumnToggle = (columnId) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        // Don't allow hiding all columns
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  // Handle select all/none columns
  const handleSelectAllColumns = () => {
    const allColumnIds = dynamicColumns
      .filter(col => !col.omit) // Don't auto-include omitted columns like ID
      .map(col => col.id);
    setVisibleColumns(allColumnIds);
  };

  const handleSelectNoColumns = () => {
    // Keep at least one column visible - prefer 'name' or first available
    const firstColumn = dynamicColumns.find(col => col.id === 'name') || dynamicColumns[0];
    setVisibleColumns([firstColumn?.id]);
  };

  // Export to CSV functionality
  const exportToCSV = () => {
    const csvHeaders = visibleTableColumns.map(col => col.name).join(',');
    const csvRows = filteredData.map(row => 
      visibleTableColumns.map(col => {
        const value = row[col.id];
        // Handle special formatting for CSV
        if (typeof value === 'string' && value.includes(',')) {
          return `"{value}"`;
        }
        return value;
      }).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Custom styles for react-data-table-component
  const customStyles = {
    table: {
      style: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottomWidth: '1px',
        borderBottomColor: '#e5e7eb',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
      },
    },
    headCells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '16px',
        paddingBottom: '16px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        borderBottomWidth: '1px',
        borderBottomColor: '#f3f4f6',
        '&:hover': {
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '16px',
        paddingBottom: '16px',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#f9fafb',
        borderTopWidth: '1px',
        borderTopColor: '#e5e7eb',
        fontSize: '14px',
        color: '#374151',
        padding: '16px 20px',
      },
      pageButtonsStyle: {
        borderRadius: '6px',
        height: '32px',
        width: '32px',
        padding: '8px',
        margin: '0 2px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        color: '#374151',
        fontSize: '14px',
        '&:hover:not(:disabled)': {
          backgroundColor: '#f3f4f6',
          borderColor: '#9ca3af',
        },
        '&:disabled': {
          cursor: 'not-allowed',
          color: '#9ca3af',
          backgroundColor: '#f9fafb',
        },
      },
    },
  };

  // Calculate statistics
  const totalRecords = data.length;
  const filteredRecords = filteredData.length;
  const totalFields = dynamicColumns.length;

  return (
    <div className="data-table-container">
      {/* Page Header */}
  

      {/* Controls Section */}
      <div className="table-controls">
        <div className="controls-row">
          {/* Search */}
          <div className="search-container">
            <div className="search-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search data..."
              className="search-input"
              value={filterText}
              onChange={handleFilterChange}
            />
          </div>

          {/* Column Controls */}
          <div className="column-controls">
            {/* Column Visibility Dropdown */}
            <div className="column-visibility-dropdown" ref={dropdownRef}>
              <button 
                className="dropdown-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Column Visibility
                <svg 
                  width="12" 
                  height="12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="dropdown-content">
                  <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>
                    <button 
                      onClick={handleSelectAllColumns}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#3b82f6', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '8px',
                        textDecoration: 'underline'
                      }}
                    >
                      Select All
                    </button>
                    <button 
                      onClick={handleSelectNoColumns}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#3b82f6', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline'
                      }}
                    >
                      Select None
                    </button>
                  </div>
                  {dynamicColumns
                    .filter(column => !column.omit || visibleColumns.includes(column.id)) // Show omitted columns only if they're currently visible
                    .map(column => (
                    <div key={column.id} className="column-checkbox">
                      <input
                        type="checkbox"
                        id={`column-${column.id}`}
                        checked={visibleColumns.includes(column.id)}
                        onChange={() => handleColumnToggle(column.id)}
                      />
                      <label htmlFor={`column-${column.id}`}>
                        {dynamicColumnLabels[column.id] || column.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <button className="export-button" onClick={exportToCSV}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="datatable-wrapper">
        <DataTable
          columns={visibleTableColumns}
          data={filteredData}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
          responsive
          striped
          highlightOnHover
          progressPending={loading}
          progressComponent={
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          }
          noDataComponent={
            <div className="no-data-message">
              {filterText ? 
                `No records found matching "${filterText}"` : 
                "No data available"
              }
            </div>
          }
          customStyles={customStyles}
          fixedHeader
          fixedHeaderScrollHeight="600px"
        />
      </div>

      {/* Statistics */}
      <div className="table-stats">
        <div className="stats-item">
          <div className="stats-number">{totalRecords}</div>
          <div className="stats-label">Total Records</div>
        </div>
        <div className="stats-item">
          <div className="stats-number">{filteredRecords}</div>
          <div className="stats-label">Showing</div>
        </div>
        <div className="stats-item">
          <div className="stats-number">{totalFields}</div>
          <div className="stats-label">Total Fields</div>
        </div>
        <div className="stats-item">
          <div className="stats-number">{visibleColumns.length}</div>
          <div className="stats-label">Visible Columns</div>
        </div>
      </div>
    </div>
  );
};

export default DataTablePage;