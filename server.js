const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
const path = require("path");
app.use("/api/images", express.static(path.join(__dirname, "images")));

// Load data from JSON file
const loadProducts = () => {
  const data = fs.readFileSync("./products_for_api.json", "utf-8");
  return JSON.parse(data);
};

// Get all products
app.get("/api/products", (req, res) => {
  const jsonData = loadProducts();
  res.json(jsonData.products); // returns the array of products only
});

// Get product by ID
app.get("/api/products/:id", (req, res) => {
  const jsonData = loadProducts();
  const product = jsonData.products.find((p) => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({error: "Product not found"});
  }

  res.json(product);
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updatedFields = req.body;

  const data = JSON.parse(fs.readFileSync("./products_for_api.json", "utf-8"));
  const productIndex = data.products.findIndex((p) => p.id === id);

  if (productIndex === -1) return res.status(404).json({error: "Product not found"});

  data.products[productIndex] = {
    ...data.products[productIndex],
    ...updatedFields,
  };

  fs.writeFileSync("./products_for_api.json", JSON.stringify(data, null, 2));
  res.json(data.products[productIndex]);
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const data = JSON.parse(fs.readFileSync("./products_for_api.json", "utf-8"));
  const newProducts = data.products.filter((p) => p.id !== id);

  if (newProducts.length === data.products.length) {
    return res.status(404).json({error: "Product not found"});
  }

  data.products = newProducts;
  fs.writeFileSync("./products_for_api.json", JSON.stringify(data, null, 2));
  res.json({success: true});
});
app.post("/api/products", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./products_for_api.json", "utf-8"));
  const newProduct = req.body;
  const maxId = data.products.reduce((max, p) => (p.id > max ? p.id : max), 0);
  newProduct.id = maxId + 1; // unique id
  data.products.push(newProduct);
  fs.writeFileSync("./products_for_api.json", JSON.stringify(data, null, 2));
  res.status(201).json(newProduct);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
