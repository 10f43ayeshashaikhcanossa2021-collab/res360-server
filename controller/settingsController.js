import Settings from "../models/Settings.js";

// Default settings values
const defaultSettings = {
  branchName: "Restaurant360 - Main Branch",
  taxRate: 5,
  currency: "INR",
  printerEnabled: true,
  autoPrintKOT: true,
  enableLoyalty: true,
  theme: "dark",
};

// ==========================================
// 1. GET SETTINGS: Persistent settings fetch karna
//    URL: /api/settings
// ==========================================
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Agar database me settings document nahi hai toh default create karo
    if (!settings) {
      settings = await Settings.create(defaultSettings);
    }

    res.json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. UPDATE SETTINGS: Settings update / save karna
//    URL: /api/settings
// ==========================================
export const updateSettings = async (req, res) => {
  try {
    const updated = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true } // Document nahi mila toh create karega, naya data return karega
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. RESET SETTINGS: Settings ko default pe reset karna
//    URL: /api/settings/reset
// ==========================================
export const resetSettings = async (req, res) => {
  try {
    const reset = await Settings.findOneAndUpdate(
      {},
      { $set: defaultSettings },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Settings reset to default values",
      data: reset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
