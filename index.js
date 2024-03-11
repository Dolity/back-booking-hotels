// const cors = require("cors");
// const express = require("express");
// const mysql = require("mysql2/promise");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const session = require("express-session");
// const bcrypt = require("bcrypt");

// const app = express();
// app.use(express.json());
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:8888", "http://localhost:5173"],
//   })
// );
// app.use(cookieParser());

// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// const port = 8000;
// const secret = "mysecret";

// let conn = null;

// function init connection mysql
// const initMySQL = async () => {
//   conn = await mysql.createConnection({
//     host: "localhost",
//     user: "dolity",
//     password: "abc123",
//     database: "express_auth",
//   });
// };

// console.log("index conn:", conn);

// app.post("/api/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const passwordHash = await bcrypt.hash(password, 10);
//     const userData = {
//       email,
//       password: passwordHash,
//     };
//     const [result] = await conn.query("INSERT INTO Users SET ?", userData);

//     res.json({
//       message: "Insert OK",
//       status: 201
//     });
//   } catch (error) {
//     console.log("error", error);
//     res.json({
//       message: "Insert Fail",
//       status: 400,
//       error
//     });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const [results] = await conn.query(
//       "SELECT * FROM users WHERE email = ?",
//       email
//     );
//     const userData = results[0];
//     const match = await bcrypt.compare(password, userData.password);

//     if (!match) {
//       res.status(400).json({
//         message: "Login Fail",
//         status: 400
//       });
//       return false;
//     }

//     // 1. use Token attach to header
//     const token = jwt.sign({ email, role: "admin" }, secret, {
//       expiresIn: "1h",
//     });

//     res.json({
//       message: "Login success",
//       status: 200,
//       token,
//     });

//     // 2. use Cookie 
//     // const token = jwt.sign({ email, role: "admin" }, secret, {
//     //     expiresIn: "1h",
//     //   });
//     //   res.cookie('token', token,{
//     //     maxAge: 300000,
//     //     secure: true,
//     //     httpOnly: true,
//     //     sameSite: "none"
//     //   });

//     //3. use session
//     // req.session.userId = userData.id
//     // req.session.user = userData

//     // res.json({
//     //   message: "Login success",
//     // });

//   } catch (error) {
//     console.log("Login Fail", error);
//     res.json({
//       message: "Insert Fail",
//       status: 400,
//       error,
//     });
//   }
// });

// app.get("/api/users", async (req, res) => {
//     try {
//         // 1. use Token attach to header
//         const authHeader = req.headers['authorization']

//         // 2. use Cookie
//         //const authToken = req.cookies.token



//         let authToken = ""
//         // // spilt Bearer token go away need token only

//          // 1. use Token attach to header
//         if (authHeader) {
//             authToken = authHeader.split(' ')[1]
//         }

//         //check by secret first
//         // 1. & 2. 
//         const user = jwt.verify(authToken, secret)

//         // 3. use session
//         // if (!req.session.userId) {
//         //     throw { message: "Auth fail"}
//         // }
//         // console.log(req.session);
        
//         //recheck again make sure user is exist
//         // 1. & 2.
//         const [checkResult] = await conn.query("SELECT * FROM users WHERE email = ?", user.email);
//         if (!checkResult[0]) {
//             throw { message: "user not found"}
//         }

//         const [results] = await conn.query("SELECT * FROM users");
//         res.json({
//             message: "Authentication success",
//             status: 200,
//             users: results
//         })
        
//     } catch (error) {
//         console.log("error", error);
//         res.json({
//             message: "Authentication Fail",
//             status: 401,
//             error
//         })
//     }
// })

// // Listen
// app.listen(port, async () => {
//   await initMySQL();
//   console.log("Server started at port 8000");
// });

////////////////////////////////////////////////////////////////////
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
    origin: ["http://localhost:8888", "http://localhost:5173"],
  })
);

app.use("/api/v1/user", userRouter)

app.listen(port, async () => {
  // await initMySQL();
  console.log(`Server started at port ${port}`);
})