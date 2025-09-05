require('dotenv').config();
require("./database/database").connect()
const User = require('./model/user')
const express = require('express')
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("<h1>server is working</h1>")
})

app.post("/register", async(req,res) => {
    try{
        //get all data from body
        const {firstname, lastname, email, password} = req.body
        //all data should exists
        if (!(firstname && lastname && email && password)){
            res.status(400).send('All fields are compulsary')

        }
        //check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.status(401).send('User exist with this email')
        }
        //encrypt the password
        const myEncPassword = await bcrypt.hash(password, 10)
        //save the user in DB
        const user = await User.create({
            firstname,
            lastname,
            email,
            password : myEncPassword
        })
        //generate a token for user and send it
        const token = jwt.sign(
            { id: user._id, email },
            'shhhhh',
            {
              expiresIn: "2h"
            }
        );
        user.token = token
        user.password = undefined //not send it to user
        res.status(201).json(user)

    }catch(error){
        console.log(error);
    }

})

app.post("/login", async(req, res) => {
    try {
        //get all data from frontend
        const {email, password} = req.body
        //validation
        if (!(email && password)) {
            res.status(400).send("Some fields are missing")
        }
        //find user in DB
        const user = await User.findOne({email})
        //if user is not there
        //match the password
        if (user && (await bycrypt.compare(password,user.password))){
            jwt.sign(
                {id: user._id},
                'shhhhh',
                {
                    expiresIn: "2h"
                }
            );
            user.token = token
            user.password = undefined
        }
        //send token to user as cookie
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true
        };
        res.status(200).send("token",token, options).json({
            success: true,
            token,
            user
        });
    } catch (error) {
        console.log(error);
    }

})

module.exports = app