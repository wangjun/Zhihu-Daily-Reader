﻿const _ = require("lodash");
const Catalog = require("../models/catalog");

/**
 * 保存知乎日报列表至数据库。如果已存在，则更新。
 * @param {Object} p_catalog 知乎日报列表。
 * @param {Function(err, doc)} [p_callback]
 */
module.exports.saveCatalog = function (p_catalog, p_callback)
{
    if (_.isEmpty(p_catalog) || !_.isObject(p_catalog))
    {
        if (_.isFunction(p_callback))
        {
            p_callback(new Error("p_catalog must be a non-empty Object."));
        }
    }
    else
    {
        Catalog.findOneAndUpdate(
            { date: p_catalog.date },
            p_catalog,
            { new: true, upsert: true },
            p_callback
        );
    }
};

/**
 * 从数据库中查找指定日期的知乎日报列表。
 * @param {String} p_date 日期（知乎格式，例如："20130519"）。
 * @param {Function(err, doc)} [p_callback]
 */
module.exports.findCatalogByDate = function (p_date, p_callback)
{
    if (_.isFunction(p_callback))
    {
        Catalog.findOne({ date: p_date }, p_callback);
    }
};

/**
 * 从数据库中查找最近日期的知乎日报列表（缓存的最近日期）。
 * @param {Function(err, doc)} [p_callback]
 */
module.exports.findLatestCatalog = function (p_callback)
{
    if (_.isFunction(p_callback))
    {
        Catalog.findOne({}, {}, { sort: { "date": -1 } }, p_callback);
    }
};

/**
 * 从数据库中查找满足条件的记录。
 * @param {Object} p_conditions 指定的查询条件。
 * @param {Object} [p_projection]
 * @param {Object} [p_options]
 * @param {Function(err, docs)} [p_callback]
 */
module.exports.query = function (p_conditions, p_projection, p_options, p_callback)
{
    Catalog.find(p_conditions, p_projection, p_options, p_callback);
};
