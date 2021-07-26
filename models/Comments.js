module.exports = (sequelize, DataTypes)=>{

    const Comments = sequelize.define("Comments", {
        comment:{
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: "TIMESTAMP",
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
          }
    },{
        tableName: "comments",
        updatedAt: false,
        createdAt: "created_at"
    })

    Comments.associate = (models) => {
        Comments.belongsTo(models.User,{
            foreignKey: {
                name: 'user_id'
            }
        })

        Comments.belongsTo(models.Publications,{
            foreignKey:{
                name: "publication_id"
            },
            onDelete: 'cascade' 
        })
    }

    return Comments;

}