require("dotenv/config");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate:{
                isEmail: true
            },
            allowNull: false
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false
        }, 
        address:{
            type: DataTypes.STRING
        },
        gender:{
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        },
        job: {
            type: DataTypes.STRING
        },
        birthday: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING(20)
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: "/assets/images/default-user-img.jpg"
        }
    },{
        tableName: "users",
        updatedAt: false,
        createdAt: 'created_at'
    })

    User.addHook("beforeCreate" , async (user, options)=>{
        user.password = await bcrypt.hash(user.dataValues.password, 8);
    })

    User.associate = (models)=>{
        let arrModels = [
            models.Publications,
            models.Comments,
            models.Likes,
            models.Friends,
            models.Messages
        ];

        arrModels.forEach(model => {
            User.hasMany(model,{
                foreignKey: {
                    name: 'user_id'
                }
            });
        })

        User.hasMany(models.Friends,{
            foreignKey: {
                name: "friend_id"
            }
        })

    }

    User.findByCredentials = async (email ,password) => {
        const user =  await User.findOne({
            where: {
                email
            },
            raw:true
        })
        let found = false;
       
        if(user){
            found = bcrypt.compareSync(password, user.password);
        }

        return found ? user : null;
    }

    return User;
}