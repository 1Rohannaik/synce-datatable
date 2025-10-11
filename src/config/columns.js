// Dynamic column generation function
export const generateDynamicColumns = (data) => {
  if (!data || data.length === 0) return [];
  
  // Get all unique keys from the data
  const allKeys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  // Convert to array and sort for consistent ordering
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    // Custom ordering - put common fields first
    const fieldOrder = ['id', 'name', 'email', 'role', 'department', 'joiningDate', 'salary', 'phone', 'status'];
    const aIndex = fieldOrder.indexOf(a);
    const bIndex = fieldOrder.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
  
  // Generate columns dynamically
  return sortedKeys.map(key => createColumnConfig(key, data));
};

// Create column configuration for a specific field
const createColumnConfig = (fieldName, data) => {
  // Analyze the data type and content
  const fieldType = analyzeFieldType(fieldName, data);
  const config = getFieldConfig(fieldName, fieldType);
  
  return {
    id: fieldName,
    name: config.displayName,
    selector: row => row[fieldName],
    sortable: config.sortable,
    width: config.width,
    cell: config.cellRenderer ? (row) => config.cellRenderer(row[fieldName], row) : undefined,
    omit: config.omit || false,
  };
};

// Analyze field type based on field name and data content
const analyzeFieldType = (fieldName, data) => {
  // Get sample values (first few non-null values)
  const sampleValues = data
    .map(item => item[fieldName])
    .filter(val => val !== null && val !== undefined)
    .slice(0, 5);
    
  if (sampleValues.length === 0) return 'text';
  
  const firstValue = sampleValues[0];
  
  // Simple type detection - only basic formatting
  if (fieldName === 'id') return 'id';
  if (typeof firstValue === 'number') return 'number';
  if (typeof firstValue === 'boolean') return 'boolean';
  if (typeof firstValue === 'string' && isDateString(firstValue)) return 'date';
  
  return 'text';
};

// Check if a string looks like a date
const isDateString = (str) => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return datePattern.test(str) && !isNaN(Date.parse(str));
};

// Get field configuration based on type
const getFieldConfig = (fieldName, fieldType) => {
  const configs = {
    id: {
      displayName: 'ID',
      sortable: true,
      width: '80px',
      omit: true, // Hidden by default
    },
    text: {
      displayName: formatDisplayName(fieldName),
      sortable: true,
      width: '150px',
    },
    date: {
      displayName: formatDisplayName(fieldName),
      sortable: true,
      width: '130px',
      cellRenderer: (value) => (
        <div className="text-gray-600">
          {formatDate(value)}
        </div>
      ),
    },
    number: {
      displayName: formatDisplayName(fieldName),
      sortable: true,
      width: '120px',
      cellRenderer: (value) => (
        <div className="text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      ),
    },
    boolean: {
      displayName: formatDisplayName(fieldName),
      sortable: true,
      width: '100px',
      cellRenderer: (value) => (
        <div className="text-gray-900">
          {value ? 'Yes' : 'No'}
        </div>
      ),
    },
  };
  
  return configs[fieldType] || configs.text;
};

// Format field name for display
const formatDisplayName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/\b\w/g, str => str.toUpperCase()) // Capitalize each word
    .trim();
};


