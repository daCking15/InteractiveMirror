var bar_height = 6;
var chart;
var compare = "Infections";
//var countries = ["Total", "China", "Italy", "Iran", "South Korea", "France", "Spain", "Germany", "United States", "Switzerland", "United Kingdom", "Netherlands"];
var countries = new Array();
var country1;
var country1Slice = new Array();
var country2;
var country2Slice = new Array();
var dataMax = 500000;
var dateWidth = 94;
var h = 50;
var height = bar_height * 200;
var labelArea = 160;
var maxWidth;
var padding = 5;
var rightOffset = 50;
var scaleFactor;
var textArea = 75;
var textHeight = 20;
var width;
var xFrom = d3.scale.identity();
var xTo = d3.scale.identity();
var y = d3.scale.ordinal().rangeBands([textHeight, height]);   
         
d3.csv("Corona_April13th.csv", function(data){
    data.forEach(function(item){
        if ($.inArray(item.Country,countries) == -1){
            countries.push(item.Country)
        }
    });
});

// get parameters from url
// reference: https://blog.csdn.net/weixin_38676276/java/article/details/86594494
(function ($) {
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
})(jQuery);

window.onload = function(){
    generateItems();
    width = dataMax*scaleFactor;
    main();
    mirror();
}

function generateItems(){
    d3.csv("Corona_April13th.csv", function(data){
        data.forEach(function(item){
            if ($.inArray(item.Country,countries) == -1){
                countries.push(item.Country)
            }
        });

        countries.forEach(function(item){
            $('#changeLeft').append("<option value = '" + item + "'>" + item + "</option>");
            $('#changeRight').append("<option value = '" + item + "'>" + item + "</option>");
        });

        country1 = ($.getUrlParam("country1") == undefined) ? $('#changeLeft').val() : $.getUrlParam("country1");
        country2 = ($.getUrlParam("country2") == undefined) ? $('#changeRight').val() : $.getUrlParam("country2");
        compare = ($.getUrlParam("compare") == undefined) ? $('#changeCompare').val() : $.getUrlParam("compare");
        scaleFactor = $.getUrlParam("scaleFactor");
    
        $('#changeLeft').val(country1);
        $('#changeRight').val(country2);
        $('#changeCompare').val(compare);
        $('#changeScale').val(scaleFactor);    
    });
    
    // countries.forEach(function(item){
    //     $('#changeLeft').append("<option value = '" + item + "'>" + item + "</option>");
    //     $('#changeRight').append("<option value = '" + item + "'>" + item + "</option>");
    // });
    // comparisons.forEach(function(item){
    //     $('#changeCompare').append("<option value = '" + item + "'>" + item + "</option>");
    // });

    // country1 = ($.getUrlParam("country1") == undefined) ? $('#changeLeft').val() : $.getUrlParam("country1");
    // country2 = ($.getUrlParam("country2") == undefined) ? $('#changeRight').val() : $.getUrlParam("country2");
    // compare = ($.getUrlParam("compare") == undefined) ? $('#changeCompare').val() : $.getUrlParam("compare");
    // scaleFactor = $.getUrlParam("scaleFactor");

    // $('#changeLeft').val(country1);
    // $('#changeRight').val(country2);
    // $('#changeCompare').val(compare);
    // $('#changeScale').val(scaleFactor);

    $('#changeLeft').change(function(){
        country1 = $(this).val();
        localStorage.setItem("left", country1);
    });

    $('#changeRight').change(function(){
        country2 = $(this).val();
        localStorage.setItem("right", country2);
    });

    if ($('#changeScale').val() == '') {
        scaleFactor = 1;
    } else {
        scaleFactor = $('#changeScale').val();
    }

    $('#submit').click(function(){
        scaleFactor = $('#changeScale').val();
        url = window.location.href.replace(window.location.search,'') + "?country1=" + country1 + "&country2=" + country2 + "&compare=" + compare + "&scaleFactor=" + scaleFactor;
        window.location.href = url;
    });
}

function mirror(){
    $(document).ready(function(){
        $('.LeftScale').on('scroll', function () {
            $('.RightMirrorDiv').scrollLeft(maxWidth - $(this).scrollLeft());
            $('.RightScale').scrollLeft(maxWidth - $(this).scrollLeft());
            $('.LeftMirrorDiv').scrollLeft($(this).scrollLeft());
        });
        $('.RightScale').on('scroll', function () {
            $('.LeftMirrorDiv').scrollLeft(maxWidth - $(this).scrollLeft());
            $('.LeftScale').scrollLeft(maxWidth - $(this).scrollLeft());
            $('.RightMirrorDiv').scrollLeft($(this).scrollLeft());
        });
        $('.RightMirrorDiv').on('scroll', function () {
            $('.LeftMirrorDiv').scrollLeft(maxWidth - $(this).scrollLeft());
            $('.LeftScale').scrollLeft(maxWidth - $(this).scrollLeft());
            $('.RightScale').scrollLeft($(this).scrollLeft());
        });
        $('.DateDiv').on('scroll', function () {
            $('.LeftMirrorDiv').scrollTop($(this).scrollTop());
            $('.RightMirrorDiv').scrollTop($(this).scrollTop());
        });
    });
}

