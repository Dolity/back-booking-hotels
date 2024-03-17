const express = require("express");
const cors = require("cors");
const app = express();
const userRouter = require("./router/route");

const port = process.env.PORT || 8000;

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: [
      "https://tame-loincloth-bass.cyclic.app", 
      "https://front-booking-hotels.vercel.app",
      "http://localhost:5173",
      "http://localhost:8000",
    ],
  })
);

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
})

app.use("/api/v1/user", userRouter)
