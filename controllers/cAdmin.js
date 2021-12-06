const Product = require("../models/mProduct");
const utils = require("../utils");

// "Add product" page with form (same as 'edit')
module.exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Products",
    buttonCaption: "Add Product",
    editing: false,
  });
};

// POST operation
module.exports.postAddProduct = (req, res) => {
  // create and add element to database

  const [title, description, price] = req.body;

  // utils.log(req.user);

  // create product via mongoose model
  const product = new Product({
    title: title,
    price: price,
    description: description,
    userId: req.session.user._id,
    // mongoose would pick up only id thanks to Schema def.
  });

  product
    .save() // this method is coming from mongoose
    .then((result) => {
      // ...technically we do not have a Promise here
      utils.log(result);
      // res.redirect("admin/products");
      // response? not yet
      res && res.end();
    })
    .catch((err) => utils.err(err));
};

module.exports.postDeleteProduct = (req, res) => {
  // utils.log(req.body);

  const { prodId } = req.body; // destr.

  Product.findByIdAndDelete(prodId) // similar method: findByIdAndRemove
    .then((result) => {
      utils.log(result);
      res && res.end(); // redirection declared on client JS script
    })
    .catch((err) => utils.err(err));
};

module.exports.getProducts = (req, res) => {
  // find associated with user
  Product.find()
    // .select("title") // this method can filter seletcted attributes from a query
    .populate("userId") // cool!
    .then((products) => {
      utils.log(products);
      res.render("admin/products", {
        pageTitle: "Products - Admin Panel",
        prods: products,
      });
    })
    .catch((err) => utils.err(err));
};

// increase price only
module.exports.getEditProduct2 = (req, res) => {
  // add special query par
  const editMode = req.query.editme; // '?editme' has to be there as query param
  if (!editMode) {
    // redundant (not really need here)
    return res.redirect("/");
  }

  const price = req.query.price; // '?price' has to be there as query param (?)

  // read prodID with additional '/: ... '
  const prodID = req.params.productId; // 'productId' is declared in routes

  Product.findById(prodID)
    .then((product) => {
      product.price++; // data attribute is changed
      return product.save(); // BD data is updated
    })
    .then((result) => {
      utils.log("PRICE HAS BEEN INCREASED");
      utils.log(result);
      res.redirect("/");
    })
    .catch((err) => utils.err(err));
};
