const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;

const mongoConnect = () => {
  mongoose.connect(mongoURI);

  mongoose.connection.on("connected", () => {
    console.log("Successfully connected to MongoDB. Now, you may run your client code");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Error in connecting to MongoDB:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("You are disconnected from MongoDB");
  });
};

module.exports = mongoConnect;
