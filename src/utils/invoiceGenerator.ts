
export interface InvoiceData {
  id: string;
  invoice_number: string;
  business_page: {
    page_name: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
  };
  client_name: string;
  client_email?: string;
  client_address?: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  due_date?: string;
  issued_date: string;
  notes?: string;
  type?: 'invoice' | 'receipt';
}

export const generateInvoicePDF = (invoiceData: InvoiceData): void => {
  const { invoice_number, business_page, client_name, client_address, items, subtotal, tax_amount, total_amount, currency, due_date, issued_date, notes, type = 'invoice' } = invoiceData;
  
  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BTC': '₿', 'ETH': 'Ξ'
    };
    return symbols[curr] || curr;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const documentTitle = type === 'receipt' ? 'RECEIPT' : 'INVOICE';
  const headerColor = type === 'receipt' ? '#16A34A' : '#6B46C1';

  // Create HTML content for the invoice/receipt
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${documentTitle} ${invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid ${headerColor}; padding-bottom: 20px; }
        .company-info { display: flex; align-items: center; gap: 20px; }
        .logos { display: flex; align-items: center; gap: 15px; }
        .logo { width: 60px; height: 60px; object-fit: contain; }
        .company-details { }
        .company-name { font-size: 24px; font-weight: bold; color: ${headerColor}; margin: 0; }
        .invoice-info { text-align: right; }
        .invoice-title { font-size: 28px; font-weight: bold; color: ${headerColor}; margin-bottom: 20px; }
        .client-info { margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: ${headerColor}; color: white; font-weight: bold; }
        .items-table tr:nth-child(even) { background-color: #f8f9fa; }
        .totals { margin-left: auto; width: 300px; border: 2px solid ${headerColor}; border-radius: 8px; padding: 20px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid ${headerColor}; padding-top: 10px; color: ${headerColor}; }
        .notes { margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .footer { margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(107, 70, 193, 0.1); z-index: -1; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="watermark">${type.toUpperCase()}</div>
      
      <div class="header">
        <div class="company-info">
          <div class="logos">
            ${business_page.avatar_url ? `<img src="${business_page.avatar_url}" alt="Business Logo" class="logo" />` : ''}
            <img src="https://via.placeholder.com/60x60/6B46C1/FFFFFF?text=R" alt="Regal Logo" class="logo" />
          </div>
          <div class="company-details">
            <h1 class="company-name">${business_page.page_name}</h1>
            ${business_page.email ? `<p>Email: ${business_page.email}</p>` : ''}
            ${business_page.phone ? `<p>Phone: ${business_page.phone}</p>` : ''}
            ${business_page.address ? `<p>Address: ${business_page.address}</p>` : ''}
          </div>
        </div>
        <div class="invoice-info">
          <div class="invoice-title">${documentTitle}</div>
          <p><strong>${documentTitle} #:</strong> ${invoice_number}</p>
          <p><strong>Date:</strong> ${new Date(issued_date).toLocaleDateString()}</p>
          ${due_date && type === 'invoice' ? `<p><strong>Due Date:</strong> ${new Date(due_date).toLocaleDateString()}</p>` : ''}
          ${type === 'receipt' ? `<p><strong>Status:</strong> <span style="color: #16A34A; font-weight: bold;">PAID</span></p>` : ''}
        </div>
      </div>

      <div class="client-info">
        <h3>${type === 'receipt' ? 'Customer Information:' : 'Bill To:'}</h3>
        <p><strong>${client_name}</strong></p>
        ${client_address ? `<p>${client_address.replace(/\n/g, '<br>')}</p>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatCurrency(item.rate)}</td>
              <td style="text-align: right;">${formatCurrency(item.quantity * item.rate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Tax:</span>
          <span>${formatCurrency(tax_amount)}</span>
        </div>
        <div class="totals-row total-final">
          <span>Total:</span>
          <span>${formatCurrency(total_amount)}</span>
        </div>
      </div>

      ${notes ? `
        <div class="notes">
          <h3>Notes:</h3>
          <p>${notes.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>Generated on ${new Date().toLocaleDateString()} | Powered by Regal Platform</p>
        ${type === 'receipt' ? '<p style="color: #16A34A; font-weight: bold;">✓ Payment Received</p>' : ''}
      </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
};

// Note: JPEG and PNG export requires html2canvas library
// For now, we support PDF and HTML export
export const downloadInvoiceAsJPEG = (invoiceData: InvoiceData): void => {
  console.log('JPEG export requires html2canvas library to be installed');
  // Implementation would require: npm install html2canvas
};

export const downloadInvoiceAsPNG = (invoiceData: InvoiceData): void => {
  console.log('PNG export requires html2canvas library to be installed');
  // Implementation would require: npm install html2canvas
};

export const downloadInvoiceHTML = (invoiceData: InvoiceData): void => {
  const htmlContent = generateInvoiceHTML(invoiceData);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoiceData.type || 'invoice'}-${invoiceData.invoice_number}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Receipt generator function
export const generateReceiptPDF = (receiptData: InvoiceData): void => {
  generateInvoicePDF({ ...receiptData, type: 'receipt' });
};

const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
  const { invoice_number, business_page, client_name, client_address, items, subtotal, tax_amount, total_amount, currency, due_date, issued_date, notes, type = 'invoice' } = invoiceData;
  
  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BTC': '₿', 'ETH': 'Ξ'
    };
    return symbols[curr] || curr;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const documentTitle = type === 'receipt' ? 'RECEIPT' : 'INVOICE';
  const headerColor = type === 'receipt' ? '#16A34A' : '#6B46C1';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${documentTitle} ${invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid ${headerColor}; padding-bottom: 20px; }
        .company-info { display: flex; align-items: center; gap: 20px; }
        .logos { display: flex; align-items: center; gap: 15px; }
        .logo { width: 60px; height: 60px; object-fit: contain; }
        .company-details { }
        .company-name { font-size: 24px; font-weight: bold; color: ${headerColor}; margin: 0; }
        .invoice-info { text-align: right; }
        .invoice-title { font-size: 28px; font-weight: bold; color: ${headerColor}; margin-bottom: 20px; }
        .client-info { margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: ${headerColor}; color: white; font-weight: bold; }
        .items-table tr:nth-child(even) { background-color: #f8f9fa; }
        .totals { margin-left: auto; width: 300px; border: 2px solid ${headerColor}; border-radius: 8px; padding: 20px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid ${headerColor}; padding-top: 10px; color: ${headerColor}; }
        .notes { margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .footer { margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(107, 70, 193, 0.1); z-index: -1; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="watermark">${type.toUpperCase()}</div>
      
      <div class="header">
        <div class="company-info">
          <div class="logos">
            ${business_page.avatar_url ? `<img src="${business_page.avatar_url}" alt="Business Logo" class="logo" />` : ''}
            <img src="https://via.placeholder.com/60x60/6B46C1/FFFFFF?text=R" alt="Regal Logo" class="logo" />
          </div>
          <div class="company-details">
            <h1 class="company-name">${business_page.page_name}</h1>
            ${business_page.email ? `<p>Email: ${business_page.email}</p>` : ''}
            ${business_page.phone ? `<p>Phone: ${business_page.phone}</p>` : ''}
            ${business_page.address ? `<p>Address: ${business_page.address}</p>` : ''}
          </div>
        </div>
        <div class="invoice-info">
          <div class="invoice-title">${documentTitle}</div>
          <p><strong>${documentTitle} #:</strong> ${invoice_number}</p>
          <p><strong>Date:</strong> ${new Date(issued_date).toLocaleDateString()}</p>
          ${due_date && type === 'invoice' ? `<p><strong>Due Date:</strong> ${new Date(due_date).toLocaleDateString()}</p>` : ''}
          ${type === 'receipt' ? `<p><strong>Status:</strong> <span style="color: #16A34A; font-weight: bold;">PAID</span></p>` : ''}
        </div>
      </div>

      <div class="client-info">
        <h3>${type === 'receipt' ? 'Customer Information:' : 'Bill To:'}</h3>
        <p><strong>${client_name}</strong></p>
        ${client_address ? `<p>${client_address.replace(/\n/g, '<br>')}</p>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Rate</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatCurrency(item.rate)}</td>
              <td style="text-align: right;">${formatCurrency(item.quantity * item.rate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Tax:</span>
          <span>${formatCurrency(tax_amount)}</span>
        </div>
        <div class="totals-row total-final">
          <span>Total:</span>
          <span>${formatCurrency(total_amount)}</span>
        </div>
      </div>

      ${notes ? `
        <div class="notes">
          <h3>Notes:</h3>
          <p>${notes.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>Generated on ${new Date().toLocaleDateString()} | Powered by Regal Platform</p>
        ${type === 'receipt' ? '<p style="color: #16A34A; font-weight: bold;">✓ Payment Received</p>' : ''}
      </div>
    </body>
    </html>
  `;
};
