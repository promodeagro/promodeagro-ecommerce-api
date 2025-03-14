const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
require('dotenv').config();

exports.handler = async (event) => {
    const { userId } = event.queryStringParameters || {};

    const categories = [
        { category: 'Bengali Special', subcategory: 'Bengali Vegetables' },
        { category: 'Fresh Fruits', subcategory: 'Daily Fruits' },
        { category: 'Fresh Vegetables', subcategory: 'Daily Vegetables' }
    ];

    try {
        const result = [];

        for (const { category, subcategory } of categories) {
            const params = {
                TableName: process.env.PRODUCTS_TABLE,
                IndexName: 'subCategoryIndex',
                KeyConditionExpression: 'subCategory = :subcategory',
                ExpressionAttributeValues: {
                    ':subcategory': subcategory,
                },
               
            };

            const data = await docClient.query(params).promise();
            let products = data.Items || [];

            const productMap = {};
            products.forEach(product => {
                if (product.isVariant && product.parentProductId) {
                    if (!productMap[product.parentProductId]) {
                        productMap[product.parentProductId] = [];
                    }
                    productMap[product.parentProductId].push(product);
                } else {
                    productMap[product.id] = [];
                }
            });

            const groupedProducts = products
                .filter(product => !product.isVariant)
                .map(product => {
                    const variations = (productMap[product.id] || []).map(variant => ({
                        id: variant.id,
                        name: variant.name || '',
                        category: variant.category || '',
                        subCategory: variant.subCategory || '',
                        image: variant.image || '',
                        images: variant.images || [],
                        description: variant.description || '',
                        availability: variant.availability || false,
                        tags: variant.tags || [],
                        price: variant.sellingPrice || 0,
                        mrp: variant.comparePrice || 0,
                        unit: variant.units || '',
                        inCart: false,
                        inWishlist: false,
                        cartItem: {
                            ProductId: variant.id,
                            UserId: userId || 'defaultUserId',
                            Savings: 0,
                            QuantityUnits: 0,
                            Subtotal: 0,
                            Price: variant.sellingPrice || 0,
                            Mrp: variant.comparePrice || 0,
                            Quantity: 0,
                            productImage: variant.image || '',
                            productName: variant.name || '',
                        }
                    }));

                    return {
                        id: product.id,
                        name: product.name || '',
                        category: product.category || '',
                        subCategory: product.subCategory || '',
                        image: product.image || '',
                        images: product.images || [],
                        description: product.description || '',
                        availability: product.availability || false,
                        tags: product.tags || [],
                        price: product.sellingPrice || 0,
                        mrp: product.comparePrice || 0,
                        unit: product.units || '',
                        inCart: false,
                        inWishlist: false,
                        variations,
                        cartItem: {
                            ProductId: product.id,
                            UserId: userId || 'defaultUserId',
                            Savings: 0,
                            QuantityUnits: 0,
                            Subtotal: 0,
                            Price: product.sellingPrice || 0,
                            Mrp: product.comparePrice || 0,
                            Quantity: 0,
                            productImage: product.image || '',
                            productName: product.name || '',
                        }
                    };
                });

            if (userId) {
                const cartParams = {
                    TableName: process.env.CART_TABLE,
                    KeyConditionExpression: 'UserId = :userId',
                    ExpressionAttributeValues: { ':userId': userId },
                };
                const cartData = await docClient.query(cartParams).promise();
                const cartItems = cartData.Items;

                const wishlistParams = {
                    TableName: process.env.WISHLIST_TABLE,
                    KeyConditionExpression: 'UserId = :userId',
                    ExpressionAttributeValues: { ':userId': userId },
                };
                const wishlistData = await docClient.query(wishlistParams).promise();
                const wishlistItems = wishlistData.Items;
                const wishlistItemsSet = new Set(wishlistItems.map(item => item.ProductId));

                groupedProducts.forEach(product => {
                    const cartItem = cartItems.find(item => item.ProductId === product.id) || null;
                    product.inCart = !!cartItem;
                    product.inWishlist = wishlistItemsSet.has(product.id);
                    if (cartItem) {
                        product.cartItem = {
                            ProductId: cartItem.ProductId,
                            UserId: cartItem.UserId,
                            Savings: cartItem.Savings || 0,
                            QuantityUnits: cartItem.QuantityUnits || 0,
                            Subtotal: cartItem.Subtotal || 0,
                            Price: cartItem.Price || product.price,
                            Mrp: cartItem.Mrp || product.mrp,
                            Quantity: cartItem.Quantity || 0,
                            productImage: product.image || '',
                            productName: product.name || '',
                        };
                    }

                    product.variations.forEach(variant => {
                        const variantCartItem = cartItems.find(item => item.ProductId === variant.id) || null;
                        variant.inCart = !!variantCartItem;
                        variant.inWishlist = wishlistItemsSet.has(variant.id);
                        if (variantCartItem) {
                            variant.cartItem = {
                                ProductId: variantCartItem.ProductId,
                                UserId: variantCartItem.UserId,
                                Savings: variantCartItem.Savings || 0,
                                QuantityUnits: variantCartItem.QuantityUnits || 0,
                                Subtotal: variantCartItem.Subtotal || 0,
                                Price: variantCartItem.Price || variant.price,
                                Mrp: variantCartItem.Mrp || variant.mrp,
                                Quantity: variantCartItem.Quantity || 0,
                                productImage: variant.image || '',
                                productName: variant.name || '',
                            };
                        }
                    });
                });
            }
            
            groupedProducts.sort((a, b) => b.availability - a.availability);
            result.push({
                category,
                subcategory,
                items: groupedProducts,
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
