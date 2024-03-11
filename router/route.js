const express = require("express");
const router = express.Router();
const userHandler = require("../handler/handler")

router.post("/register", userHandler.createUser)
router.post("/login", userHandler.authUser)
router.get("/users", userHandler.getUsers)

module.exports = router;