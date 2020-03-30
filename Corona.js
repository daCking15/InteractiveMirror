var maxWidth;
var scaleFactor;
var width;

window.onload=function(){
    scaleFactor = prompt("Scale Factor : ", "");
    width = 250000*scaleFactor;
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

//Button Functions
function changeDate(){
    date = prompt("Date: ", "");
    document.getElementById("date").innerHTML = date;
    localStorage.setItem("changeDate", date);
}
function changeLeft(){
    lCol = prompt("Data: ", "");
    localStorage.setItem("left", lCol);
}
function changeRight(){
    rCol = prompt("Data: ", "");
    localStorage.setItem("right", rCol);
}
    
function main (){
    //width of Health Condition Middle Section
    var labelArea = 160;
    var textArea = 75;
    var conditionWidth = 94;
    var textHeight = 20;
    
    //chart sizing variables
    var chart,
        bar_height = 2,
        height = bar_height * 200;
    var rightOffset = 50;
    var xFrom = d3.scale.identity();
    var xTo = d3.scale.identity();
    var y = d3.scale.ordinal()
            .rangeBands([textHeight, height]);
    
    //Data
    var lCol;
    var rCol;
    if (localStorage.getItem("left")==null){
        lCol = "China";
    }else{
        lCol = localStorage.getItem("left");
    }
    if (localStorage.getItem("right")==null){
        rCol = "United States";
    }else{
        rCol = localStorage.getItem("right");
    }
    document.getElementById("left").addEventListener("click", changeLeft);
    document.getElementById("right").addEventListener("click", changeRight);
    
    //Date
    var date;
    if (localStorage.getItem("changeDate")==null){
        date = "22-Jan";
    }else{
        date = localStorage.getItem("changeDate");
    }
    document.getElementById("date").innerHTML = date;
    document.getElementById("button").addEventListener("click", changeDate);

    //Render
    function render(data) {

        //Subset of Data based on date
        var dateSlice = new Array();
        data.forEach(
            function(item){
                if (item.Date == date){
                    dateSlice.push(item);
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

        var conditions = d3.select(".ConditionDiv")
            .append('svg')
            .attr('class', 'chart')
            .attr('width', conditionWidth)
            .attr('height', height);

        xFrom.domain(d3.extent(dateSlice, function (d) {
            return d[lCol];
        }));
        xTo.domain(d3.extent(dateSlice, function (d) {
            return d[rCol];
        }));

        y.domain(dateSlice.map(function (d) {
            return d.Conditions;
        }));

        var yPosByIndex = function (d) {
            return y(d.Conditions);
        };
        leftChart.selectAll("rect.left")
                .data(dateSlice)
                .enter().append("rect")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol]*scaleFactor);
                })  
                .attr("y", yPosByIndex)
                .attr("class", "left")
                .attr("width", function (d) {
                    return xFrom(d[lCol]*scaleFactor);
                })
                .attr("height", y.rangeBand());
        leftChart.selectAll("text.leftscore")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol]*scaleFactor)-40;
                })
                .attr("y", function (d) {
                    return y(d.Conditions) + y.rangeBand() / 2;
                })
                .attr("dx", "20")
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'leftscore')
                .text(function(d){return d[lCol];});
        conditions.selectAll("text.name")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", 45)
                .attr("y", function (d) {
                    return y(d.Conditions) + y.rangeBand() / 2;
                })
                .attr("dy", ".20em")
                .attr("text-anchor", "middle")
                .attr('class', 'name')
                .text(function(d){return d.Conditions;});

        rightChart.selectAll("rect.right")
                .data(dateSlice)
                .enter().append("rect")
                .attr("x", 0)
                .attr("y", yPosByIndex)
                .attr("class", "right")
                .attr("width", function (d) {
                    return xTo(d[rCol]*scaleFactor);
                })
                .attr("height", y.rangeBand());
        rightChart.selectAll("text.score")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", function (d) {
                    return xTo(d[rCol]*scaleFactor)+rightOffset;
                })
                .attr("y", function (d) {
                    return y(d.Conditions) + y.rangeBand() / 2;
                })
                .attr("dx", -5)
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'score')
                .text(function(d){return d[rCol];});
        leftChart.append("text").attr("x",width-80).attr("y", 15).attr("class","title").text(lCol);
        rightChart.append("text").attr("x",0).attr("y", 15).attr("class","title").text(rCol);
        conditions.append("text").attr("x",18).attr("y", 15).attr("class","title").text("Condition");
         $('.LeftMirrorDiv').scrollLeft(width);
        maxWidth = $('.LeftMirrorDiv').scrollLeft();
    }

    function type(d) {
        d["China"] = +d["China"];
        d["Italy"] = +d["Italy"];
        d["Iran"] = +d["Iran"];
        d["South Korea"] = +d["South Korea"];
        d["France"] = +d["France"];
        d["Spain"] = +d["Spain"];
        d["Germany"] = +d["Germany"];
        d["United States"] = +d["United States"];
        d["Total"] = +d["Total"];
        return d;
    }

    d3.csv("Corona_NewFormat.csv", type, render);
}