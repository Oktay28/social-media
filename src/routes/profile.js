require("dotenv").config();
const express = require("express");
const router = express.Router();
const {User, Publications, Friends, Comments, Likes, sequelize} = require("../../models/db");
const {hasAccess} = require("../middlewares");

const bcrypt = require("bcrypt");

module.exports = (options = {}) => {

    router.get("/profile", hasAccess, async (req, res)=>{
        try{

        options.publications = await Publications.findAll({
            where: {
                user_id: req.query.user || res.locals.user.id
            },
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('comments.id'))), 'numberComments'],
                    [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('likes.id'))), 'numberLikes']
                ]
            },
            include:[
                {
                    model: User,
                    attributes: [ 'id', 'name', 'avatar' ]
                },
                {
                    model: Comments,
                    attributes: []
                },
                {
                    model: Likes,
                    attributes: ['id'],
                    having: {
                        user_id: sequelize.col('publications.user_id'),
                        publication_id: sequelize.col('publications.id')
                    }
                }
            ],order: [
                ['created_at', 'DESC']
            ],
            group: ['publications.id'],
            raw: true
        });
                    
    } catch{
        return res.redirect("/");
    }

        options.data = {};
        options.data.user = res.locals.user;
        let friend;

        if(!res.locals.hasAccess){
            friend = await Friends.findOne({
                attributes: ['status'],
                where: {
                    user_id: res.locals.user.id,
                    friend_id: req.query.user
                },
                raw: true
            })

            options.data.user = await User.findOne({
                where: {
                    id: req.query.user
                },
                raw: true
            })

            if(!options.data.user){
                res.redirect("/profile");
            }

        }

        options.data.user.friendAmount = await Friends.count({
            where: {
                user_id: options.data.user.id,
                status: 3
            }
        }) || 0;

        options.data.user.publicationAmount = await Publications.count({
            where: {
                user_id: options.data.user.id
            }
        }) || 0;


        options.friendStatus = friend && friend.status;

        res.render("profile", options);
          
    })

    router.get("/view-information", hasAccess,async (req, res) =>{
        options.data = {};
        options.data.user = res.locals.user;

        if(!res.locals.hasAccess){
            options.data.user = await User.findOne({
                where: {
                    id: req.query.user
                },
                raw: true
            })
        }

        res.render("viewInformation", options);
    })

    router.get("/edit-profile", (req, res) => {

        res.render("editProfile");
    })

    router.post("/edit-profile", async (req, res) => {
        req.body.name = `${req.body.fname} ${req.body.lname}`;
        await User.update(req.body,{
            where: {
                id: res.locals.user.id
            }
        })
        
        res.redirect("/profile");
    })

    router.get("/change-password", (req, res) => {

        res.render("changePassword");
    })

    router.post("/change-password", async (req, res) => {
    let checkpass = bcrypt.compareSync(req.body.password, res.locals.user.password);
    if(!checkpass){
        return res.redirect("/change-password");
    }
    await User.update({
        password: await bcrypt.hash(req.body.newPassword, 8)
    },{
        where: {
            id: res.locals.user.id
        }
    })

    res.redirect("/profile");
        
    })

    return router;
}