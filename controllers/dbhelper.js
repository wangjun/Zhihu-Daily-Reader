﻿var _ = require("lodash");
var async = require("async");
var config = require("config");
var mongoose = require("mongoose");

/**
 * 连接数据库。
 * @param {Function(err)} [p_callback]
 */
exports.connect = function (p_callback)
{
    mongoose.connect(
        config.db,
        {
            server: {
                auto_reconnect: config.auto_reconnect,
                poolSize: config.poolSize
            },
        },
        p_callback
    );
};

/**
 * 检查数据库是否已连接。
 */
 exports.connected = function ()
{
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting
    return mongoose.connection.readyState == 1;
};

/**
 * 删除所有集合。
 * @param {Function(err)} [p_callback]
 */
 exports.dropAllCollections = function (p_callback)
{
    async.each(mongoose.connection.collections, function (collection, done)
    {
        collection.drop(done);
    },
    function (err)
    {
        if (_.isFunction(p_callback))
        {
            if (!err || err.message == "ns not found")
            {
                p_callback()
            }
            else
            {
                p_callback(err);
            }
        }
    });
};
