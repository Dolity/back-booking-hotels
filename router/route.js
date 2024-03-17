const express = require("express");
const router = express.Router();
const userHandler = require("../handler/handler")

router.get("/", userHandler.helloWord)
router.post("/register", userHandler.createUser)
router.post("/login", userHandler.authUser)
router.get("/users", userHandler.getUsers)
router.post("/booking", userHandler.createBooking)
router.get("/bookings", userHandler.getBookings)

module.exports = router;