const supplierService = require('../services/suppliers.service');
const asyncHandler = require('../utils/asyncHandler');

class SupplierController {
  getAllSuppliers = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const suppliers = await supplierService.getAllSuppliers(search);
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  });

  getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await supplierService.getSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.status(200).json({ success: true, data: supplier });
  });

  createSupplier = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
  });

  updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Supplier updated successfully', data: supplier });
  });

  deleteSupplier = asyncHandler(async (req, res) => {
    await supplierService.deleteSupplier(req.params.id);
    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  });

  getActiveSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await supplierService.getActiveSuppliers();
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  });

  updateItemPrice = asyncHandler(async (req, res) => {
    const { itemId, price } = req.body;
    if (!itemId || !price) {
      return res.status(400).json({ success: false, message: 'Item ID and price are required' });
    }
    const result = await supplierService.updateItemPrice(req.params.id, itemId, price);
    res.status(200).json({ success: true, message: 'Item price updated successfully', data: result });
  });

  getItemPriceComparison = asyncHandler(async (req, res) => {
    const prices = await supplierService.getItemPriceComparison(req.params.itemId);
    res.status(200).json({ success: true, count: prices.length, data: prices });
  });
}

module.exports = new SupplierController();
