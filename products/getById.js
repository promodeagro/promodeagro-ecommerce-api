'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  // Add your configuration options here
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.getProductById = async (event) => {
  try {
    const productId = event.pathParameters.id;
    const userId = event.queryStringParameters && event.queryStringParameters.userId;

    // Fetch product details
    const getProductParams = {
      TableName: 'Products',
      Key: {
        'id': productId
      }
    };
    const productData = await dynamoDB.get(getProductParams).promise();

    if (!productData.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    let response = {
      statusCode: 200,
      body: JSON.stringify(productData.Item),
    };

    if (userId) {
      // Check if the product exists in the user's cart
      const cartParams = {
        TableName: 'CartItems',
        Key: {
          'UserId': userId,
          'ProductId': productId
        }
      };
      const cartData = await dynamoDB.get(cartParams).promise();

      const defaultCartItem = {
        ProductId: productId,
        UserId: userId,
        Savings: 0,
        QuantityUnits: 0,
        Subtotal: 0,
        Price: 0,
        Mrp: 0,
        Quantity: 0,
        productImage: productData.Item.image || '',
        productName: productData.Item.name || ''
      };

      if (cartData.Item) {
        // If product exists in cart, add cart information to response
        response.body = JSON.stringify({
          ...productData.Item,
          inCart: true,
          cartItem: cartData.Item
        });
      } else {
        // If product does not exist in cart, return basic product details with default cart item
        response.body = JSON.stringify({
          ...productData.Item,
          inCart: false,
          cartItem: defaultCartItem
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch product', error }),
    };
  }
};
