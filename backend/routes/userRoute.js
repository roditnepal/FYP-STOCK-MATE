const express = require('express');
const { registerUser, 
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser, 
    changepassword,
    forgetpassword,
    resetpassword,

} = require('../controllers/userController');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");




router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changepassword);
router.post("/forgotpassword", forgetpassword);
router.put("/resetpassword/:resetToken", resetpassword);


module.exports = router;