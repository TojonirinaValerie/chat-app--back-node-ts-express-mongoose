import mongoose from "mongoose";

const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

const databaseConnection = async () => {
  try {
    await mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`);
    console.log("==================================================");
    console.log("MongoDB connected");
    console.log("==================================================");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default databaseConnection;