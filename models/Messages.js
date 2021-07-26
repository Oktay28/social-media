module.exports = (sequelize, DataTypes) =>{
    const Messages = sequelize.define("Messages", {
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        created_at: {
            type: "TIMESTAMP",
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
          }
    },{
        tableName: "messages",
        updatedAt: false,
        createdAt: "created_at"
    })

    Messages.associate = (models) =>{

        Messages.belongsTo(models.Chat, {
            foreignKey: {
                name: "chat_id"
            },
            onDelete: 'cascade'
        })

        Messages.belongsTo(models.User, {
            foreignKey: {
                name: "user_id"
            }
        })
        
    }

    return Messages;
}