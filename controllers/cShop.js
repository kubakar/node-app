const Product = require("../models/mProduct");
const utils = require("../utils");

// logic linking model (data, core logic) and views

// render main page (with products)
module.exports.getProducts = (req, res) => {
  Product.find() // this method is coming from mongoose
    .then((products) => {
      // we get array automatically ('cursor' is requested with find().cursor() method)
      // utils.log(products);

      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All products",
      });
    })
    .catch((err) => utils.err(err));
};

// route for dynamic URLs (extract params)
module.exports.getProduct = (req, res) => {
  // extract URL param with express
  const prodID = req.params.productId; // 'productId' is declared in routes

  Product.findById(prodID) // this method is coming from mongoose
    .then((product) => {
      utils.log(product);
      // 'product' is first element of data array (destructuring)
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
      });
    })
    .catch((err) => utils.err(err));
};

// works!! :D
module.exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      // utils.log(products);

      // request holds DB user data
      req.session.user && utils.log(req.session.user);
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
      });
    })
    .catch((err) => utils.err(err));
};

module.exports.getCart = (req, res, next) => {
  // req.userMethods.testMe();

  req.userMethods
    .updateCart() // get all products data in the cart with 'populate()'
    .then((productItems) => {
      // calc sum
      const tp = productItems.reduce(
        (acc, el) => acc + el.price * el.quantity,
        0
      );
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        // list of prods
        products: productItems,
        totalPrice: tp,
      });
    })
    .catch((err) => console.log(err));
};

module.exports.cartSummary = (req, res, next) => {
  const prods = JSON.parse(req.params.products); // 'productId' is declared in routes
  const price = req.query.price; // 'productId' is declared in routes

  prodsEmail = prods.map((p, i) => {
    return `<li>Product ${i + 1} :${"\t"} <b>${p.title}</b> (quantiity : ${
      p.quantity
    })</li>`;
  });

  res.redirect("/cart");
};

module.exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((prod) => {
      // method 'add...' executed on a User object
      return req.userMethods.addToCart(prod); // own utility method 'userSchema.methods.addToCart'
      // build upon user model
    })
    .then((result) => {
      // utils.log(result);
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

module.exports.postCartDeleteItem = (req, res, next) => {
  const { prodId } = req.body; // destr.

  req.userMethods
    .deleteFromCart(prodId)
    .then((result) => {
      // utils.log(result);
      res && res.end(); // redirection declared on client JS script
    })
    .catch((err) => console.log(err));
};

// clear cart
module.exports.cleanCart = (req, res, next) => {
  req.userMethods
    .deleteFromCart() // no parameter - delete all
    .then((result) => {
      utils.log(result);

      res.render("shop/ordersPage", {
        pageTitle: "Your Orders",
      });
    })
    .catch((err) => console.log(err));
};

module.exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
  });
};
