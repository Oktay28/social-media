const express = require("express");
const {Publications, User, Friends, Likes, Comments, sequelize, Sequelize} = require("../../models/db");
const router = express.Router();
const {noQuery} = require("../middlewares");
const Op = Sequelize.Op;

module.exports = (options = {})=>{

    router.get("/", noQuery, async (req, res)=>{
        options.publications = await Publications.findAll({
            where: {
                [Op.or]: {
                    user_id: res.locals.user.id,
                    "$User.Friends.user_id$": res.locals.user.id
                } 
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
                    attributes: [ 'id', 'name', 'avatar' ],
                    include: [
                        {
                            model: Friends,
                            attributes: []
                        }
                    ]
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
            ],
            order: [
                ['created_at', 'DESC']
            ],
            group: ['publications.id'],
            raw: true
        });

        res.render("index", options);
       
    })

    return router;
}