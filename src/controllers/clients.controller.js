const clientService = require('../services/clients.service');
const asyncHandler = require('../utils/asyncHandler');

class ClientController {
  // Get all clients
  getAllClients = asyncHandler(async (req, res) => {
    const { search } = req.query;
    const clients = await clientService.getAllClients(search);

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  });

  // Get client by ID
  getClientById = asyncHandler(async (req, res) => {
    const client = await clientService.getClientById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  });

  // Create new client
  createClient = asyncHandler(async (req, res) => {
    const { name, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required',
      });
    }

    const client = await clientService.createClient(req.body);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  });

  // Update client
  updateClient = asyncHandler(async (req, res) => {
    const client = await clientService.updateClient(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  });

  // Delete client
  deleteClient = asyncHandler(async (req, res) => {
    await clientService.deleteClient(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  });
}

module.exports = new ClientController();
