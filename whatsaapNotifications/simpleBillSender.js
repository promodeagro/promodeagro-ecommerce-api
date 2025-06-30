const axios = require('axios');
require('dotenv').config();

const whatsappToken = process.env.FACEBOOK_ACCESS_TOKEN;

async function sendSimpleBill(phoneNumber, items, orderData) {
    try {
        // Calculate the total price and format the items
        let totalPrice = 0;
        let itemsList = items.map(item => {
            let price = parseFloat(item.price);
            let quantity = parseInt(item.quantity);
            let subtotal = price * quantity;
            totalPrice += subtotal;

            return `${item.productName} - ₹${price.toFixed(2)} x ${quantity} = ₹${subtotal.toFixed(2)}`;
        }).join('\n');

        // Format the bill content with better styling
        let billContent = `🌾 *Promode Agro Farms - Order Confirmation*

📋 *Order Details:*
• Order ID: ${orderData.id || 'N/A'}
• Customer: ${orderData.customerName || 'N/A'}
• Date: ${new Date().toLocaleDateString('en-IN')}
• Time: ${new Date().toLocaleTimeString('en-IN')}

🛒 *Order Items:*
${itemsList}

💰 *Total Amount: ₹${totalPrice.toFixed(2)}*

Thank you for choosing Promode Agro Farms! 🌱
Fresh from farm to your table.

📞 Contact: +91-XXXXXXXXXX
📧 info@promodeagro.com`;

        const data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phoneNumber,
            "type": "text",
            "text": {
                "body": billContent.trim()
            }
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v19.0/208582795666783/messages',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${whatsappToken}`
            },
            data: data
        };

        const response = await axios.request(config);
        console.log("Simple bill sent successfully:", response.data);
        return response.data;
        
    } catch (error) {
        console.error('Error sending simple bill:', error);
        throw error;
    }
}

module.exports = { sendSimpleBill }; 