import { generateToken } from "../lib/utils.js"
import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters."})
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message: "Email already exists"})

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashPassword,
        })

        if(newUser){
            //generate jwt token 
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profileImg: newUser.profileImg,
            })
        }else{
            res.status(400).json({message: "Invalid user data"})
        }


    } catch (error) {
        console.log("Error in signUp: ", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}
 
export const login = async (req, res) => {
    const {email, password} = req.body
    
    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message: "Invalid Credentials"})
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"})
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImg: user.profileImg,
        })

    } catch (error) {
        console.log("Error in login: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}
 
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0})
        res.status(200).json({message: "Logged out Successfully"})
    } catch (error) {
        console.log("Error in Logout: ", error.message)
        res.status(500).json({message: "Internal Server error"})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profileImg} = req.body;
        const userId = req.user._id;

        if(!profileImg){
            return res.status(400).json({message: "Profile image required"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profileImg)

        const updatedUser = await User.findByIdAndUpdate(userId, {profileImg: uploadResponse.secure_url}, {new: true})

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error updating the Profile: ", error)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}