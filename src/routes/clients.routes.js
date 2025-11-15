const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clients.controller');

// GET /api/clients - Get all clients (with optional search)
router.get('/', clientController.getAllClients);

// GET /api/clients/:id - Get client by ID
router.get('/:id', clientController.getClientById);

// POST /api/clients - Create new client
router.post('/', clientController.createClient);

// PUT /api/clients/:id - Update client
router.put('/:id', clientController.updateClient);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', clientController.deleteClient);

// POST /api/clients/:id/confirm-email - Confirm client email
router.post('/:id/confirm-email', clientController.confirmEmail);

module.exports = router;
