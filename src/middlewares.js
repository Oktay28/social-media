require("dotenv/config");
const {User} = require("../models/db");
const jwt = require("jsonwebtoken");
const url = require("url");
module.exports = {

    userAuth: async (req, res, next) => {
        let token = req.cookies.jwt_token;
        if(!token) {
            return res.redirect("/login");
        }
        let {id} = jwt.verify(token, process.env.JWT_SECRET);
        if(!id) {
            return res.redirect("/login");
        }
        let user = await User.findOne({
            where: {
                id
            },
            raw: true
        })

        if(!user){
            return res.redirect("/login");
        }

        res.locals.user = user;
        res.locals.hasAccess = true;
        next();

    },
    hasAccess : (req, res, next) => {
        if(req.query.user){
            if(req.query.user == res.locals.user.id){
                return res.redirect(url.parse(req.url).pathname);
            }
            res.locals.hasAccess = false;
        } else {
            res.locals.hasAccess = true;
        }
        next();
    },

    noQuery: (req, res, next) => {
        if(Object.keys(req.query).length != 0){
            return res.redirect(url.parse(req.url).pathname);
        }

        next();
    }

}