import Order from "../models/Order.js";
import { createOrderAndTicket } from "../services/orderService.js";
import { createKdsTicket } from "./kdsController.js";

// ==========================================
// 1. READ ALL: Saare orders fetch karna (GET)
//    Support query filter, e.g. /api/orders?status=Pending
// ==========================================
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    // Agar frontend se status filter aaya ho toh filter lagao
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Newest orders pehle dikhane ke liye sort by createdAt: -1
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 2. READ ONE: Single order details fetch karna (GET)
//    URL: /api/orders/:id (Accepts MongoDB _id or ORD-XXXX)
// ==========================================
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Order ko MongoDB _id ya unique string orderId dono se search karo
    const order = await Order.findOne({
      $or: [
        { orderId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order nahi mila (Order not found).",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 3. CREATE: Naya order punch karna (POST)
//    URL: /api/orders
// ==========================================
export const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      tableId = null,
      userId = null,
      table = "Takeaway",
      items = [],
      taxRate = 5,
      discount = 0,
      sendKitchen = true,
    } = req.body;

    // 1. Check karo items list khali toh nahi hai
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order me kam se kam ek item hona zaroori hai.",
      });
    }

    // 2. Agar restaurantId nahi aayi toh fallback default create karo
    let resId = restaurantId;
    if (!resId) {
      // Direct order creation fallback agar restaurantId frontend ne nahi bheji
      const count = await Order.countDocuments();
      const orderId = `ORD-${1001 + count}`;

      let total = 0;
      const orderItems = items.map((it) => {
        const itemPrice = Number(it.price || 0);
        const itemQty = Number(it.qty || it.quantity || 1);
        const sub = itemPrice * itemQty;
        total += sub;
        return {
          productId: it.productId || it._id,
          name: it.name || "Menu Item",
          qty: itemQty,
          price: itemPrice,
          subtotal: sub,
        };
      });

      const newOrder = await Order.create({
        orderId,
        table,
        tableId,
        userId,
        items: orderItems,
        itemsCount: orderItems.length,
        total,
        status: "Pending",
      });

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: newOrder,
      });
    }

    // 3. Full Service use karke Order + KDS ticket + Bill banana
    const result = await createOrderAndTicket(
      {
        restaurantId: resId,
        tableId,
        userId,
        table,
        items,
        taxRate,
        discount,
        sendKitchen,
      },
      sendKitchen ? createKdsTicket : null
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 4. UPDATE STATUS: Order status change karna (PUT)
//    URL: /api/orders/:id/status
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Allowed status list check karo
    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Served",
      "Completed",
      "Cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    // Order find karo by _id ya orderId
    const order = await Order.findOne({
      $or: [
        { orderId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order nahi mila (Order not found).",
      });
    }

    // Status update karke save karo
    order.status = status;
    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: `Order status updated to '${status}' successfully.`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// 5. DELETE: Order cancel ya delete karna (DELETE)
//    URL: /api/orders/:id
// ==========================================
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndDelete({
      $or: [
        { orderId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order nahi mila (Order not found).",
      });
    }

    res.json({
      success: true,
      message: `Order ${order.orderId} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
