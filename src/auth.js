const express = require("express");
const {User} = require("../models/db");
const router = express.Router();
const jwt = require("jsonwebtoken");

module.exports = (option = {}) =>{

    router.get("/login", (req, res)=>{
        if(req.cookies.jwt_token){
            return res.redirect("/");
        }
        res.render("login");
    })

    router.post("/login", async (req, res) => {
        let user = await User.findByCredentials(req.body.email, req.body.password);
        if(!user){
            return res.redirect("/login");
        }
    
        let token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
        res.cookie('jwt_token', token, { maxAge: 1000 * 60 * 60 * 24 });
        res.redirect("/");
        
    })

    router.get("/register", (req, res)=>{
        if(req.cookies.jwt_token){
            return res.redirect("/");
        }
        res.render("register");
    })

    router.post("/register", (req, res) => {
        let {fname, lname} = req.body;
        req.body.name = `${fname} ${lname}`;
        delete req.body.fname;
        delete req.body.lname;
        User.create(req.body).catch(err => console.log("errorr", err.message));

        res.redirect("/login");
    })

    router.get("/logout", (req, res)=>{
        res.clearCookie("jwt_token");

        res.redirect("/login");
    })

    return router;
}