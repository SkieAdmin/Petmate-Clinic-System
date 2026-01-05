const purchaseOrderService = require('../services/purchaseOrders.service');
const asyncHandler = require('../utils/asyncHandler');

class PurchaseOrderController {
  getAllPurchaseOrders = asyncHandler(async (req, res) => {
    const { supplierId, status, startDate, endDate } = req.query;
    const purchaseOrders = await purchaseOrderService.getAllPurchaseOrders({ supplierId, status, startDate, endDate });
    res.status(200).json({ success: true, count: purchaseOrders.length, data: purchaseOrders });
  });

  getPurchaseOrderById = asyncHandler(async (req, res) => {
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, data: purchaseOrder });
  });

  createPurchaseOrder = asyncHandler(async (req, res) => {
    const { supplierId, items } = req.body;
    if (!supplierId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Supplier ID and items are required' });
    }
    const purchaseOrder = await purchaseOrderService.createPurchaseOrder(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Purchase order created successfully', data: purchaseOrder });
  });

  updatePurchaseOrder = asyncHandler(async (req, res) => {
    const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Purchase order updated successfully', data: purchaseOrder });
  });

  deletePurchaseOrder = asyncHandler(async (req, res) => {
    await purchaseOrderService.deletePurchaseOrder(req.params.id);
    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
  });

  approvePurchaseOrder = asyncHandler(async (req, res) => {
    const purchaseOrder = await purchaseOrderService.approvePurchaseOrder(req.params.id);
    res.status(200).json({ success: true, message: 'Purchase order approved', data: purchaseOrder });
  });

  cancelPurchaseOrder = asyncHandler(async (req, res) => {
    const purchaseOrder = await purchaseOrderService.cancelPurchaseOrder(req.params.id);
    res.status(200).json({ success: true, message: 'Purchase order cancelled', data: purchaseOrder });
  });
}

module.exports = new PurchaseOrderController();
