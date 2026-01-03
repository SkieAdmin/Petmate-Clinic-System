const invoiceService = require('../services/invoices.service');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceController {
  // Get all invoices
  getAllInvoices = asyncHandler(async (req, res) => {
    const { clientId, status } = req.query;
    const invoices = await invoiceService.getAllInvoices(clientId, status);

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  });

  // Get invoice by ID
  getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  });

  // Create new invoice
  createInvoice = asyncHandler(async (req, res) => {
    const { clientId, items } = req.body;

    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client ID and at least one item are required',
      });
    }

    const invoice = await invoiceService.createInvoice(req.body);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  });

  // Update invoice
  updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  });

  // Delete invoice
  deleteInvoice = asyncHandler(async (req, res) => {
    await invoiceService.deleteInvoice(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  });

  // Generate PDF invoice
  generateInvoicePDF = asyncHandler(async (req, res) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    // Header
    doc
      .fontSize(20)
      .fillColor('#2d6a4f')
      .text('VETERINARY CLINIC', 50, 50);

    doc
      .fontSize(10)
      .fillColor('#000000')
      .text('123 Main Street', 50, 80)
      .text('City, State 12345', 50, 95)
      .text('Phone: (555) 123-4567', 50, 110);

    // Invoice details
    doc
      .fontSize(16)
      .fillColor('#2d6a4f')
      .text('INVOICE', 400, 50);

    doc
      .fontSize(10)
      .fillColor('#000000')
      .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80)
      .text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 400, 95)
      .text(`Status: ${invoice.status}`, 400, 110);

    // Client information
    doc
      .fontSize(12)
      .fillColor('#2d6a4f')
      .text('BILL TO:', 50, 150);

    doc
      .fontSize(10)
      .fillColor('#000000')
      .text(invoice.client.name, 50, 170)
      .text(invoice.client.phone || '', 50, 185)
      .text(invoice.client.email || '', 50, 200)
      .text(invoice.client.address || '', 50, 215);

    // Line items table
    const tableTop = 280;
    doc
      .fontSize(10)
      .fillColor('#2d6a4f')
      .text('Item', 50, tableTop)
      .text('Quantity', 300, tableTop)
      .text('Price', 380, tableTop)
      .text('Subtotal', 460, tableTop);

    doc
      .strokeColor('#2d6a4f')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let position = tableTop + 25;

    invoice.items.forEach((item) => {
      doc
        .fillColor('#000000')
        .fontSize(9)
        .text(item.item.name, 50, position)
        .text(item.quantity.toString(), 300, position)
        .text(`₱${item.priceEach.toFixed(2)}`, 380, position)
        .text(`₱${item.subtotal.toFixed(2)}`, 460, position);

      position += 20;
    });

    // Total
    position += 20;
    doc
      .strokeColor('#2d6a4f')
      .lineWidth(1)
      .moveTo(380, position)
      .lineTo(550, position)
      .stroke();

    position += 15;
    doc
      .fontSize(12)
      .fillColor('#2d6a4f')
      .text('TOTAL:', 380, position)
      .text(`₱${invoice.totalAmount.toFixed(2)}`, 460, position);

    // Notes
    if (invoice.notes) {
      position += 50;
      doc
        .fontSize(10)
        .fillColor('#2d6a4f')
        .text('Notes:', 50, position);

      doc
        .fillColor('#000000')
        .fontSize(9)
        .text(invoice.notes, 50, position + 15, { width: 500 });
    }

    // Footer
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(
        'Thank you for your business!',
        50,
        doc.page.height - 50,
        { align: 'center', width: 500 }
      );

    // Finalize PDF
    doc.end();
  });
}

module.exports = new InvoiceController();
