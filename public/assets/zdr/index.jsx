﻿require("./res/index.less");

var $ = require("jquery");
var React = require("react");

var Navbar = require("./components/Navbar");
var Carousel = require("./components/Carousel");

$(function ()
{
    React.render(
        <div className="MainContainer container-fluid">
            <Navbar />
            <div className="CarouselContainer container-fluid">
                <Carousel />
            </div>
            <div className="ContentContainer container" style={{height: 80}}/>
        </div>
        ,
        document.body
    );
});