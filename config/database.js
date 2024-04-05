import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
    path: '../config/.env'
});

const databaseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
};

export default databaseConnection;
