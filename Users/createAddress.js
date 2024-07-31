const AWS = require('aws-sdk');
const crypto = require('crypto');
const docClient = new AWS.DynamoDB.DocumentClient();
require('dotenv').config();

// Function to check if user exists
async function checkUserExists(userId) {
    const params = {
        TableName: process.env.USERS_TABLE,
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

// Function to fetch apartment names based on location
async function fetchApartmentsByLocation(location) {
    const params = {
        TableName: 'Apartments', // Assume you have a table storing apartment details
        IndexName: 'Location-index', // Assume you have a secondary index on Location
        KeyConditionExpression: '#location = :location',
        ExpressionAttributeNames: {
            '#location': 'Location',
        },
        ExpressionAttributeValues: {
            ':location': location,
        },
    };

    try {
        const data = await docClient.query(params).promise();
        return data.Items.map(item => item.apartmentName);
    } catch (error) {
        if (error.code === 'ResourceNotFoundException') {
            console.warn(`No apartments found for location: ${location}`);
            return []; // Return an empty array if no apartments are found
        } else {
            console.error('Error fetching apartments by location:', error);
            throw error;
        }
    }
}

exports.handler = async (event) => {
    const { userId, addressId, addressType, location, apartmentName, BlockName, flatNo, area, Landmark } = JSON.parse(event.body);

    if (!userId || !addressType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
        };
    }

    try {
        // Check if user exists
        const userExists = await checkUserExists(userId);

        if (!userExists) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found" }),
            };
        }

        let address = {};
        const newAddressId = crypto.randomUUID();  // Generate a unique address ID if addressId is not provided

        if (addressType === 'Apartment') {
            if (!location || !apartmentName || !flatNo) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Missing required fields for apartment address" }),
                };
            }

            // Fetch all apartments based on user input location
            const availableApartments = await fetchApartmentsByLocation(location);

            // Proceed with saving the address even if the apartment name is not found
            if (availableApartments.length > 0 && !availableApartments.includes(apartmentName)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Invalid apartment name for the given location" }),
                };
            }

            address = {
                apartmentName,
                flatNo,
                location,
                BlockName,
            };
        } else if (addressType === 'Individual House') {
            if (!location || !flatNo || !area) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Missing required fields for individual address" }),
                };
            }

            address = {
                location,
                flatNo,
                area,
            };

            // Add Landmark if provided
            if (Landmark) {
                address.Landmark = Landmark;
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid address type" }),
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
            TableName: 'Addresses',
            Key: {
                userId: userId,
                addressId: addressId || newAddressId, // Use the provided addressId or generate a new one
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
