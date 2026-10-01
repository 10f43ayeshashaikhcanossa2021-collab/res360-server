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
  getAddonGroups,
  createAddonGroup,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  getLowStockInventory,
  getTables,
  createTable,
  updateTableStatus,
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

import {
  getKdsTickets,
  getKdsTicketById,
  createKdsTicket,
  advanceKdsTicket,
  toggleKdsItemCheck,
  deleteKdsTicket
} from '../controller/kdsController.js';

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory
} from '../controller/categoryController.js';

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

// Category Routes (CRUD)
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.put('/categories/:id/status', updateCategoryStatus);
router.delete('/categories/:id', deleteCategory);

router.get('/addons', getAddonGroups);
router.post('/addons', createAddonGroup);

router.get('/inventory', getInventory);
router.get('/inventory/low-stock', getLowStockInventory);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);

router.get('/tables', getTables);
router.post('/tables', createTable);
router.put('/tables/:id/status', updateTableStatus);

// KDS Routes (CRUD)
router.get('/kds/tickets', getKdsTickets);
router.get('/kds/tickets/:id', getKdsTicketById);
router.post('/kds/tickets', createKdsTicket);
router.put('/kds/tickets/:id/advance', advanceKdsTicket);
router.put('/kds/tickets/:id/items/:itemId/check', toggleKdsItemCheck);
router.delete('/kds/tickets/:id', deleteKdsTicket);

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