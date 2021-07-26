module.exports = (sequelize, DataTypes)=>{
    const Publications = sequelize.define("Publications", {
        post_text:{
            type: DataTypes.TEXT
        },
        post_photo:{
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: "TIMESTAMP",
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
          }
    },{
        tableName: "publications",
        updatedAt: "updated_at",
        createdAt: 'created_at'
    })

    Publications.associate = (models)=>{
        Publications.belongsTo(models.User,{
            foreignKey: {
                name: 'user_id'
            }
        });

        Publications.hasMany(models.Comments,{
            foreignKey:{
                name: "publication_id"
            }
        })

        Publications.hasMany(models.Likes,{
            foreignKey:{
                name: "publication_id"
            }
        })

    }

    return Publications;
}