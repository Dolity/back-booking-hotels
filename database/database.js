// const config = require("../config/config")
// const mysql = require("mysql2/promise");

// let conn = null;

// const initMySQL = async () => {
//     try {
//         conn = await mysql.createConnection({
//             host: config.db.host,
//             user: config.db.username,
//             password: config.db.password,
//             database: config.db.database,
//           });
//           console.log('MySQL connected successfully');
//     } catch (error) {
//         console.log('Error connecting to MySQL:', error);
//     }
//   };

//   initMySQL()

// const registerSQL = async (userData) => {
//   try {
//     const [result] = await conn.query("INSERT INTO Users SET ?", userData)
//     console.log(result);
//     return result;
//   } catch (error) {
//     console.error('Error registering user:', error);
//   }

// }

//   console.log('conn:', conn);

// module.exports = { registerSQL };