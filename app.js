import express from "express";
import dotenv from "dotenv";
import middleware from "./middlewares/error.js";
import { connectDatabase } from "./database/database.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

const app = express();

//dotenv
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config/config.env" });
}

//database
connectDatabase();

//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//num of proxy
// app.set("trust proxy", 1);

//middlewares
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser({ extended: true }));
app.use(cors());

//import routes
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";

//routes
app.use("/api/v1", userRoute);
app.use("/api/v1", productRoute);

//error middleware
app.use(middleware);

export default app;
