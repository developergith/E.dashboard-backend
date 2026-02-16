const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");

const app = express();
const port = 5000;
const jwtKey = "e-comm";

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ===== REGISTER API =====
app.post("/register", async (req, res) => {
   try {
      let user = new User(req.body);
      let result = await user.save();
      result = result.toObject();
      delete result.password;
      res.send(result);
   } catch (err) {
      res.status(500).send({ error: err.message });
   }
});

// ===== LOGIN API (FIXED) =====
app.post("/login", async (req, res) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         return res.status(400).json({ result: "Email or password missing" });
      }

      const user = await User.findOne({ email });

      if (!user) {
         return res.status(404).json({ result: "User not found" });
      }

      if (user.password !== password) {
         return res.status(401).json({ result: "Invalid password" });
      }

      const userData = user.toObject();
      delete userData.password;

      jwt.sign({ user: userData }, jwtKey, { expiresIn: "2h" }, (err, token) => {
         if (err) {
            res.status(500).json({ result: "Token error" });
         } else {
            res.json({ user: userData, auth: token });
         }
      });
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// ===== ADD PRODUCT =====
app.post("/add-product", verifyToken, async (req, res) => {
   try {
      let product = new Product(req.body);
      let result = await product.save();
      res.send(result);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// ===== GET ALL PRODUCTS =====
app.get("/products", verifyToken, async (req, res) => {
   let products = await Product.find();
   products.length > 0
      ? res.send(products)
      : res.send({ result: "No Products Found" });
});

// ===== GET SINGLE PRODUCT =====
app.get("/product/:id", verifyToken, async (req, res) => {
   try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ error: "Invalid Product ID" });
      }

      const product = await Product.findById(id);

      if (!product) {
         return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// ===== UPDATE PRODUCT =====
app.put("/product/:id", verifyToken, async (req, res) => {
   try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ error: "Invalid Product ID" });
      }

      const result = await Product.updateOne(
         { _id: id },
         { $set: req.body }
      );

      res.send(result);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// ===== DELETE PRODUCT =====
app.delete("/product/:id", verifyToken, async (req, res) => {
   try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ error: "Invalid Product ID" });
      }

      const result = await Product.deleteOne({ _id: id });
      res.send(result);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// ===== SEARCH PRODUCT (FIXED SPELLING) =====
app.get("/search/:key", verifyToken, async (req, res) => {
   try {
      const key = req.params.key;

      const result = await Product.find({
         $or: [
            { name: { $regex: key, $options: "i" } },
            { company: { $regex: key, $options: "i" } },
            { category: { $regex: key, $options: "i" } },
         ],
      });

      res.json(result);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

 



function verifyToken(req, res, next) {
   const token = req.headers["authorization"]; // ✅ YAHAN DEFINE

   if (!token) {
      return res.status(403).json({ result: "Please add token with header" });
   }

   // Expected: Bearer <token>
   const parts = token.split(" ")[1];
   if (!parts) {
      return res.status(401).json({ result: "Token format invalid" });
   }

   const jwtToken = parts;

   jwt.verify(jwtToken, jwtKey, (err, decoded) => {
      if (err) {
         return res.status(401).json({ result: "Invalid token" });
      }
      next(); // ✅ VERY IMPORTANT
   });
}




// ===== START SERVER =====
app.listen(port, () => {
   console.log(`✅ Server running at http://localhost:${port}`);
});

