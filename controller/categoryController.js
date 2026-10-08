import Category from "../models/Category.js";
import Product from "../models/Product.js";

// ==========================================
// 1. GET ALL: Saari categories fetch karna
// ==========================================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. GET BY ID: Single category fetch karna
// ==========================================
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. CREATE: Nayi category banana
// ==========================================
export const createCategory = async (req, res) => {
  try {
    const { name, description = "", color = "None", active = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    // Check duplicate name
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists.",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      color,
      active,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE: Category details edit karna
// ==========================================
export const updateCategory = async (req, res) => {
  try {
    const { name, description, color, active } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (active !== undefined) category.active = active;

    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 5. UPDATE STATUS: Quick active/inactive switch
// ==========================================
export const updateCategoryStatus = async (req, res) => {
  try {
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: "Active status is required.",
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { active: Boolean(active) },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.json({
      success: true,
      message: `Category marked as ${category.active ? "active" : "inactive"}.`,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 6. DELETE: Category delete karna (with Safety Check)
// ==========================================
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Safety check: Kisi product se link toh nahi hai?
    const productCount = await Product.countDocuments({ category: categoryId });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productCount} products are linked to it. Please reassign or delete those products first.`,
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
