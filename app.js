﻿var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var favicon = require("serve-favicon");

var app = express();

// base dir setup
global.__base = __dirname;

// view engine setup
app.set("views", __dirname + "/views");
app.set("view engine", "jade");

// favicon setup
app.use(favicon(__dirname + "/public/assets/zdr/common/res/img/favicon.ico"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// router setup
app.use("/", require("./routes"));

// static file setup
if (app.get("env") === "development")
{
    app.use("/assets", express.static(__dirname + "/public/assets"));
}
else
{
    app.use("/assets", express.static(__dirname + "/public/assets", { maxAge: 2592000000 }));
}

// catch 404 and forward to error handler
app.use(function (req, res, next)
{
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next)
{
    res.status(err.status || 500);
    res.render("error_404");
});

module.exports = app;
