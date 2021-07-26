const express = require("express");
const router = express.Router();
const {Publications, User, Comments, Likes, sequelize} = require("../../models/db");

module.exports = (options={}) => {

    router.get("/publication/:id", async (req, res) => {
 
        try{
        options.publication = await Publications.findOne({
            where: {
                id: req.params.id
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
    } catch {
        return res.redirect("/");
    }
        if(!options.publication){
            return res.redirect("/");
        }

        res.render("publicationPage", options);
        
    })

    router.post("/post-publication", (req, res) => {

        Publications.create({
            post_text: req.body.postText,
            post_photo: req.body.postImage,
            user_id: res.locals.user.id
        }).then(()=>{
            res.redirect("/");
        })
        
    })

    router.get("/post-publication", async (req, res)=>{

        res.render("postPublication", options);
    })

    return router;
}