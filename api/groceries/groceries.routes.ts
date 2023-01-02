const express = require('express');
const route = express.Router();

const { getItems } = require('./groceries.controllers');

route.get('/', getItems);

export { route as groceriesRoute };