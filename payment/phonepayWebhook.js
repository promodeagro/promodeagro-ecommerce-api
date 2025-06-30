const crypto = require('crypto');
require('dotenv').config();
const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const axios = require('axios');

// Set AWS region to Mumbai
process.env.AWS_REGION = 'ap-south-1';
const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        console.log('=== PhonePe Webhook Received ===');
        console.log('Raw event:', JSON.stringify(event, null, 2));
        
        // Extract headers and body
        const headers = event.headers;
        console.log('Received headers:', JSON.stringify(headers, null, 2));
        
        const body = JSON.parse(event.body);
        console.log('Received body:', JSON.stringify(body, null, 2));

        // Extract PhonePe Authorization header
        const receivedAuthHeader = headers['Authorization'] || headers['authorization'];
        console.log('Received auth header:', receivedAuthHeader);
        
        if (!receivedAuthHeader) {
            console.error('No Authorization header received');
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "No Authorization header" }),
            };
        }

        // Remove 'Bearer ' prefix if present and trim any whitespace
        const receivedHash = receivedAuthHeader.replace(/^Bearer\s+/i, '').trim();
        console.log('Received hash:', receivedHash);

        // Your configured username & password
        const USERNAME = process.env.PHONEPE_USERNAME;
        const PASSWORD = process.env.PHONEPE_PASSWORD;

        console.log('Environment check:', {
            hasUsername: !!USERNAME,
            hasPassword: !!PASSWORD,
            hasOrderTable: !!process.env.ORDER_TABLE
        });

        if (!USERNAME || !PASSWORD) {
            console.error('Missing PHONEPE_USERNAME or PHONEPE_PASSWORD environment variables');
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Server configuration error" }),
            };
        }

        // Compute SHA256(username:password)
        const expectedAuthHash = crypto.createHash('sha256').update(`${USERNAME}:${PASSWORD}`).digest('hex');
        console.log('Expected hash:', expectedAuthHash);

        // Verify the Authorization header
        if (receivedHash !== expectedAuthHash) {
            console.error("Invalid Authorization Header", {
                expected: expectedAuthHash,
                received: receivedHash
            });
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Unauthorized" }),
            };
        }

        // Process webhook event
        console.log("Webhook Received:", JSON.stringify(body, null, 2));

        const { event: eventType, payload } = body;

        if (!eventType || !payload) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid payload" }),
            };
        }

        // Extract order ID from payload
        const orderId = payload.merchantOrderId;
        console.log("Order ID:", orderId);
        if (!orderId) {
            console.error("No order ID found in payload");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No order ID found in payload" }),
            };
        }
   console.log(eventType,"eventType ");
        // Handle different event types
        switch (eventType) {
            case "checkout.order.completed":
                console.log("Order Completed:", payload);
                await updatePaymentStatus(orderId, 'PAID');
                break;
            case "checkout.order.failed":
                console.log("Order Failed:", payload);
                await updatePaymentStatus(orderId, 'Failed');
                break;
            case "pg.refund.accepted":
            case "pg.refund.completed":
                console.log("Refund Processed:", payload);
                await updatePaymentStatus(orderId, 'Refunded');
                break;
            case "pg.refund.failed":
                console.log("Refund Failed:", payload);
                await updatePaymentStatus(orderId, 'RefundFailed');
                break;
            default:
                console.warn("Unhandled event type:", eventType);
                break;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Webhook processed successfully" }),
        };
    } catch (error) {
        console.error("Error processing webhook:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};

async function updatePaymentStatus(orderId, paymentStatus) {
    const updateParams = {
        TableName: process.env.ORDER_TABLE,
        Key: {
            id: { S: orderId }
        },
        UpdateExpression: 'SET paymentDetails.#status = :paymentStatus, orderStatus = :orderStatus',
        ExpressionAttributeValues: {
            ':paymentStatus': { S: paymentStatus },
            ':orderStatus': { S: 'Order placed' }
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    };

    console.log("Update Params:", JSON.stringify(updateParams, null, 2));

    try {
        const update = await dynamoDB.send(new UpdateItemCommand(updateParams));
        console.log("Update Response:", JSON.stringify(update, null, 2));
        console.log("Payment status updated successfully");
        return update;
    } catch (error) {
        console.error("Error updating payment status:", error);
        throw new Error(`Failed to update payment status: ${error.message}`);
    }
}

module.exports = {
    handler: exports.handler,
    updatePaymentStatus
};
