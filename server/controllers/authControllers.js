const User = require('../models/user');
const bscrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registerUser = async (req, res) =>{
    try{
        const {name, email, password} = req.body;

        //check is user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }

        //hash password
        const salt = await bscrypt.genSalt(10); //generate salt(random value) with 10 rounds (more rounds = more secure but slower)
        const hashedPassword = await bscrypt.hash(password, salt);
        
        //create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User register successfully",
            userId: user._id,
        });
    }catch(error){
        res.status(500).json({message: error.message});
    };
}

const loginUser = async (req, res) =>{
    try {
        const {email, password } = req.body;

        //find user by email
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        //compare password
        const isMatch = await bscrypt.compare(password, user.password); // (plain text password, hashed password)
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }

        // create JWT payload
        const payload = {
            userId: user._id,
            userRole: user.role, // e.g. "admin" or "user"
        };

        // sign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            message: "Login successful",
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {registerUser, loginUser};