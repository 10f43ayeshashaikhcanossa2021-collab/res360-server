import express from 'express';

import {
  getHealthCheck,
  getDashboardSummary,
  getMenu,
  getMenuCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  createCategory,
  getAddonGroups,
  createAddonGroup,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  getLowStockInventory,
  getTables,
  createTable,
  updateTableStatus,
  deleteTable,
  getKdsTickets,
  advanceKdsTicket,
  toggleKdsItemCheck,
  getCustomers,
  getCustomerById,
  getReports,
  getSaleReport,
  getOrders,
  createOrder,
  getSettings,
  updateSettings,
  getChatbotSuggestions,
  sendChatbotMessage
} from '../controller/apiController.js';

const router = express.Router();

router.get('/health', getHealthCheck);

router.get('/dashboard', getDashboardSummary);
router.get('/dashboard/summary', getDashboardSummary);

router.get('/menu', getMenu);
router.get('/menu/categories', getMenuCategories);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/categories', getProductCategories);
router.post('/categories', createCategory);

router.get('/addons', getAddonGroups);
router.post('/addons', createAddonGroup);

router.get('/inventory', getInventory);
router.get('/inventory/low-stock', getLowStockInventory);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);

router.get('/tables', getTables);
router.post('/tables', createTable);
router.put('/tables/:id/status', updateTableStatus);
router.delete('/tables/:id', deleteTable);

router.get('/kds/tickets', getKdsTickets);
router.put('/kds/tickets/:id/advance', advanceKdsTicket);
router.put('/kds/tickets/:id/items/:itemId/check', toggleKdsItemCheck);

router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);

router.get('/orders', getOrders);
router.post('/orders', createOrder);

router.get('/reports', getReports);
router.get('/reports/sales', getSaleReport);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.get('/chatbot', getChatbotSuggestions);
router.post('/chatbot/message', sendChatbotMessage);

export default router;