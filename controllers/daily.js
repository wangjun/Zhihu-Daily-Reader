﻿"use strict";

/**
 * 负责请求知乎日报 API，并返回结果。
 */

const _ = require("lodash");
const config = require("config");
const cheerio = require("cheerio");
const querystring = require("querystring");
const imageRequest = require("request");
const dailyRequest = require("request").defaults({
    baseUrl: config.zhihu_daily_api
});

const utils = require("./utils");
const PREFIX = "/api/4/imgs/";

/**
 * 获取最新知乎日报 ID 列表。
 * @param {Function(err, res)} [p_callback]
 */
module.exports.fetchLatestStoryIDs = function (p_callback)
{
    if (!_.isFunction(p_callback)) return;

    dailyRequest.get({ url: "/news/latest", json: true }, (err, res, body) =>
    {
        if (!err && res.statusCode == 200)
        {
            // 因知乎日报的 API 返回的图片太小，这里直接丢弃，后面再通过其他途径获取图片。
            p_callback(null, {
                date: body.date,
                ids: body.stories.map((value) => value.id)
            });
        }
        else
        {
            p_callback(new Error("request Zhihu-Daily API ('/news/latest') error."));
        }
    });
};

/**
 * 获取最新热门知乎日报 ID 列表。
 * @param {Function(err, res)} [p_callback]
 */
module.exports.fetchTopStoryIDs = function (p_callback)
{
    dailyRequest.get({ url: "/news/latest", json: true }, (err, res, body) =>
    {
        if (!err && res.statusCode == 200)
        {
            const images = [];
            const stories = { date: body.date };
            stories.ids = body.top_stories.map((value) =>
            {
                images.push(value.image);
                return {
                    id: value.id,
                    title: value.title,
                    image: PREFIX + querystring.escape(value.image)
                };
            });
            p_callback(null, {
                stories: stories,
                images: images
            });
        }
        else
        {
            p_callback(new Error("request Zhihu-Daily API ('/news/latest') error."));
        }
    });
};

/**
 * 获取指定日期的知乎日报 ID 列表。
 * @param {String} p_date 日期。如果小于"20130519"，返回值 res 为 {}。
 * @param {Function(err, res)} [p_callback]
 */
module.exports.fetchStoryIDs = function (p_date, p_callback)
{
    if (!_.isFunction(p_callback)) return;

    // 因知乎日报 API 返回的是指定日期的前一天的日报，
    // 所以要加一天才能获取指定日期的日报。
    const date = utils.nextZhihuDay(p_date);
    if (date)
    {
        if (utils.convertZhihuDateToMoment(date).isBefore(utils.MIN_DATE))
        {
            // "20130519"之前是没有知乎日报的。
            p_callback(null, {});
        }
        else
        {
            dailyRequest.get({ url: "/news/before/" + date, json: true }, (err, res, body) =>
            {
                if (!err && res.statusCode == 200)
                {
                    p_callback(null, {
                        date: body.date,
                        ids: body.stories.map((value) => value.id)
                    });
                }
                else
                {
                    p_callback(new Error("request Zhihu-Daily API ('/news/before/:date') error."));
                }
            });
        }
    }
    else
    {
        p_callback(new Error("p_date has a wrong format."));
    }
};

/**
 * 获取指定 ID 的知乎日报。
 * @param {String} p_id ID。
 * @param {Function(err, res)} [p_callback]
 */
module.exports.fetchStory = function (p_id, p_callback)
{
    if (!_.isFunction(p_callback)) return;

    // 检查 ID 是否为纯数字。
    if (/^\d+$/.test(p_id))
    {
        dailyRequest.get({ url: "/news/" + p_id, json: true }, (err, res, body) =>
        {
            if (!err && res.statusCode == 200)
            {
                const images = [];
                const story = {};
                story.id = body.id;
                story.title = body.title;

                images.push(body.image);
                story.image = PREFIX + querystring.escape(body.image);

                story.imageSource = body.image_source;
                story.shareURL = body.share_url;

                if (body.body)
                {
                    const $ = cheerio.load(body.body, { decodeEntities: false });

                    // 所有链接都添加新标签打开。
                    $("a").each((i, e) =>
                    {
                        $(e).attr("target", "_blank");
                    });

                    story.backgrounds = $(".headline>.headline-background .headline-background-link").map((i, e) =>
                    {
                        return {
                            href: $(e).attr("href"),
                            title: $(e).children(".heading").text(),
                            text: $(e).children(".heading-content").text()
                        };
                    }).get();

                    let src;
                    let links;
                    let avatar;
                    let question;
                    story.contents = $(".content-inner>.question").map((i, e) =>
                    {
                        question = {};
                        question.title = $(e).children(".question-title").text();

                        links = $(e).find(".view-more>a");
                        if (links.length > 0)
                        {
                            question.link = {
                                href: links.attr("href"),
                                text: links.text(),
                            };

                            // 删除多余的外链。
                            $(e).find(".view-more").remove();
                        }

                        question.answers = $(e).children(".answer").map((i, e) =>
                        {
                            $(e).find(".content img").each((i, e) =>
                            {
                                src = $(e).attr("src");
                                if (!_.isEmpty(src))
                                {
                                    images.push(src);
                                    $(e).attr("src", PREFIX + querystring.escape(src));
                                }
                            });

                            avatar = $(e).find(".meta>.avatar").attr("src");
                            if (_.isEmpty(avatar))
                            {
                                avatar = "";
                            }
                            else
                            {
                                images.push(avatar);
                                avatar = PREFIX + querystring.escape(avatar);
                            }

                            return {
                                avatar: avatar,
                                name: $(e).find(".meta>.author").text(),
                                bio: $(e).find(".meta>.bio").text(),
                                content: $(e).children(".content").html()
                            };
                        }).get();

                        return question;
                    }).get();
                }

                p_callback(null, {
                    story: story,
                    images: images
                });
            }
            else
            {
                p_callback(new Error("request Zhihu-Daily API ('/news/:id') error."));
            }
        });
    }
    else
    {
        p_callback(new Error("p_id has a wrong format."));
    }
};

/**
 * 获取指定地址的图片。
 * @param {String} p_url 地址。
 * @param {Function(err, res)} [p_callback]
 */
module.exports.fetchImage = function (p_url, p_callback)
{
    if (!_.isFunction(p_callback)) return;

    if (_.isEmpty(p_url))
    {
        p_callback(new Error("p_url must not be null."));
    }
    else
    {
        imageRequest({ url: p_url, encoding: null }, (err, res, body) =>
        {
            if (!err && res.statusCode == 200)
            {
                p_callback(null, {
                    id: p_url,
                    contentType: res.headers["content-type"],
                    data: body
                });
            }
            else
            {
                p_callback(new Error("failed to request image."));
            }
        });
    }
};
