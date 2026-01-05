const express = require('express');
const router = express.Router();
const creditDepositController = require('../controllers/creditDeposits.controller');

router.get('/', creditDepositController.getAllCreditDeposits);
router.get('/stats', creditDepositController.getStats);
router.get('/client/:clientId', creditDepositController.getCreditDepositsByClient);
router.get('/client/:clientId/balance', creditDepositController.getClientCreditBalance);
router.get('/:id', creditDepositController.getCreditDepositById);
router.post('/', creditDepositController.createCreditDeposit);
router.put('/:id/apply', creditDepositController.applyCreditToInvoice);
router.put('/:id/refund', creditDepositController.refundCredit);
router.delete('/:id', creditDepositController.deleteCreditDeposit);

module.exports = router;
