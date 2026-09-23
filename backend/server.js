const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

connectDB();
const userRoutes = require("./routes/userRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Welcome to Pavalam Industries Backend!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});