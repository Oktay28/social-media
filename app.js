require("dotenv/config");
const express = require("express");
const fs = require("fs");
const chalk = require("chalk");
const bodyParser = require("body-parser");
const {sequelize} = require("./models/db.js");
const fileUpload = require("express-fileupload");
const cookieParser = require('cookie-parser')
const {userAuth} = require("./src/middlewares");

const PORT = process.env.PORT || 8080;

const app = new express();

app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views","./views");

app.use(bodyParser.urlencoded({extended: false}));

app.use(fileUpload());


sequelize.authenticate().then(async ()=>{
    await console.log(chalk.green("db connected succesfully"));
    await sequelize.sync().catch(err => console.log(err));

}).catch(()=>{
    console.log(chalk.red("db connection failed"));
})


app.use("/assets", express.static("./assets"));

app.use(require("./src/auth")());

app.use(userAuth);

fs.readdirSync("./src/routes").forEach(file=>{
    app.use(require(`./src/routes/${file}`)());
})


app.listen(PORT, ()=>{
    console.log(chalk.bold.bgGreen(`server listening on port : ${PORT}`));
})
