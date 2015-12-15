﻿var _ = require("lodash");
var should = require("should");

var Story = require("../../models/story");
var StoryController = require("../../controllers/story");
var dbhelper = require("../../controllers/dbhelper");

describe("controllers/story", function ()
{
    before(function (done)
    {
        if (dbhelper.connected())
        {
            dbhelper.dropAllCollections(done);
        }
        else
        {
            dbhelper.connect(function (err)
            {
                should.not.exist(err);
                dbhelper.dropAllCollections(done);
            });
        }
    });
    
    describe("1.init", function ()
    {
        it("should create new stories: id[0~9], date[20140909, 20150910]", function (done)
        {
            var stories = [];
            for (var i = 0; i < 5; i++)
            {
                stories.push({
                    id : i,
                    date : "20150909",
                    read : (i <= 2),
                    content : "神经科学/生物学" + i,
                    cached: (i <= 2)
                });
            }
            
            for (var i = 5; i < 10; i++)
            {
                stories.push({
                    id : i,
                    date : "20150910",
                    read : (i >= 7),
                    content : "神经科学/生物学" + i,
                    cached: (i >= 7)
                });
            }
            
            Story.create(stories, function (err, res)
            {
                should.not.exist(err);
                done();
            });
        });
    });
    
    describe("2.findStoryByID", function ()
    {
        var id = 3;
        it("should find the story of ID: " + id, function (done)
        {
            StoryController.findStoryByID(id, function (err, doc)
            {
                should.not.exist(err);
                should.exist(doc);
                doc.id.should.equal(id);
                done();
            });
        });
    });
    
    describe("3.findStoriesByDate", function ()
    {
        var date = "20150910";
        it("should find the stories of date: " + date, function (done)
        {
            StoryController.findStoriesByDate(date, function (err, docs)
            {
                should.not.exist(err);
                should.exist(docs);
                docs.length.should.equal(5);
                _.each(docs, function (value, index)
                {
                    value.date.should.equal(date);
                });
                done();
            });
        });
    });
    
    describe("4.findUnreadStories", function ()
    {
        var date = "20150910";
        it("should find the unread stories of date: " + date, function (done)
        {
            StoryController.findUnreadStories(date, function (err, docs)
            {
                should.not.exist(err);
                should.exist(docs);
                docs.length.should.equal(2);
                _.each(docs, function (value, index)
                {
                    value.date.should.equal(date);
                    value.read.should.be.false();
                });
                done();
            });
        });
        
        it("should find all of the unread stories", function (done)
        {
            StoryController.findUnreadStories(function (err, docs)
            {
                should.not.exist(err);
                should.exist(docs);
                docs.length.should.equal(4);
                _.each(docs, function (value, index)
                {
                    value.read.should.be.false();
                });
                done();
            });
        });
    });
    
    describe("5.findUncachedIDs", function ()
    {
        it("should find all uncached id", function (done)
        {
            StoryController.findUncachedIDs(function (err, docs)
            {
                should.not.exist(err);
                should.exist(docs);
                docs.length.should.equal(4);
                done();
            });
        });
    });
    
    describe("6.saveStory", function ()
    {
        it("should save story", function (done)
        {
            var zhihuStory = {
                id : 401,
                date: "20150911",
                title: "学英语才是正经事儿",
                imageSource : "人民教育出版社",
                contents : [
                    {
                        title: "神经科学/生物学3 - 修改"
                    }
                ]
            };
            
            StoryController.saveStory(zhihuStory, function (err, doc)
            {
                should.not.exist(err);
                should.exist(doc);
                doc.content.should.deepEqual(zhihuStory);
                done();
            });
        });
        
        it("should not save null story", function (done)
        {
            StoryController.saveStory(null, function (err, doc)
            {
                should.exist(err);
                should.not.exist(doc);
                done();
            });
        });
    });
    
    describe("7.removeOldStories", function ()
    {
        var date = "20150910";
        it("should remove stories older than: " + date, function (done)
        {
            StoryController.removeOldStories(date, function (err, res)
            {
                should.not.exist(err);
                should.exist(res);
                res.success.should.be.true();
                res.count.should.equal(5);
                done();
            });
        });
    });
});