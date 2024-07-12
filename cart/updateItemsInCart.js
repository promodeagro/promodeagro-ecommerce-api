const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// Function to fetch product details from DynamoDB
async function getProductDetails(productId) {
    const params = {
        TableName: 'Products',
        Key: {
            id: productId,
        },
    };

    try {
        const data = await docClient.get(params).promise();
        return data.Item;
    } catch (error) {
        console.error('Error fetching product details:', error);
        throw error;
    }
}

// Function to check if the user exists in the Users table
async function getUserDetails(userId) {
    const params = {
        TableName: 'Users',
        Key: {
            UserId: userId,
        },
    };

    try {
        const data = await docClient.get(params).promise();
        return data.Item;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

// Function to update an existing cart item in DynamoDB
async function updateCartItem(userId, productId, quantity, quantityUnits) {
    try {
        // Fetch product details
        const product = await getProductDetails(productId);

        if (!product) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }

        // Find the appropriate unit price based on quantityUnits
        let unitPrice = null;
        for (let i = product.unitPrices.length - 1; i >= 0; i--) {
            if (quantityUnits === product.unitPrices[i].qty) {
                unitPrice = product.unitPrices[i];
                break;
            }
        }

        if (!unitPrice) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid quantity units" }),
            };
        }

        const price = unitPrice.price;
        const mrp = unitPrice.mrp;
        const savings = unitPrice.savings * quantity;

        // Calculate total quantity in grams
        const totalQuantityInGrams = quantity * quantityUnits;

        // Calculate the subtotal and total savings for the quantity
        const subtotal = price * quantity;

        // Prepare the item update parameters for DynamoDB
        const params = {
            TableName: 'CartItems',
            Key: {
                'UserId': userId,
                'ProductId': productId
            },
            UpdateExpression: 'SET Quantity = :quantity, QuantityUnits = :quantityUnits, Subtotal = :subtotal, Price = :price, Mrp = :mrp, Savings = :savings',
            ExpressionAttributeValues: {
                ':quantity': quantity,
                ':quantityUnits': quantityUnits,
                ':subtotal': subtotal,
                ':price': price,
                ':mrp': mrp,
                ':savings': savings
            },
            ReturnValues: 'UPDATED_NEW'
        };

        const data = await docClient.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Cart item updated successfully", data }),
        };
    } catch (error) {
        console.error('Error updating cart item:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error }),
        };
    }
}

exports.handler = async (event) => {
    const { userId, productId, quantity, quantityUnits } = JSON.parse(event.body);

    if (!userId || !productId || !quantity || !quantityUnits) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
        };
    }

    try {
        // Check if the user exists
        const user = await getUserDetails(userId);

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found" }),
            };
        }

        // Update the cart item
        const updateResult = await updateCartItem(userId, productId, quantity, quantityUnits);

        return {
            statusCode: updateResult.statusCode,
            body: updateResult.body,
        };
    } catch (error) {
        console.error('Error updating cart item:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
