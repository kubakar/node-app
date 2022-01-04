const Product = require("../models/mProduct");
const Order = require("../models/mOrder");

const utils = require("../utils");

const fs = require("fs");
const path = require("path");

// PDF creator
const PDFDocument = require("pdfkit");

// global constants
const ITEMS_PER_PAGE = 3;

// products etc...
// ===============================
// CONTROLLER
// logic linking model (data, core logic) and views

// route for dynamic URLs (extract params)
module.exports.getProduct = (req, res) => {
  // extract URL param with express
  const prodID = req.params.productId; // 'productId' is declared in routes

  // ObjectID is build automatically from string in mongoose

  Product.findById(prodID) // this method is coming from mongoose
    .then((product) => {
      utils.log(product);
      // 'product' is first element of data array (destructuring)
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
      });
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

// main page
module.exports.getIndex = (req, res, next) => {
  // *******************************************
  // add pagination (via query parameter 'page')
  const page = +req.query.page || 1;
  // skip some products at the beginning
  const skippedAmount = (page - 1) * ITEMS_PER_PAGE;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((amount) => {
      //
      totalItems = amount;
      // 'skip()' & 'limit()' method to introduce pagination
      return Product.find().skip(skippedAmount).limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      // utils.log(products);

      // request holds DB user data
      // utils.log(req.userWithMethods);
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        totalItems: totalItems,
        // include pagination info
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
      });
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

module.exports.getCart = (req, res, next) => {
  // req.userWithMethods.testMe();

  req.userWithMethods
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
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

module.exports.cartSummary = (req, res, next) => {
  const prods = JSON.parse(req.params.products); // 'productId' is declared in routes
  const price = req.query.price; // 'productId' is declared in routes

  prodsEmail = prods.map((p, i) => {
    return `<li>Product ${i + 1} :${"\t"} <b>${p.title}</b> (quantiity : ${
      p.quantity
    })</li>`;
  });

  utils.log(price);

  utils.emailSender(
    "jakubkaras89@gmail.com",
    "Node App - your cart summary",
    `<h3>Your cart :</h3>
    <ul>${prodsEmail.join("\n")}</ul>
    <hr/>
    <p>Total Price : <b>$${price}</b></p>`
  );

  res.redirect("/cart");
};

module.exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((prod) => {
      // method 'add...' executed on a User object
      return req.userWithMethods.addToCart(prod); // own utility method 'userSchema.methods.addToCart'
      // build upon user model
    })
    .then((result) => {
      // utils.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

module.exports.postCartDeleteItem = (req, res, next) => {
  const { prodId } = req.body; // destr.

  req.userWithMethods
    .deleteFromCart(prodId)
    .then((result) => {
      // utils.log(result);
      res && res.end(); // redirection declared on client JS script
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

module.exports.cartDeleteItem = (req, res, next) => {
  // 'delete' method has no 'body' part
  const prodId = req.params.productId; // destr.

  req.userWithMethods
    .deleteFromCart(prodId)
    .then((result) => {
      // utils.log(result.cart);
      // return valid data to page
      res.status(205).send(); // .json()
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

// clear cart
module.exports.cleanCart = (req, res, next) => {
  req.userWithMethods
    .deleteFromCart() // no parameter - delete all
    .then((result) => {
      utils.log(result);

      // res.render("shop/ordersPage", {
      //   pageTitle: "Your Orders",
      // });
      res.redirect("/cart");
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

// file download & PDF creation via stream
module.exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  // find order
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.userWithMethods._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      // const invoiceName = `invoice_${Date.now()}.pdf`;
      const invoiceName = `invoice_${Date.now()}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);

      // read entire content into memory
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) return next(err);

      //   res.setHeader("Content-Type", "application/pdf"); // important!
      //   res.setHeader("Content-Disposition", 'attachment; filename="Faktura.pdf"'); // download instead of display
      //   // send file to client
      //   res.send(data);
      // });

      // create new PDF document (stream)
      const pdfDoc = new PDFDocument();

      // res.setHeader("Content-Type", "application/pdf"); // important!
      // res.setHeader("Content-Disposition", 'inline; filename="Faktura.pdf"');

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      // create PDF content
      pdfDoc.fontSize(26).text("Invoice", { underline: true });
      pdfDoc.text("Order nr : " + orderId);
      pdfDoc.text("-----------------------");

      let totalPrice = 0;

      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
          );
      });

      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      // ******************
      pdfDoc.end(); // terminate stream

      // delete PDF afterwards (OPTIONAL & TESTING)
      setTimeout(() => {
        fs.unlink(invoicePath, (err) => {
          utils.warn("Test PDF has been deleted.");
        });
      }, 2000);
    })
    .catch((err) => next(err));
};

// file download (stream)
module.exports.getInvoiceStream = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = "opel.pdf";
  const invoicePath = path.join("data", "invoices", invoiceName);

  const file = fs.createReadStream(invoicePath);

  res.setHeader("Content-Type", "application/pdf"); // important!
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="historia_pojazdu.pdf"'
  ); // download instead of display
  // res.setHeader("Content-Disposition", 'inline; filename="Faktura.pdf"'); // display

  // forward streamed data to res (which is 'writeable stream')
  file.pipe(res);
};

// ****************
// ORDERS

exports.postOrder = (req, res, next) => {
  // show a path down (despite the fact 'items' is an array)
  req.userWithMethods
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          // email: req.user.email,
          userId: req.userWithMethods,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.userWithMethods.deleteFromCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.userWithMethods._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      utils.err(err);
      const error = new Error("Error handling test");
      error.httpStatusCode = 500; // extra
      return next(error); // next() called with argument is error handler itself (see 'app.js')
    });
};
