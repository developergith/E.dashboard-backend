const mongoose = require("mongoose");
const express = require("express");

const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    category: String,
    company: String,
    userId: String
});

module.exports = mongoose.model('Product', ProductSchema);