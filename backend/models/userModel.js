const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
        min: 3,
        max: 20
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        trim: true,
        unique: true,
        match : [ /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true , "Please enter your password"],
        minlength: [6, "Password must be atleast 6 characters long"],
        // maxlength: [20, "Password cannot be more than 64 characters long"]
    },

    photo: {
        type: String,
        required: [true, "Please upload your photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },

    phone: {
        type: String,
        default: "+977"
    },

    bio: {
        type: String,
        maxlength: [250, "Bio cannot be more than 250 characters long"],    
        default: "Hey there! I am using StockMate."
    },

   
}, { timestamps: true

});

//encrypting password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.password = hassedPassword;
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;