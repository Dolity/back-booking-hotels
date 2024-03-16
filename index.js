const express = require("express");
const cors = require("cors");
const app = express();
const userRouter = require("./router/route");
const { initMySQL } = require("./database/database");

const port = 8000

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: ["https://tame-loincloth-bass.cyclic.app", "https://front-booking-hotels.vercel.app"],
  })
);

app.use("/api/v1/user", userRouter)

app.listen(port, async () => {
  // await initMySQL();
  console.log(`Server started at port ${port}`);
})