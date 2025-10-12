// Dynamic column generation function
export const generateDynamicColumns = (data) => {
  if (!data || data.length === 0) return [];
  
  // Get all unique keys from the data, preserving natural order from first record
  const firstRecordKeys = Object.keys(data[0] || {});
  const allKeysSet = new Set();
  
  // Add keys from first record first to preserve order
  firstRecordKeys.forEach(key => allKeysSet.add(key));
  
  // Add any additional keys from other records
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeysSet.add(key));
  });
  
  // Convert to array - keys are now in natural order from the data
  const sortedKeys = Array.from(allKeysSet);
  
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
          {formatNumber(value, fieldName)}
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

// Format date values
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString; // Return original if formatting fails
  }
};

// Format number values dynamically
const formatNumber = (value, fieldName) => {
  if (typeof value !== 'number') return value;
  
  // Check if it looks like currency (contains words like salary, price, cost, amount, etc.)
  const currencyKeywords = ['salary', 'price', 'cost', 'amount', 'fee', 'revenue', 'profit', 'budget'];
  const isCurrency = currencyKeywords.some(keyword => fieldName.toLowerCase().includes(keyword));
  
  if (isCurrency) {
    return `$${value.toLocaleString()}`;
  }
  
  // Check if it looks like a rating/percentage (between 0-5 or 0-10 or 0-100)
  if (value <= 5 && value % 1 !== 0) {
    return value.toFixed(1); // Rating with 1 decimal
  }
  
  // Default number formatting
  return value.toLocaleString();
};



// Generate dynamic default visible columns
export const generateDefaultVisibleColumns = (data) => {
  if (!data || data.length === 0) return [];
  
  const allKeys = Object.keys(data[0] || {});
  
  // Show ALL columns by default (including ID)
  return allKeys;
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

