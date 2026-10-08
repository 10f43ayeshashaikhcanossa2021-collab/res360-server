import Customer from "../models/Customer.js";

// Sample initial data agar database empty ho
const initialCustomers = [
  { name: "Riya Sharma", loyalty: "Gold", totalSpent: 8450, visits: 18 },
  { name: "Aman Verma", loyalty: "Silver", totalSpent: 5320, visits: 11 },
  { name: "Mehul Patel", loyalty: "Platinum", totalSpent: 12050, visits: 21 },
];

// ==========================================
// 1. READ ALL: Saare customers fetch karna (GET)
//    URL: /api/customers
// ==========================================
export const getCustomers = async (req, res) => {
  try {
    let customers = await Customer.find().sort({ totalSpent: -1 });

    // Agar database me ek bhi customer nahi hai, toh initial seed daal do
    if (customers.length === 0) {
      customers = await Customer.insertMany(initialCustomers);
    }

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. READ ONE: Single customer details by ID (GET)
//    URL: /api/customers/:id
// ==========================================
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer nahi mila (Customer not found).",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. CREATE: Naya customer add karna (POST)
//    URL: /api/customers
// ==========================================
export const createCustomer = async (req, res) => {
  try {
    const { name, loyalty, totalSpent = 0, visits = 1, restaurantId = null } = req.body;

    // 1. Validation check
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer ka naam zaroori hai.",
      });
    }

    // 2. Auto-Tier calculation (Loyalty Program)
    // Agar frontend se loyalty nahi aayi, toh spent ke basis pe assign karo
    let assignedLoyalty = loyalty;
    if (!assignedLoyalty) {
      const spent = Number(totalSpent);
      if (spent >= 10000) {
        assignedLoyalty = "Platinum";
      } else if (spent >= 5000) {
        assignedLoyalty = "Gold";
      } else {
        assignedLoyalty = "Silver";
      }
    }

    const customer = await Customer.create({
      name: name.trim(),
      loyalty: assignedLoyalty,
      totalSpent: Number(totalSpent),
      visits: Number(visits),
      restaurantId,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE: Customer details edit karna (PUT)
//    URL: /api/customers/:id
// ==========================================
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Updated data return karega
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer nahi mila (Customer not found).",
      });
    }

    res.json({
      success: true,
      message: "Customer details updated.",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 5. DELETE: Customer delete karna (DELETE)
//    URL: /api/customers/:id
// ==========================================
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer nahi mila (Customer not found).",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
