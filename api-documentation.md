
# E-commerce API DOCUMENTATION


## API Endpoint: RegisterUser

This endpoint is used to register user.

## Method

- **Method**: POST

## URL

- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/register`

## Content-Type

- **Content-Type**: `application/json`

## Request Body

The request body should be a JSON object with the following fields:

```json
{
  "name": "string",
  "mobileNumber": "string",
  "password":"string"
}
```

### name: The name of the user. Required. 
### mobileNumber: The phone number of the user. Required.
### password: The password of the user. Requires.



## API Endpoint: Login user

This endpoint is used to login user.

## Method

- **Method**: POST

## URL

- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/login`

## Content-Type

- **Content-Type**: `application/json`

## Request Body

The request body should be a JSON object with the following fields:

```json
{
  "mobileNumber": "string",
  "password":"string"
}
```

### mobileNumber: The phone number of the user. Required.
### password: The password of the user. Requires.





## API Endpoint: addItemsCart

This endpoint is used to add products Items in cart.

## Method

- **Method**: POST

## URL

- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/cart/addItem`  

## Content-Type

- **Content-Type**: `application/json`

## Request Body

The request body should be a JSON object with the following fields:

```json
{
  "userId": "string",
  "productId": "string",
  "quantity": "string"
}

```

## API Endpoint: Update Cart Item

Updates the quantity of an item in the user's cart .

## Method

- **Method**: PUT

## URL

- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/cart/updateItem`  

## Content-Type

- **Content-Type**: `application/json`

## Request Body

The request body should be a JSON object with the following fields:

```json
{
  "userId": "string",
  "productId": "string",
  "quantity": "string"
}

```

## API Endpoint: Delete Cart Item

Deletes an item from the user's cart.

## Method

- **Method**: DELETE

## URL

- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/cart/deleteItem`  

## Content-Type

- **Content-Type**: `application/json`

## Request Body

The request body should be a JSON object with the following fields:

```json
{
  "userId": "string",
  "productId": "string",
}

```


## API Endpoint: Get Cart Item

Retrieves all items in the user's cart.

## Method

- **Method**: GET

## URL

- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/cart/getItems/{userId}`  



## API Endpoint: Get All Products

### Method
- **Method**: GET

### URL
- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/product`

---

## API Endpoint: Create Order

### Method
- **Method**: POST

### URL
- **URL**: `https://khs9kwylpc.execute-api.us-east-1.amazonaws.com/order`

### Content-Type
- **Content-Type**: `application/json`

### Request Body
The request body should be a JSON object with the following fields:
```json
{
  "totalPrice": "string",
  "address": "string",
  "status": "string",
  "paymentMethod": "string",
  "paymentDetails": "string",
  "id": "string",
  "items": [
    {
      "productId": "string",
      "quantity": "string"
    },
    {
      "productId": "string",
      "quantity": "string"
    }
  ],
  "customerId": "string"
}
```