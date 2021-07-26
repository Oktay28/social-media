module.exports = (sequelize, DataTypes) =>{
    const Friends = sequelize.define("Friends",{
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        }
    },{
        tableName: "friends",
        timestamps: false
    })

    Friends.associate = (models) =>{
        Friends.belongsTo(models.User, {
            foreignKey: {
                name: "user_id"
            }
        })

        Friends.belongsTo(models.User, {
            foreignKey:{
                name: "friend_id"
            } 
        })

        Friends.belongsTo(models.Chat, {
            foreignKey:{
                name: "chat_id"
            } 
        })
        
    }

    return Friends;
}