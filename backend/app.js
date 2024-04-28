import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectMongoDB from "./db/connectMongoDB.js";


const app = express();

connectMongoDB();


// Middlewares setup

app.use(express.json()); // to parse req.body (application/json)
app.use(express.urlencoded({ extended: true })); // to parse form-data(urlencoded)
app.use(cookieParser());


// imports required routers
import authRoutes from "./routes/auth.routes.js";


// all Routes
app.use("/api/v1/auth", authRoutes);


export default app;