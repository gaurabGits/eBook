const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("Missing MongoDB connection string: set MONGO_URL in server/.env");
  }

  await mongoose.connect(mongoUrl, {
    autoIndex: process.env.MONGO_AUTO_INDEX === "true",
  });
  console.log("MongoDB connected");
};

module.exports = connectDB;
