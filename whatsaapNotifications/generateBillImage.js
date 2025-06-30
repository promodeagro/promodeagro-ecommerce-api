const puppeteer = require('puppeteer');

async function generateBillImage(items, orderData = {}) {
    // Calculate the total price and format the items
    let totalPrice = 0;
    let itemsList = items.map(item => {
        let price = parseFloat(item.price);
        let quantity = parseInt(item.quantity);
        let subtotal = price * quantity;
        totalPrice += subtotal;

        return {
            name: item.productName,
            price: price.toFixed(2),
            quantity: quantity.toString(),
            subtotal: subtotal.toFixed(2)
        };
    });

    // Create HTML template with modern styling
    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice - Promode Agro Farms</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #f8f9fa;
                    padding: 20px;
                }
                
                .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    font-weight: 700;
                }
                
                .header p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }
                
                .invoice-details {
                    padding: 30px;
                    border-bottom: 2px solid #e9ecef;
                }
                
                .invoice-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .detail-group {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #28a745;
                }
                
                .detail-group h3 {
                    color: #28a745;
                    margin-bottom: 8px;
                    font-size: 1rem;
                }
                
                .detail-group p {
                    font-weight: 600;
                    color: #495057;
                }
                
                .items-section {
                    padding: 30px;
                }
                
                .items-section h2 {
                    color: #28a745;
                    margin-bottom: 20px;
                    font-size: 1.5rem;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 10px;
                }
                
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .items-table th {
                    background: #28a745;
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }
                
                .items-table td {
                    padding: 15px;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .items-table tr:nth-child(even) {
                    background: #f8f9fa;
                }
                
                .items-table tr:hover {
                    background: #e9ecef;
                }
                
                .total-section {
                    padding: 30px;
                    background: #f8f9fa;
                    border-top: 2px solid #e9ecef;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    font-size: 1.1rem;
                }
                
                .total-amount {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #28a745;
                    border-top: 2px solid #28a745;
                    padding-top: 15px;
                }
                
                .footer {
                    padding: 30px;
                    text-align: center;
                    background: #343a40;
                    color: white;
                }
                
                .footer p {
                    margin-bottom: 10px;
                }
                
                .footer .highlight {
                    color: #28a745;
                    font-weight: 600;
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    
                    .invoice-container {
                        box-shadow: none;
                        border-radius: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <h1>🌾 Promode Agro Farms</h1>
                    <p>Fresh & Organic Products</p>
                </div>
                
                <div class="invoice-details">
                    <div class="invoice-grid">
                        <div class="detail-group">
                            <h3>📋 Order Information</h3>
                            <p><strong>Order ID:</strong> ${orderData.id || 'N/A'}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                            <p><strong>Time:</strong> ${new Date().toLocaleTimeString('en-IN')}</p>
                        </div>
                        <div class="detail-group">
                            <h3>👤 Customer Details</h3>
                            <p><strong>Name:</strong> ${orderData.customerName || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${orderData.phoneNumber || 'N/A'}</p>
                            <p><strong>Address:</strong> ${orderData.address || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="items-section">
                    <h2>🛒 Order Items</h2>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Price (₹)</th>
                                <th>Quantity</th>
                                <th>Subtotal (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>₹${item.price}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.subtotal}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="total-section">
                    <div class="total-row">
                        <span>Total Amount:</span>
                        <span class="total-amount">₹${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for choosing <span class="highlight">Promode Agro Farms</span>!</p>
                    <p>🌱 Fresh from farm to your table</p>
                    <p>📞 Contact: +91-XXXXXXXXXX | 📧 info@promodeagro.com</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set content and wait for it to load
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        // Generate PDF with high quality settings
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            },
            preferCSSPageSize: true
        });
        
        // Close browser
        await browser.close();
        
        return pdfBuffer;
        
    } catch (error) {
        console.error('Error generating PDF with Puppeteer:', error);
        throw new Error('Failed to generate PDF');
    }
}

module.exports = { generateBillImage };