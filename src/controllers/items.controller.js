const itemService = require('../services/items.service');
const asyncHandler = require('../utils/asyncHandler');

class ItemController {
  // Get all items
  getAllItems = asyncHandler(async (req, res) => {
    const { search, lowStockOnly } = req.query;
    const items = await itemService.getAllItems(search, lowStockOnly === 'true');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  });

  // Get low stock items
  getLowStockItems = asyncHandler(async (req, res) => {
    const items = await itemService.getLowStockItems();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  });

  // Get item by ID
  getItemById = asyncHandler(async (req, res) => {
    const item = await itemService.getItemById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  });

  // Create new item
  createItem = asyncHandler(async (req, res) => {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name and price are required',
      });
    }

    const item = await itemService.createItem(req.body);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  });

  // Update item
  updateItem = asyncHandler(async (req, res) => {
    const item = await itemService.updateItem(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  });

  // Update item quantity
  updateItemQuantity = asyncHandler(async (req, res) => {
    const { quantityChange } = req.body;

    if (quantityChange === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity change is required',
      });
    }

    const item = await itemService.updateItemQuantity(req.params.id, quantityChange);

    res.status(200).json({
      success: true,
      message: 'Item quantity updated successfully',
      data: item,
    });
  });

  // Delete item
  deleteItem = asyncHandler(async (req, res) => {
    await itemService.deleteItem(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  });
}

module.exports = new ItemController();
