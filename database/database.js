import mongoose from "mongoose";

export const connectDatabase = async () => {
  const db = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connect successfully ${db.connection.host}`);
};
