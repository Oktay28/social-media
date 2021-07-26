const express = require("express");
const {User, Messages, Friends} = require("../../models/db");
const router = express.Router();
const {hasAccess} = require("../middlewares");

module.exports = (options = {})=>{

    router.get("/chat", hasAccess, async (req, res)=>{
        if(!req.query.user){
            options.friends = await User.findAll({
                include: [
                    {
                        model: Friends,
                        where: {
                            user_id: res.locals.user.id
                        },
                        attributes: []
                    }
                ],
                attributes: ["id", "name"],
                raw: true
            })
            return res.render("chat", options);
        }
        let chat = await Friends.findOne({
            attributes: ['chat_id'],
            where: {
                user_id: res.locals.user.id,
                friend_id: req.query.user
            }
        })
        if(!chat){
            return res.redirect("/chat");
        }
        options.data = {};
        options.data.user = await User.findOne({
            attributes: ['id', 'name'],
            where: {
                id: req.query.user
            },
            raw: true
        })

        options.messages = await Messages.findAll({
            where: {
                chat_id: chat.chat_id
            },
            include:[
                {
                    model: User,
                    attributes: ['id', 'name', 'avatar']
                }
            ],
            order: [['created_at']],
            raw: true
        })

        
        res.render("chatUser", options);
    })

    return router;
}