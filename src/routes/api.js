const express = require("express");
const fs = require("fs");
const router = express.Router();
const chalk = require("chalk");
const {Comments, User, Publications, Likes, Friends, Messages} = require("../../models/db");
const {getChatContainer} = require("../functionCore");
const sequelize = require("sequelize");
const Op = sequelize.Op;

module.exports = (options) => {

    router.post("/api/upload", (req, res) => {
        let url = `assets/uploads/user${res.locals.user.id}/`;
        if (!fs.existsSync(url)){
            fs.mkdirSync(url);
        }
        url += req.files.uploadPostImage.name;
        req.files.uploadPostImage.mv(url, (error)=>{
            if(error) console.log(chalk.bgRed("file can not be uploaded!"));
            else console.log(chalk.bgGreen("file successfully uploaded!"));
        })
    
        res.end(`/${url}`);
    })


    router.post("/api/post-comment/:id", async (req, res) => {
        let {id} = await Comments.create({
            comment: req.body.commentField,
            user_id: res.locals.user.id,
            publication_id: req.params.id
        })

        res.send(getChatContainer(res.locals.user.id, res.locals.user.avatar, res.locals.user.name, req.body.commentField, id, "Comments"));
    });

    router.post("/api/load-comments/:id", async (req, res) => {
        let comments = await Comments.findAll({
            where: {
                publication_id: req.params.id
            },
            include: [
                {
                    model: User,
                    attributes: ["avatar", "name"]
                }
            ],
            order: ['created_at'],
            raw: true
        })

        let content = "";
        comments.forEach(comment=>{
           content += getChatContainer(comment.user_id, comment["User.avatar"], comment["User.name"], comment.comment, comment.id, "Comments", comment.created_at, res.locals.user.id);
        })

        res.send(content);
    })


    router.post("/api/remove", async (req, res) =>{
        await eval(req.query.item).destroy({
            where: {
                id: req.query.id
            }
        })

        res.json(1);
    })

    router.post("/api/load-users", async (req, res) => {
        let users = await User.findAll({
            attributes: ["id", "name"],
            where: {
                name: {
                    [Op.like] : `${req.body.s}%`
                },
                id: {
                    [Op.not] : res.locals.user.id
                }
            },
            limit: 5,
            raw: true
        })

        let content = "";
        users.forEach(user => {
            content += `<a class="dropdown-item" href="/profile?user=${user.id}">${user.name}</a>`;
        })

        res.send(content);
    })

    router.post("/api/like", (req, res) => {
        if(req.body.action == "add"){
            Likes.create({
                user_id: res.locals.user.id,
                publication_id: req.body.id
            })
        } else if (req.body.action == "remove"){
            Likes.destroy({
                where: {
                    user_id: res.locals.user.id,
                    publication_id: req.body.id
                }
            })
        }
        res.json(1);
    })

    router.post("/api/load-likes/:id", async (req, res) => {
        let likes = await Likes.findAll({
            where: {
                publication_id: req.params.id
            },
            attributes: ["user_id"],
            include: [
                {
                    model: User,
                    attributes: ["name"]
                }
            ],
            order: ['created_at'],
            raw: true
        })

        let content = "";
        likes.forEach(like=>{
           content += `<a href="/profile?user=${like.user_id}">${like["User.name"]}</a>`;
        })

        res.send(content);
    })

    router.post("/api/send-message", async (req, res) => {

        let chat = await Friends.findOne({
            where: {
                user_id: res.locals.user.id,
                friend_id: req.body.partnerId
            },
            attributes: ['chat_id']
        })

        let {id} = await Messages.create({
            chat_id: chat.chat_id,
            user_id: res.locals.user.id,
            message: req.body.message
        })

        res.send(getChatContainer(res.locals.user.id, res.locals.user.avatar, res.locals.user.name, req.body.message, id, "Messages"));
    });


    return router;

}