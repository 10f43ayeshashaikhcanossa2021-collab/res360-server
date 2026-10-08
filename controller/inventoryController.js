import InventoryItem from "../models/InventoryItem.js";

// Initial seed data agar database empty ho
const defaultInventory = [
  { sku: "ING-001", item: "Tomato", category: "Vegetables", stock: 32, reorderLevel: 15, unit: "kg" },
  { sku: "ING-002", item: "Onion", category: "Vegetables", stock: 28, reorderLevel: 20, unit: "kg" },
  { sku: "ING-003", item: "Paneer", category: "Dairy", stock: 12, reorderLevel: 10, unit: "kg" },
  { sku: "ING-004", item: "Rice", category: "Grains", stock: 9, reorderLevel: 12, unit: "kg" },
  { sku: "ING-005", item: "Cheese", category: "Dairy", stock: 5, reorderLevel: 8, unit: "kg" },
  { sku: "ING-006", item: "Chicken", category: "Poultry", stock: 18, reorderLevel: 10, unit: "kg" },
];

// ==========================================
// 1. READ ALL: Saara inventory stock fetch karna (GET)
//    URL: /api/inventory
// ==========================================
export const getInventory = async (req, res) => {
  try {
    let items = await InventoryItem.find().sort({ createdAt: -1 });

    // Agar DB empty ho toh default items insert karo
    if (items.length === 0) {
      items = await InventoryItem.insertMany(defaultInventory);
    }

    // Frontend table row expects item object with 'id'
    const formatted = items.map((it) => ({
      _id: it._id,
      id: it.sku || it._id.toString(),
      sku: it.sku,
      item: it.item,
      category: it.category,
      stock: it.stock,
      reorderLevel: it.reorderLevel,
      unit: it.unit,
      createdAt: it.createdAt,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. READ LOW STOCK: Low stock alert items fetch karna (GET)
//    URL: /api/inventory/low-stock
// ==========================================
export const getLowStockInventory = async (req, res) => {
  try {
    // Items jahan stock <= reorderLevel ho
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ["$stock", "$reorderLevel"] },
    });

    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. READ ONE: Single inventory item details (GET)
//    URL: /api/inventory/:id
// ==========================================
export const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findOne({
      $or: [
        { sku: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item nahi mila.",
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 4. CREATE: Naya ingredient/item add karna (POST)
//    URL: /api/inventory
// ==========================================
export const createInventoryItem = async (req, res) => {
  try {
    const { sku, item, category, stock, reorderLevel, unit = "kg" } = req.body;

    if (!item || !category || stock === undefined || reorderLevel === undefined) {
      return res.status(400).json({
        success: false,
        message: "Item name, category, stock aur reorderLevel zaroori hain.",
      });
    }

    // Auto-generate SKU agar provide nahi kiya
    let assignedSku = sku;
    if (!assignedSku) {
      const count = await InventoryItem.countDocuments();
      assignedSku = `ING-${String(count + 1).padStart(3, "0")}`;
    }

    // Duplicate SKU check
    const existing = await InventoryItem.findOne({ sku: assignedSku });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `SKU '${assignedSku}' pehle se exist karta hai.`,
      });
    }

    const newItem = await InventoryItem.create({
      sku: assignedSku,
      item: item.trim(),
      category: category.trim(),
      stock: Number(stock),
      reorderLevel: Number(reorderLevel),
      unit,
    });

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully.",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 5. UPDATE: Stock quantity ya details edit karna (PUT)
//    URL: /api/inventory/:id
// ==========================================
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findOneAndUpdate(
      {
        $or: [
          { sku: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        ],
      },
      req.body,
      { new: true } // Return updated document
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item nahi mila.",
      });
    }

    res.json({
      success: true,
      message: "Inventory item updated successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 6. DELETE: Item remove karna (DELETE)
//    URL: /api/inventory/:id
// ==========================================
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findOneAndDelete({
      $or: [
        { sku: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item nahi mila.",
      });
    }

    res.json({
      success: true,
      message: `Item '${item.item}' deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
