const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const config = require("../config/config")
// const mysql = require("mysql2/promise");
const mysql = require("mysql")

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

// let conn = null;
// const initMySQL = async () => {
//     try {
//         conn = await mysql.createConnection({
//             host: config.db.host,
//             port: config.db.port,
//             user: config.db.username,
//             password: config.db.password,
//             database: config.db.database,
//             connectTimeout: 60000
//           });
//           console.log('MySQL connected successfully');
//     } catch (error) {
//       console.log("conn: ",conn);
//       console.log('Error connecting to MySQL:', error);
//     }
//   };

//   initMySQL()

var db_config = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.username,
  password: config.db.password,
  database: config.db.database,
  connectTimeout: 60000
};

let conn;

const handleDisconnect = () => {
  conn = mysql.createConnection(db_config);
  
  conn.connect((err) => {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  conn.on('error', (err) => {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

handleDisconnect();

const helloWord = (req, res) => {
  res.json({
    message: "Hello World",
  });
}

const createUser = async (req, res) => {
  try {
    if (conn) {
      const { email, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);

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

      const userData = {
        email,
        password: passwordHash,
        timestamp: currentTimestamp
      };
      conn.query("INSERT INTO users SET ?", userData);

      res.json({
        message: "Insert OK",
        status: 201
      });
    } else {
      res.status(500).json({
        message: "Error connecting to MySQL",
        status: 500
      });
    }
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
    const [results] = conn.query(
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

    const token = jwt.sign({ email, role: "admin" }, secret, {
      expiresIn: "10h",
    });

    res.json({
      message: "Login success",
      status: 200,
      token,
      id
    });

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
        const authHeader = req.headers['authorization']

        let authToken = ""

        if (authHeader) {
            authToken = authHeader.split(' ')[1]
        }

        const user = jwt.verify(authToken, secret)

        const [checkResult] = conn.query("SELECT * FROM users WHERE email = ?", user.email);
        if (!checkResult[0]) {
            throw { message: "user not found"}
        }

        const [results] = conn.query("SELECT * FROM users");
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
    const [result] = conn.query("INSERT INTO bookings SET ?", bookingData);

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
    const [results] = conn.query("SELECT * FROM bookings");
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

