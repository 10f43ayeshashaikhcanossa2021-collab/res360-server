import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    name: {
      type: String,
      required: true,
    },

    loyalty: {
      type: String,
      enum: ["Silver", "Gold", "Platinum"],
      default: "Silver",
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    visits: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;