module.exports = (sequelize, DataTypes) =>{

    const Likes = sequelize.define("Likes", {
    },{
        updatedAt: false,
        createdAt: "created_at",
        tableName: "likes"
    })

    Likes.associate = (models) => {
        Likes.belongsTo(models.User,{
            foreignKey: {
                name: 'user_id'
            }
        })

        Likes.belongsTo(models.Publications,{
            foreignKey:{
                name: "publication_id"
            },
            onDelete: 'cascade' 
        })


    }

   

    return Likes;

}