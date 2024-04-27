import dotenv from "dotenv";
import express from "express";
import connectMongoDB from "./db/connectMongoDB.js";


dotenv.config();

const app = express();

connectMongoDB();


// imports required routers 
import authRoutes from "./routes/auth.routes.js";


// all Routes
app.use("/api/v1/auth", authRoutes);


export default app;