function main (){

    //Render
    function render(data) {
        
        countrySlice(data);
        setWidth(data);
        makeScale(data);
        originalRender(data);
        setInitialScroll();
        
        function countrySlice(data){
            
            data.forEach(
                function(item){
                    if (item.Country == country1){
                        country1Slice.push(item);
                    }
                }
            );
            data.forEach(
                function(item){
                    if (item.Country == country2){
                        country2Slice.push(item);
                    }
                }
            );           
        }
        function setWidth(data){
            dataMax = country1Slice[0]["Tests"];
            for (i=0; i<country1Slice.length; i++){
                if (country1Slice[i]["Tests"] > dataMax){
                    dataMax = country1Slice[i]["Tests"];
                }
                if (country1Slice[i]["Infections"] > dataMax){
                    dataMax = country1Slice[i]["Infections"];
                }
            }
            for (i=0; i<country2Slice.length; i++){
                if (country2Slice[i]["Tests"] > dataMax){
                    dataMax = country2Slice[i]["Tests"];
                }
                if (country1Slice[i]["Infections"] > dataMax){
                    dataMax = country2Slice[i]["Infections"];
                }
            }
            console.log(dataMax);

            width = dataMax*scaleFactor+$(".LeftMirrorDiv").width();           
        }
        function makeScale(data){
            var hScale = d3.scale.ordinal()
                .domain(d3.range(0, dataMax+1))
                .rangeBands([0, width-$(".LeftMirrorDiv").width()]);

            var hScaleR = d3.scale.ordinal()
                .domain(d3.range(0, dataMax+1))
                .rangeBands([width-$(".LeftMirrorDiv").width(), 0]);
            
            
            tickArray = new Array();
            for (i=0; i<(dataMax/(100/scaleFactor)); i++){
                tickArray.push(((100/scaleFactor)*i).toFixed());
            }
            
            var hAxis = d3.svg.axis()
                .scale(hScale)
                .orient('bottom')
                .tickValues(tickArray);

            var hAxisR = d3.svg.axis()
                .scale(hScaleR)
                .orient('bottom')
                .tickValues(tickArray);

            var hGuide = d3.select(".RightScale")
                .append('svg')
                    .attr("width", width)
                    .attr("height", 30)
                .append('g')
                    hAxis(hGuide)
                    hGuide.attr('transform', 'translate(0,2)')
                    hGuide.selectAll('path')
                        .style('fill', 'none')
                        .style('stroke', '#000')
                    hGuide.selectAll('line')
                        .style('stroke', '#000');

            var hGuideR = d3.select(".LeftScale")
                .append('svg')
                    .attr("width", width)
                    .attr("height", 30)
                    .attr("class", "nav")
                .append('g')
                    hAxisR(hGuideR)
                    hGuideR.attr('transform', 'translate('+$(".LeftMirrorDiv").width()+',2)')
                    hGuideR.selectAll('path')
                        .style('fill', 'none')
                        .style('stroke', '#000')
                    hGuideR.selectAll('line')
                        .style('stroke', '#000');            
        }
        function originalRender(data){
            
            var infectionsLegend = d3.select("#infectionsSquare")
                .append('svg')
                    .append("rect")
                        .attr("class", "infectionsBar")
                        .attr("x", 1)
                        .attr("y", 1)
                        .attr("width", 33)
                        .attr("height", 33)
                        .attr("float", "left");
            var leftChart = d3.select(".LeftMirrorDiv")
                .append('svg')
                .attr('class', 'chart')
                .attr('width', width)
                .attr('height', height);

            var rightChart = d3.select(".RightMirrorDiv")
                .append('svg')
                .attr('class', 'chart')
                .attr('width', width)
                .attr('height', height);

            var dates = d3.select(".DateDiv")
                .append('svg')
                .attr('class', 'chart')
                .attr('width', dateWidth)
                .attr('height', height);

            xFrom.domain(d3.extent(country1Slice, function (d) {
                return d[compare];
            }));
            xTo.domain(d3.extent(country2Slice, function (d) {
                return d[compare];
            }));

            y.domain(country1Slice.map(function (d) {
                return d.Date;
            }));

            var yPosByIndex = function (d) {
                return y(d.Date);
            };
            
            leftChart.selectAll("rect.left")
                    .data(country1Slice)
                    .enter().append("rect")
                    .attr("x", function (d) {
                        return width - xFrom(d["Infections"]*scaleFactor);
                    })  
                    .attr("y", yPosByIndex)
                    .attr("class", "infectionsBar")
                    .attr("width", function (d) {
                        return xFrom(d["Infections"]*scaleFactor);
                    })
                    .attr("height", y.rangeBand());
            leftChart.selectAll("rect.left")
                    .data(country1Slice)
                    .enter().append("rect")
                    .attr("x", function (d) {
                        return width - xFrom(d["Recovered"]*scaleFactor);
                    })  
                    .attr("y", yPosByIndex)
                    .attr("class", "recoveredBar")
                    .attr("width", function (d) {
                        return xFrom(d["Recovered"]*scaleFactor);
                    })
                    .attr("height", y.rangeBand());
            leftChart.selectAll("rect.left")
                    .data(country1Slice)
                    .enter().append("rect")
                    .attr("x", function (d) {
                        return width - xFrom(d["Deaths"]*scaleFactor);
                    })  
                    .attr("y", yPosByIndex)
                    .attr("class", "deathsBar")
                    .attr("width", function (d) {
                        return xFrom(d["Deaths"]*scaleFactor);
                    })
                    .attr("height", y.rangeBand());
            leftChart.selectAll("rect.left")
                    .data(country1Slice)
                    .enter().append("rect")
                    .attr("x", function (d) {
                        return width - xFrom(d["Tests"]*scaleFactor);
                    })  
                    .attr("y", yPosByIndex)
                    .attr("class", "testsBar")
                    .attr("width", function (d) {
                        return xFrom(d["Tests"]*scaleFactor);
                    })
                    .attr("height", 2);
            /*
            leftChart.selectAll("text.leftscore")
                    .data(country1Slice)
                    .enter().append("text")
                    .attr("x", function (d) {
                        return width - xFrom(d[compare]*scaleFactor)-40;
                    })
                    .attr("y", function (d) {
                        return y(d.Date) + y.rangeBand() / 2;
                    })
                    .attr("dx", "20")
                    .attr("dy", ".36em")
                    .attr("text-anchor", "end")
                    .attr('class', 'leftscore')
                    .text(function(d){return d[compare];});
                    */
                    
            dates.selectAll("text.name")
                    .data(country2Slice)
                    .enter().append("text")
                    .attr("x", 45)
                    .attr("y", function (d) {
                        return y(d.Date) + y.rangeBand() / 2;
                    })
                    .attr("dy", ".20em")
                    .attr("text-anchor", "middle")
                    .attr('class', 'name')
                    .text(function(d){return d.Date;});

            rightChart.selectAll("rect.right")
                    .data(country2Slice)
                    .enter().append("rect")
                    .attr("x", 0)
                    .attr("y", yPosByIndex)
                    .attr("class", "infectionsBar")
                    .attr("width", function (d) {
                        return xTo(d["Infections"]*scaleFactor);
                    })
                    .attr("height", y.rangeBand());
            rightChart.selectAll("rect.right")
                    .data(country2Slice)
                    .enter().append("rect")
                    .attr("x", 0)
                    .attr("y", yPosByIndex)
                    .attr("class", "recoveredBar")
                    .attr("width", function (d) {
                        return xTo(d["Recovered"]*scaleFactor);
                    })
                    .attr("height", y.rangeBand());
            rightChart.selectAll("rect.right")
                    .data(country2Slice)
                    .enter().append("rect")
                    .attr("x", 0)
                    .attr("y", yPosByIndex)
                    .attr("class", "deathsBar")
                    .attr("width", function (d) {
                        return xTo(d["Deaths"]*scaleFactor);
                    })
                    .attr("height", y.rangeBand());
            rightChart.selectAll("rect.right")
                    .data(country2Slice)
                    .enter().append("rect")
                    .attr("x", 0)
                    .attr("y", yPosByIndex)
                    .attr("class", "testsBar")
                    .attr("width", function (d) {
                        return xTo(d["Tests"]*scaleFactor);
                    })
                    .attr("height", 2);
           /* rightChart.selectAll("text.score")
                    .data(country2Slice)
                    .enter().append("text")
                    .attr("x", function (d) {
                        return xTo(d["Infections"]*scaleFactor)+rightOffset;
                    })
                    .attr("y", function (d) {
                        return y(d.Date) + y.rangeBand() / 2;
                    })
                    .attr("dx", -5)
                    .attr("dy", ".36em")
                    .attr("text-anchor", "end")
                    .attr('class', 'score')
                    .text(function(d){return d["Infections"];});
            */
        }
        function setInitialScroll(){
            $('.LeftMirrorDiv').scrollLeft(width);
            maxWidth = $('.LeftMirrorDiv').scrollLeft();

            $('.LeftScale').scrollLeft(width);
            maxWidth = $('.LeftScale').scrollLeft();            
        }
        
    }
    
    function type(d) {
        d["Deaths"] = +d["Deaths"];
        d["Infections"] = +d["Infections"];
        d["Recovered"] = +d["Recovered"];
        d["Tests"] = +d["Tests"];
        return d;
    }
    
    d3.csv("Corona_April13th.csv", type, render);
}