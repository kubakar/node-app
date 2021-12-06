const mongoose = require("mongoose");
const utils = require("../utils");
const Schema = mongoose.Schema; // data description

// define blueprint (like a class)

const userSchema = new Schema({
  // title : String, // simple declaration
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    // embedded document helps with relation
    items: [
      // array of...
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
          // schema type (ObjectId) - a reference to "Product" model
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

// adding prods to the cart
userSchema.methods.addToCart = function (product) {
  // has to be 'function' decl. because of 'this', 'this' = schematic model

  let newQuantity = 1; // default

  // check if product is already added (find array index of that element)
  const cartProduct = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
    // watch out for types !! (strings only)
  });

  // cart is available by default
  const updatedCartItems = [...this.cart.items]; // copy

  // prod. already is added to the cart
  if (cartProduct >= 0) {
    newQuantity = this.cart.items[cartProduct].quantity + 1;
    updatedCartItems[cartProduct].quantity = newQuantity;
  } // or add to cart
  else
    updatedCartItems.push({
      productId: product._id, // mongoose will wrap this into 'ObjectId'
      quantity: newQuantity,
    });

  // overwrite updated cart (which will be saved to DB)
  this.cart = { items: updatedCartItems };

  // update current user (with cart)
  // **********
  return this.save();
};

// another instance method
userSchema.methods.deleteFromCart = function (prodId) {
  if (prodId) {
    // exclude deleted item
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== prodId.toString()
    );

    this.cart = { items: updatedCartItems };
  } else {
    // if parameter not passed - delete all
    this.cart = { items: [] };
  }
  // update current user (with cart)
  // **********
  return this.save();
};

// another instance method
userSchema.methods.updateCart = function () {
  // method with population

  let productItems = [];

  // utils.log(this.cart.items);
  const originalCart = JSON.parse(JSON.stringify(this.cart.items));

  // Populating on an already fetched document (user)
  return (
    this.populate("cart.items.productId") // show a path down (despite the fact 'items' is an array)
      // 2020 update => Doc.populate() returns a promise now - 'execPopulate' is gone
      .then((populatedUser) => {
        // utils.log(populatedUser.cart.items);

        let allProdsAvailable = true;

        // mongoose object has some internal params, use '._doc' for DB data only
        productItems = populatedUser.cart.items
          .filter((i) => {
            // check if there are deleted products in the cart (null)
            if (i.productId) return true;
            else allProdsAvailable = false;
          })
          .map((i) => {
            return { ...i.productId._doc, quantity: i.quantity };
          });

        // utils.log(productItems); // test 1

        // escape clause (DB cart is consistent)
        if (allProdsAvailable) {
          utils.log("Cart is up to date");
          return productItems;
        }

        // **********
        utils.warn("Cart is inconsistent and will be rebuild");

        // check which cart products exist in products collection
        // double loop, original cart will be trimmed now
        const updatedCartItems = originalCart.filter((i) => {
          // returns true if any of the elements in the array pass the test
          return productItems.some(
            (pi) => i.productId.toString() === pi._id.toString()
          );
        });
        utils.log(updatedCartItems); // // test 2 (comparison)

        this.cart = { items: updatedCartItems };
        // update current user (with up-to-date products in the cart)
        // **********
        return this.save();
      })
      .then((result) => productItems) // return products to render now
      .catch((err) => console.log(err))
  );
};

// another instance method
userSchema.methods.testMe = function () {
  utils.warn("USER - SESSION TEST");
};

// ******
// EXPORT
// Mongoose defines model for application (name, Schema);
module.exports = mongoose.model("User", userSchema);
// this automatically creates a "users" collection in your DB cluster
