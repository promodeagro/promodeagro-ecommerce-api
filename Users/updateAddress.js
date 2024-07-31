const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
require('dotenv').config();

// Function to check if user exists
async function checkUserExists(userId) {
    const params = {
        TableName: process.env.USERS_TABLE, // Replace with your actual Users table name
        Key: {
            UserId: userId,
        },
    };

    try {
        const data = await docClient.get(params).promise();
        return !!data.Item;
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    }
}

exports.handler = async (event) => {
    const {
        userId,
        addressId,
        addressType,
        apartmentName,
        flatNo,
        Area,
        Landmark,  // Optional field
        BlockName, // Optional field
        cityName   // Optional field
    } = JSON.parse(event.body);

    // Basic validation
    if (!userId || !addressId || !addressType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
        };
    }

    let address = {};

    // Address construction based on address type
    if (addressType === 'Apartment') {
        if (!apartmentName || !flatNo || !Area) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields for apartment address" }),
            };
        }

        address = {
            apartmentName,
            flatNo,
            Area,
            BlockName, // Optional, only included if provided
            cityName   // Optional, only included if provided
        };

    } else if (addressType === 'Individual House') {
        if (!flatNo || !Area || !cityName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields for individual house address" }),
            };
        }

        address = {
            flatNo,
            Area,
            cityName,
            Landmark  // Optional, only included if provided
        };

    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid address type" }),
        };
    }

    // Remove undefined or null fields
    Object.keys(address).forEach(key => {
        if (address[key] === undefined || address[key] === null) {
            delete address[key];
        }
    });

    try {
        // Check if user exists
        const userExists = await checkUserExists(userId);

        if (!userExists) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found" }),
            };
        }

        // Build the UpdateExpression dynamically based on the provided fields in 'address'
        let updateExpression = 'set ';
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        Object.keys(address).forEach((key, index) => {
            const attrName = `#attr${index}`;
            const attrValue = `:val${index}`;
            updateExpression += `${attrName} = ${attrValue}, `;
            expressionAttributeNames[attrName] = key;
            expressionAttributeValues[attrValue] = address[key];
        });

        // Remove the trailing comma and space from the UpdateExpression
        updateExpression = updateExpression.slice(0, -2);

        const params = {
            TableName: process.env.ADDRESS_TABLE, // Replace with your actual Addresses table name
            Key: {
                userId: userId,
                addressId: addressId,
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW',
        };

        const result = await docClient.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Address updated successfully", updatedAttributes: result.Attributes }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
