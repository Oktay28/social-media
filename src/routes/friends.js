const express = require("express");
const {
    User,
    Friends,
    Chat
} = require("../../models/db");
const router = express.Router();
const {
    hasAccess
} = require("../middlewares");
const {
    noQuery
} = require("../middlewares");
const {
    Op
} = require("sequelize");


module.exports = (options = {}) => {

    router.get("/friend-requests", noQuery, async (req, res) => {
        options.data = {};
        options.data.users = await Friends.findAll({
            where: {
                user_id: res.locals.user.id,
                status: 2
            },
            include: [{
                model: User,
                attributes: ["id", "name", "avatar"]
            }],
            raw: true
        })
        res.render("friendRequests", options);

    })

    router.get("/friends", hasAccess, async (req, res) => {

        options.data = {};
        options.data.users = await Friends.findAll({
            where: {
                user_id: req.query.user || res.locals.user.id,
                status: 3
            },
            include: [{
                model: User,
                attributes: ["id", "name", "avatar"]
            }],
            raw: true
        })

        res.render("friends", options);
    })

    router.get("/manage-friend", async (req, res) => {
        let sender = res.locals.user.id;
        let receiver = req.query.user;
        let action = req.query.action;

        let friend = await Friends.findOne({
            attributes: ['status'],
            where: {
                user_id: sender,
                friend_id: receiver
            },
            raw: true
        })

        let status = friend && friend.status;

        if (action == "add") {
            if (status == null) {
                await Friends.bulkCreate([{
                        status: 1,
                        user_id: sender,
                        friend_id: receiver
                    },
                    {
                        status: 2,
                        user_id: receiver,
                        friend_id: sender
                    }
                ])
            }
        } else if (action == "accept") {
            if (status == 2) {
                
                let {id} = await Chat.create();

                await Friends.update({
                    status: 3,
                    chat_id: id
                }, {
                    where: {
                        user_id: [sender, receiver],
                        friend_id: [receiver, sender]
                    },
                })
            }
        } else if (action == "decline") {
            if (status == 2) {
                await Friends.destroy({
                    where: {
                        user_id: [sender, receiver],
                        friend_id: [receiver, sender]
                    }
                })
            }
        } else if (action == "remove"){
            if(status == 3){
                let chat = await Friends.findOne({
                    attributes: ['chat_id'],
                    where: {
                        user_id: sender,
                        friend_id: receiver
                    },
                    raw: true
                })

                await Friends.destroy({
                    where: {
                        user_id: [sender, receiver],
                        friend_id: [receiver, sender]
                    }
                })

                await Chat.destroy({
                    where: {
                        id: chat.chat_id
                    }
                })

            }
        }

        res.redirect(`/profile?user=${req.query.user}`);
    })

    

    return router;
}