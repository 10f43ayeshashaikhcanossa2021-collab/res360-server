import Table from "../models/Table.js";

// Default initial tables agar database empty ho
const defaultTables = [
  { tableId: "T1", floor: "Ground Floor", seats: 4, status: "available" },
  { tableId: "T2", floor: "Ground Floor", seats: 2, status: "occupied" },
  { tableId: "T3", floor: "Ground Floor", seats: 6, status: "available" },
  { tableId: "T4", floor: "Ground Floor", seats: 4, status: "billing" },
  { tableId: "T5", floor: "First Floor", seats: 4, status: "available" },
  { tableId: "T6", floor: "First Floor", seats: 8, status: "reserved" },
  { tableId: "T7", floor: "Rooftop", seats: 2, status: "available" },
  { tableId: "T8", floor: "Rooftop", seats: 4, status: "cleaning" },
];

// ==========================================
// 1. READ ALL: Saare tables fetch karna (Floor-wise group karke)
//    URL: /api/tables
// ==========================================
export const getTables = async (req, res) => {
  try {
    let tables = await Table.find().sort({ tableId: 1 });

    // Agar database me ek bhi table nahi hai, toh default tables daal do
    if (tables.length === 0) {
      tables = await Table.insertMany(defaultTables);
    }

    // Frontend Tables.jsx expects floor-grouped object: { "Ground Floor": [...], "First Floor": [...] }
    const grouped = {};
    tables.forEach((t) => {
      const floorName = t.floor || "Ground Floor";
      if (!grouped[floorName]) {
        grouped[floorName] = [];
      }
      grouped[floorName].push({
        _id: t._id,
        id: t.tableId,
        tableId: t.tableId,
        floor: t.floor,
        seats: t.seats,
        status: t.status,
      });
    });

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. READ ONE: Single table details by ID or tableId (GET)
//    URL: /api/tables/:id
// ==========================================
export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findOne({
      $or: [
        { tableId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table nahi mila (Table not found).",
      });
    }

    res.json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. CREATE: Naya table add karna (POST)
//    URL: /api/tables
// ==========================================
export const createTable = async (req, res) => {
  try {
    const { tableId, floorName, floor, seats = 4, status = "available" } = req.body;

    const assignedFloor = floorName || floor || "Ground Floor";

    // Auto-generate tableId agar provide nahi kiya gaya (jaise T9, T10)
    let assignedId = tableId;
    if (!assignedId) {
      const count = await Table.countDocuments();
      assignedId = `T${count + 1}`;
    }

    // Check duplicate tableId
    const existing = await Table.findOne({ tableId: assignedId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Table '${assignedId}' pehle se exist karta hai.`,
      });
    }

    const table = await Table.create({
      tableId: assignedId,
      floor: assignedFloor,
      seats: Number(seats),
      status,
    });

    res.status(201).json({
      success: true,
      message: "Table created successfully.",
      data: {
        _id: table._id,
        id: table.tableId,
        tableId: table.tableId,
        floor: table.floor,
        seats: table.seats,
        status: table.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE STATUS: Table status change karna (PUT)
//    URL: /api/tables/:id/status
// ==========================================
export const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["available", "occupied", "reserved", "billing", "cleaning"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const table = await Table.findOne({
      $or: [
        { tableId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table nahi mila (Table not found).",
      });
    }

    table.status = status;
    await table.save();

    res.json({
      success: true,
      message: `Table ${table.tableId} status updated to '${status}'.`,
      data: {
        _id: table._id,
        id: table.tableId,
        tableId: table.tableId,
        floor: table.floor,
        seats: table.seats,
        status: table.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 5. DELETE: Table delete karna with Occupied check (DELETE)
//    URL: /api/tables/:id
// ==========================================
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findOne({
      $or: [
        { tableId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table nahi mila (Table not found).",
      });
    }

    // Safety rule: Occupied table delete nahi hone dena
    if (table.status === "occupied") {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableId} occupied hai! Customer baitha hai, delete nahi kar sakte.`,
      });
    }

    await Table.deleteOne({ _id: table._id });

    res.json({
      success: true,
      message: `Table ${table.tableId} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
