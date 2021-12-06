const mongoose = require("mongoose");
const Schema = mongoose.Schema; // data description

// define blueprint (like a class)
const productSchema = new Schema({
  // title : String, // simple declaration
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // a reference to "User" model
    // which is needed for 'populate()' method
    required: true,
  },
});

// Mongoose defines model for application (name, Schema);
module.exports = mongoose.model("Product", productSchema);
// this automatically creates a "products" collection in your DB cluster
