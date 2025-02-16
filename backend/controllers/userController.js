const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { get } = require("mongoose");
const Token = require("../models/tokenModel");
const crypto = require("crypto");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};


//Register user
const registerUser =asyncHandler( async (req, res) => {
    const { name, email, password } = req.body;
    

    //validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password should be atleast 6 characters");
    }

    //check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }



    //create user
    const user = await User.create({
        name,
        email,
        password,
    });

        //Generate token
        const token = generateToken(user._id);

        //send http only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 864000 ), //1 days
            sameSite: "none",
            secure: true,
        });

    if (user) {
        const { _id, name, email,phone,photo,bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});


//Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }

    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    //check if password matches and user exists
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

           //Generate token
           const token = generateToken(user._id);

           //send http only cookie
           res.cookie("token", token, {
               path: "/",
               httpOnly: true,
               expires: new Date(Date.now() + 1000 * 864000 ), //1 days
               sameSite: "none",
               secure: true,
           });

    if ( user && passwordIsCorrect) {
        const { _id, name, email,phone,photo,bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});


//Logout user

const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), 
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({
        message: "Logged out",
    });
});

//Get user Data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email,phone,photo,bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            phone,
            photo,
            bio,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//Get login status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.jason(false);
    }
    //verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified){
        return res.json(true);

    }
    return res.json(false);
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { name, email,phone,photo,bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;
        user.bio = req.body.bio || bio;

        const updatedUser = await user.save();
        res.status(200).jason({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            photo: updatedUser.photo,
            bio: updatedUser.bio,
        })
    }else{
        res.status(404);
        throw new Error("User not found");
    }
});

const changepassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const { oldpassword, newpassword } = req.body;

    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }

    //validation
    if (!oldpassword || !newpassword) {
        res.status(400);
        throw new Error("Please fill all the fields");
    }

    //check if password matches
    const passwordIsCorrect = await bcrypt.compare(oldpassword, user.password);

    // Save new password
    if (user && passwordIsCorrect) {
        user.password = newpassword;
        await user.save();
        res.status(200).send("Password changed successfully");
    } else {
        res.status(400);
        throw new Error("Old password is incorrect");
    }
})

const forgetpassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }


    //Delete any existing reset token
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne(token._id);
    }


    //Generate Reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    //Hash token bedore saving
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    //save reset token 

    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expireAt: Date.now() + 30 * 60 * 1000, //30 minutes
    }).save();
    
    //Construct reset URL
    const resetURL = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    //Reset email
    const message = `<h2>Hello ${user.name}</h2>
    <p>You requested for password reset. Plese use the url below to reset your password.</p>
    <p>This reset lik is valid for 30minutes</p>
    <a href=${resetURL} clicktracking=off>${resetURL}</a>

    <p>Regards.....</p>
    <p>Stock Mate Team</p>


    `;

    const subject = "Password Reset Request(STOCKMATE)";
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER;

    try{
        await sendEmail(subject, message, send_to, send_from, send_from);
        res.status(200).json({sucess: true, message: "Reset Email sent"});
    }catch(error){
        res.status(500);
        throw new Error("Email could not be sent. Please try again later");

    }


});

//Reset password
const resetpassword = asyncHandler(async (req, res) => {

    const {password} = req.body;
    const {resetToken} = req.params;

    //Hash token and compare with the hashed token in the database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //find token in DB
    const userToken = await Token.findOne({ 
        token: hashedToken,
        expireAt: { $gt: Date.now() }, 
    });

    if (!userToken) {
        res.status(400);
        throw new Error("Invalid or expired reset token");
    }

    //find user
    const user = await User.findOne({_id: userToken.userId})
    user.pasword = password;
    await user.save();

    res.status(200).json({
        message: "Password reset successful"});



});


module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changepassword,
    forgetpassword,
    resetpassword,
    
};