// Static/predefined column configurations (kept for backward compatibility)
export const tableColumns = [
  {
    id: 'name',
    name: 'Name',
    selector: row => row.name,
    sortable: true,
    width: '150px',
    cell: row => (
      <div className="font-medium text-gray-900">
        {row.name}
      </div>
    ),
  },
  {
    id: 'email',
    name: 'Email',
    selector: row => row.email,
    sortable: true,
    width: '200px',
    cell: row => (
      <div className="text-blue-600 hover:text-blue-800">
        {row.email}
      </div>
    ),
  },
  {
    id: 'role',
    name: 'Role',
    selector: row => row.role,
    sortable: true,
    width: '180px',
    cell: row => (
      <div className="text-gray-700">
        {row.role}
      </div>
    ),
  },
  {
    id: 'department',
    name: 'Department',
    selector: row => row.department,
    sortable: true,
    width: '160px',
    cell: row => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDepartmentColor(row.department)}`}>
        {row.department}
      </span>
    ),
  },
  {
    id: 'joiningDate',
    name: 'Joining Date',
    selector: row => row.joiningDate,
    sortable: true,
    width: '140px',
    cell: row => (
      <div className="text-gray-600">
        {formatDate(row.joiningDate)}
      </div>
    ),
  },
  {
    id: 'salary',
    name: 'Salary',
    selector: row => row.salary,
    sortable: true,
    width: '120px',
    cell: row => (
      <div className="font-medium text-green-600">
        ${row.salary.toLocaleString()}
      </div>
    ),
  },
  {
    id: 'phone',
    name: 'Phone',
    selector: row => row.phone,
    sortable: true,
    width: '140px',
    cell: row => (
      <div className="text-gray-600">
        {row.phone}
      </div>
    ),
  },
  {
    id: 'status',
    name: 'Status',
    selector: row => row.status,
    sortable: true,
    width: '100px',
    cell: row => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(row.status)}`}>
        {row.status}
      </span>
    ),
  },
  {
    id: 'location',
    name: 'Location',
    selector: row => row.location,
    sortable: true,
    width: '160px',
    cell: row => (
      <div className="text-gray-600">
        <svg width="12" height="12" fill="currentColor" className="inline mr-1" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        {row.location}
      </div>
    ),
  },
  {
    id: 'employmentType',
    name: 'Employment Type',
    selector: row => row.employmentType,
    sortable: true,
    width: '140px',
    cell: row => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEmploymentTypeColor(row.employmentType)}`}>
        {row.employmentType}
      </span>
    ),
  },
  {
    id: 'performanceRating',
    name: 'Performance',
    selector: row => row.performanceRating,
    sortable: true,
    width: '120px',
    cell: row => (
      <div className="flex items-center">
        <div className="font-medium text-gray-900">
          {row.performanceRating}
        </div>
        <div className="ml-2">
          {getPerformanceStars(row.performanceRating)}
        </div>
      </div>
    ),
  },
  {
    id: 'manager',
    name: 'Manager',
    selector: row => row.manager,
    sortable: true,
    width: '140px',
    cell: row => (
      <div className="text-gray-700">
        <svg width="12" height="12" fill="currentColor" className="inline mr-1" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        {row.manager}
      </div>
    ),
  },
  {
    id: 'lastPromotionDate',
    name: 'Last Promotion',
    selector: row => row.lastPromotionDate,
    sortable: true,
    width: '140px',
    cell: row => (
      <div className="text-gray-600">
        {formatDate(row.lastPromotionDate)}
      </div>
    ),
  },
];

// Helper function to get department color classes
const getDepartmentColor = (department) => {
  const colors = {
    'Engineering': 'bg-blue-100 text-blue-800',
    'Product': 'bg-purple-100 text-purple-800',
    'Design': 'bg-pink-100 text-pink-800',
    'Analytics': 'bg-orange-100 text-orange-800',
    'Human Resources': 'bg-green-100 text-green-800',
    'Sales': 'bg-yellow-100 text-yellow-800',
    'Marketing': 'bg-red-100 text-red-800',
    'Finance': 'bg-indigo-100 text-indigo-800',
    'Operations': 'bg-gray-100 text-gray-800',
    'Strategy': 'bg-teal-100 text-teal-800',
    'Support': 'bg-cyan-100 text-cyan-800',
  };
  return colors[department] || 'bg-gray-100 text-gray-800';
};

// Helper function to get status color classes
const getStatusColor = (status) => {
  const colors = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-red-100 text-red-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get employment type color classes
const getEmploymentTypeColor = (type) => {
  const colors = {
    'Full-Time': 'bg-green-100 text-green-800',
    'Part-Time': 'bg-yellow-100 text-yellow-800',
    'Contract': 'bg-blue-100 text-blue-800',
    'Intern': 'bg-purple-100 text-purple-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

// Helper function to generate performance rating stars
const getPerformanceStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg key={`full-${i}`} width="12" height="12" fill="#fbbf24" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <svg key="half" width="12" height="12" fill="#fbbf24" viewBox="0 0 20 20">
        <defs>
          <linearGradient id="half-fill">
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  
  // Add empty stars to complete 5 stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg key={`empty-${i}`} width="12" height="12" fill="#e5e7eb" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  
  return <div className="flex">{stars}</div>;
};

// Generate dynamic default visible columns
export const generateDefaultVisibleColumns = (data) => {
  if (!data || data.length === 0) return [];
  
  const allKeys = Object.keys(data[0] || {});
  
  // Show first 6-8 non-ID fields by default
  const visibleFields = allKeys
    .filter(field => field !== 'id') // Exclude ID by default
    .slice(0, 8); // Show max 8 columns by default
    
  return visibleFields;
};

// Generate dynamic column labels
export const generateColumnLabels = (data) => {
  if (!data || data.length === 0) return {};
  
  const allKeys = Object.keys(data[0] || {});
  const labels = {};
  
  allKeys.forEach(key => {
    labels[key] = formatDisplayName(key);
  });
  
  return labels;
};

// Static default visible columns (for backward compatibility)
export const defaultVisibleColumns = [
  'name', 'email', 'role', 'department', 'joiningDate', 'location', 'employmentType', 'performanceRating'
];

// Static column labels (for backward compatibility)
export const columnLabels = {
  name: 'Name',
  email: 'Email',
  role: 'Role',
  department: 'Department',
  joiningDate: 'Joining Date',
  salary: 'Salary',
  phone: 'Phone',
  status: 'Status',
  location: 'Location',
  employmentType: 'Employment Type',
  performanceRating: 'Performance Rating',
  manager: 'Manager',
  lastPromotionDate: 'Last Promotion',
};
