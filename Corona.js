var maxWidth;
var scaleFactor;
var width;
var compare;

window.onload=function(){
    scaleFactor = prompt("Scale Factor : ", "");
    width = 250000*scaleFactor+80;
    main();
    mirror();
}

function mirror(){
    $(document).ready(function(){
        $('.LeftMirrorDiv').on('scroll', function () {
            $('.RightMirrorDiv').scrollLeft(maxWidth - $(this).scrollLeft());
        });
    });
}

function changeLeft(){
    country1 = prompt("Country: ", "");
    localStorage.setItem("left", country1);
}
function changeRight(){
    country2 = prompt("Country: ", "");
    localStorage.setItem("right", country2);
}
function changeCompare(){
    compare = prompt("Compare: ", "");
    localStorage.setItem("compare", compare);
}
    
function main (){
    //width of Country Middle Section
    var labelArea = 160;
    var textArea = 75;
    var dateWidth = 94;
    var textHeight = 20;
    
    //chart sizing variables
    var chart,
        bar_height = 6,
        height = bar_height * 200;
    var rightOffset = 50;
    var xFrom = d3.scale.identity();
    var xTo = d3.scale.identity();
    var y = d3.scale.ordinal()
            .rangeBands([textHeight, height]);
    
    if (localStorage.getItem("left")==null){
        country1 = "China";
    }else{
        country1 = localStorage.getItem("left");
    }
    if (localStorage.getItem("right")==null){
        country2 = "United States";
    }else{
        country2 = localStorage.getItem("right");
    }
    if (localStorage.getItem("compare")==null){
        compare = "Infections";
    }else{
        compare = localStorage.getItem("compare");
    }
    document.getElementById("changeLeft").addEventListener("click", changeLeft);
    document.getElementById("changeRight").addEventListener("click", changeRight);
    document.getElementById("changeCompare").addEventListener("click", changeCompare);

    //Render
    function render(data) {

        var country1Slice = new Array();
        data.forEach(
            function(item){
                if (item.Country == country1){
                    country1Slice.push(item);
                }
            }
        );
        
        var country2Slice = new Array();
        data.forEach(
            function(item){
                if (item.Country == country2){
                    country2Slice.push(item);
                }
            }
        );
        
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
                    return width - xFrom(d[compare]*scaleFactor);
                })  
                .attr("y", yPosByIndex)
                .attr("class", "left")
                .attr("width", function (d) {
                    return xFrom(d[compare]*scaleFactor);
                })
                .attr("height", y.rangeBand());
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
                .attr("class", "right")
                .attr("width", function (d) {
                    return xTo(d[compare]*scaleFactor);
                })
                .attr("height", y.rangeBand());
        rightChart.selectAll("text.score")
                .data(country2Slice)
                .enter().append("text")
                .attr("x", function (d) {
                    return xTo(d[compare]*scaleFactor)+rightOffset;
                })
                .attr("y", function (d) {
                    return y(d.Date) + y.rangeBand() / 2;
                })
                .attr("dx", -5)
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'score')
                .text(function(d){return d[compare];});
        leftChart.append("text").attr("x",width-85).attr("y", 15).attr("class","title").text(country1);
        rightChart.append("text").attr("x",0).attr("y", 15).attr("class","title").text(country2);
        dates.append("text").attr("x",18).attr("y", 15).attr("class","title").text("Date");
         $('.LeftMirrorDiv').scrollLeft(width);
        maxWidth = $('.LeftMirrorDiv').scrollLeft();
    }

    function type(d) {
        d["Deaths"] = +d["Deaths"];
        d["Infections"] = +d["Infections"];
        d["Recovered"] = +d["Recovered"];
        return d;
    }

    d3.csv("Corona_March25th.csv", type, render);
}