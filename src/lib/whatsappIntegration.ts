interface CartItem {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  grade: string;
  quantity: number;
}

interface WhatsAppData {
  type: 'rfq' | 'inquiry' | 'product-detail';
  productName?: string;
  category?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  company?: string;
  location?: string;
  brand?: string;
  grade?: string;
  quantity?: string;
  specifications?: string;
  cartItems?: CartItem[];
  totalItems?: number;
}

export const formatWhatsAppMessage = (data: WhatsAppData): string => {
  let message = '*I need quotation for below materials:*\n\n';

  if (data.type === 'product-detail') {
    message += `*Product:* ${data.productName || 'N/A'}\n`;
    message += `*Category:* ${data.category || 'N/A'}\n`;
    message += `*Brand:* ${data.brand || 'N/A'}\n`;
    message += `*Grade:* ${data.grade || 'N/A'}\n`;
    message += `*Quantity:* ${data.quantity || 'N/A'}\n`;
  } else if (data.type === 'inquiry') {
    message += `*Product Inquiry:* ${data.productName || 'N/A'}\n`;
    message += `*Name:* ${data.customerName || 'N/A'}\n`;
    message += `*Email:* ${data.email || 'N/A'}\n`;
    message += `*Phone:* ${data.phone || 'N/A'}\n`;
    message += `*Quantity:* ${data.quantity || 'N/A'}\n`;
    if (data.specifications) {
      message += `*Specifications:*\n${data.specifications}\n`;
    }
  } else if (data.type === 'rfq') {
    if (data.cartItems && data.cartItems.length > 0) {
      message += `*MATERIAL REQUIREMENTS*\n`;
      message += `Total Items: ${data.totalItems}\n\n`;
      
      data.cartItems.forEach((item, index) => {
        message += `*Item ${index + 1}*\n`;
        message += `Product: ${item.productName}\n`;
        message += `Category: ${item.category}\n`;
        message += `Brand: ${item.brand}\n`;
        message += `Material/Grade: ${item.grade}\n`;
        message += `Quantity: *${item.quantity} MT*\n\n`;
      });
    }
    
    message += `*CUSTOMER DETAILS*\n`;
    message += `Name: ${data.customerName || 'N/A'}\n`;
    message += `Company: ${data.company || 'Not specified'}\n`;
    message += `Delivery Location: ${data.location || 'Not specified'}\n`;
    message += `Email: ${data.email || 'N/A'}\n`;
    message += `Phone: ${data.phone || 'N/A'}\n`;
  }

  return message;
};

export const sendToWhatsApp = (data: WhatsAppData): void => {
  const phoneNumber = '919136242706';
  const message = formatWhatsAppMessage(data);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, '_blank');
};


