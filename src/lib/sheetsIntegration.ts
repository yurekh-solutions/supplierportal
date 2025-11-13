interface SheetData {
  source: string;
  productName?: string;
  productCategory?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  deliveryLocation?: string;
  brand?: string;
  grade?: string;
  quantity?: string;
  specifications?: string;
}

// Store data locally as fallback
const STORAGE_KEY = 'materialmatrix_rfq_data';

export const saveToLocalStorage = (data: SheetData): void => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const records = existing ? JSON.parse(existing) : [];
    
    const record = {
      timestamp: new Date().toISOString(),
      ...data,
      sessionId: generateSessionId()
    };
    
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getAllRecords = (): any[] => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Failed to retrieve records:', error);
    return [];
  }
};

export const exportToCSV = (): string => {
  const records = getAllRecords();
  if (records.length === 0) return '';

  const headers = [
    'Timestamp',
    'Source',
    'Product Name',
    'Category',
    'Customer Name',
    'Email',
    'Phone',
    'Company',
    'Location',
    'Brand',
    'Grade',
    'Quantity',
    'Specifications',
    'Session ID'
  ];

  const rows = records.map(record => [
    record.timestamp,
    record.source,
    record.productName || '',
    record.productCategory || '',
    record.customerName || '',
    record.customerEmail || '',
    record.customerPhone || '',
    record.customerCompany || '',
    record.deliveryLocation || '',
    record.brand || '',
    record.grade || '',
    record.quantity || '',
    record.specifications || '',
    record.sessionId || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (): void => {
  const csv = exportToCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `materialmatrix_rfq_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Google Sheets API integration (requires setup)
export const saveToGoogleSheets = async (data: SheetData): Promise<boolean> => {
  // This would require Google Sheets API setup
  // For now, we'll use localStorage as the primary method
  saveToLocalStorage(data);
  return true;
};
