﻿var express = require("express");
var router = express.Router();

var crawler = require(__base + "/libs/zdr/crawler");

// get top stroies.
router.get("/", function (req, res, next)
{
    //TODO: 暂时先用这种方法，后面加上爬虫。读取本地缓存。
    crawler.getTopStories(res);
});

module.exports = router;
