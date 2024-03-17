const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const config = require("../config/config")
// const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

const secret = "mysecret";

let conn = null;
const initMySQL = async () => {
    try {
        conn = await mysql.createConnection({
            host: config.db.host,
            port: config.db.port,
            user: config.db.username,
            password: config.db.password,
            database: config.db.database,
            connectTimeout: 60000
          });
          console.log('MySQL connected successfully');
    } catch (error) {
      console.log("conn: ",conn);
      console.log('Error connecting to MySQL:', error);
    }
  };

  initMySQL()

const helloWord = (req, res) => {
  res.json({
    message: "Hello World",
  });
}

const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    //timestamp in thailand timezone but type 2021-08-01 12:00:00
    const options = { 
      timeZone: "Asia/Bangkok", 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit", 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    };
    const currentTimestamp = new Date().toLocaleString("en-US", options);
    console.log("currentTimestamp", currentTimestamp);

    const userData = {
      email,
      password: passwordHash,
      timestamp: currentTimestamp
    };
    const [result] = await conn.query("INSERT INTO users SET ?", userData);

    res.json({
      message: "Insert OK",
      status: 201
    });
  } catch (error) {
    console.log("error", error);
    res.json({
      message: "Insert Fail",
      status: 400,
      error
    });
  }
};

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [results] = await conn.query(
      "SELECT * FROM users WHERE email = ?",
      email
    );
    const userData = results[0];
    const match = await bcrypt.compare(password, userData.password);

    const id = userData.id

    if (!match) {
      res.status(400).json({
        message: "Login Fail",
        status: 400
      });
      return false;
    }

    // 1. use Token attach to header
    const token = jwt.sign({ email, role: "admin" }, secret, {
      expiresIn: "10h",
    });

    res.json({
      message: "Login success",
      status: 200,
      token,
      id
    });

    // 2. use Cookie 
    // const token = jwt.sign({ email, role: "admin" }, secret, {
    //     expiresIn: "1h",
    //   });
    //   res.cookie('token', token,{
    //     maxAge: 300000,
    //     secure: true,
    //     httpOnly: true,
    //     sameSite: "none"
    //   });

    //3. use session
    // req.session.userId = userData.id
    // req.session.user = userData

    // res.json({
    //   message: "Login success",
    // });

  } catch (error) {
    console.log("Login Fail", error);
    res.json({
      message: "Login Fail",
      status: 400,
      error,
    });
  }
};

const getUsers = async (req, res) => {
    try {
        // 1. use Token attach to header
        const authHeader = req.headers['authorization']

        // 2. use Cookie
        //const authToken = req.cookies.token

        let authToken = ""
        // // spilt Bearer token go away need token only

         // 1. use Token attach to header
        if (authHeader) {
            authToken = authHeader.split(' ')[1]
        }

        //check by secret first
        // 1. & 2. 
        const user = jwt.verify(authToken, secret)

        // 3. use session
        // if (!req.session.userId) {
        //     throw { message: "Auth fail"}
        // }
        // console.log(req.session);
        
        //recheck again make sure user is exist
        // 1. & 2.
        const [checkResult] = await conn.query("SELECT * FROM users WHERE email = ?", user.email);
        if (!checkResult[0]) {
            throw { message: "user not found"}
        }

        const [results] = await conn.query("SELECT * FROM users");
        res.json({
            message: "Authentication success",
            status: 200,
            users: results
        })
        
    } catch (error) {
        console.log("error", error);
        res.json({
            message: "Authentication Fail",
            status: 401,
            error
        })
    }
}

const createBooking = async (req, res) => {
  try {
    let { user_id, checkin_date, checkout_date, full_name, phone_number, email, status } = req.body;

    status = "Reserved"

    const bookingData = {
      user_id,
      checkin_date, 
      checkout_date, 
      full_name, 
      phone_number,
      email,
      status
    };
    const [result] = await conn.query("INSERT INTO bookings SET ?", bookingData);

    if (!result) {
      throw { message: "Insert Fail"}
    }

    res.json({
      message: "Insert OK",
      status: 201
    });
  } catch (error) {
    console.log("error", error);
    res.json({
      message: "Insert Fail",
      status: 400,
      error
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const [results] = await conn.query("SELECT * FROM bookings");
    res.json({
      message: "Get bookings success",
      status: 200,
      bookings: results
    })
  } catch (error) {
    console.log("error", error);
    res.json({
      message: "Get bookings Fail",
      status: 400,
      error
    });
  }
}

module.exports = { helloWord, createUser, authUser, getUsers, createBooking, getBookings }

