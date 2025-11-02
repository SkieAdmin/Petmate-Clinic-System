const express = require('express');
const router = express.Router();
const itemController = require('../controllers/items.controller');

// GET /api/items - Get all items (with optional search and lowStockOnly filter)
router.get('/', itemController.getAllItems);

// GET /api/items/low-stock - Get low stock items
router.get('/low-stock', itemController.getLowStockItems);

// GET /api/items/:id - Get item by ID
router.get('/:id', itemController.getItemById);

// POST /api/items - Create new item
router.post('/', itemController.createItem);

// PUT /api/items/:id - Update item
router.put('/:id', itemController.updateItem);

// PATCH /api/items/:id/quantity - Update item quantity
router.patch('/:id/quantity', itemController.updateItemQuantity);

// DELETE /api/items/:id - Delete item
router.delete('/:id', itemController.deleteItem);

module.exports = router;
