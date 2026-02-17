const mongoose = require("mongoose");

// ✅ FIX: Removed deprecated options (useNewUrlParser, useUnifiedTopology)
// These are no longer needed in Mongoose 6+
// The URI in .env must use mongodb+srv:// for Atlas

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB Disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB Reconnected");
});

