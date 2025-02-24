import mongoose, { ConnectOptions } from "mongoose";

const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${dbHost}:${dbPassword}@chat-app.qrrr8.mongodb.net/?retryWrites=true&w=majority&appName=chat-app`;

const clientOptions : ConnectOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const databaseConnection = async () => {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db?.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default databaseConnection;