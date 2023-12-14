const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const connectDB = require("./src/config/db");
// configuring .env file
dotenv.config({ path: ".env" });

connectDB();
// handling cors errors
app.use(cors());

// body parser
app.use(express.json())

// importing port from.env
const PORT = process.env.PORT;

// health check api
app.get("/", (req, res) => {
  res.send({ status: 200, success: true });
});

//routing 
app.use("/user",require("./src/routes/user.routes"))
// listening to the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
