module.exports = (sequelize, DataTypes) =>{
    const Chat = sequelize.define("Chat",{

    },{
        createdAt: "created_at",
        updatedAt: false,
        tableName: "chat" 
    })

    Chat.associate = (models) =>{

        Chat.hasMany(models.Messages, {
            foreignKey: {
                name: "chat_id"
            }
        })

        Chat.hasMany(models.Friends, {
            foreignKey: {
                name: "chat_id"
            }
        })


    }

    return Chat;
}