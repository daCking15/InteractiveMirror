window.onload=function(){

    var labelArea = 160;
    var chart,
            width = 400,
            bar_height = 2,
            height = bar_height * 200;
    var rightOffset = width + labelArea;
    //var xFrom = d3.scale.linear()
            //.range([0, width]);
    var xFrom = d3.scale.linear()
            .range([0, 300]);
    //var xTo = d3.scale.linear()
            //.range([0, width]);
    var xTo = d3.scale.linear()
            .range([0, 330]);
    var y = d3.scale.ordinal()
            .rangeBands([20, height]);
    
    var lCol;
    var rCol;
    if (localStorage.getItem("left")==null){
        lCol = "Infections";
    }else{
        lCol = localStorage.getItem("left");
    }
    if (localStorage.getItem("right")==null){
        rCol = "Deaths";
    }else{
        rCol = localStorage.getItem("right");
    }
    document.getElementById("left").addEventListener("click", changeLeft);
    document.getElementById("right").addEventListener("click", changeRight);
    
    var date;
    if (localStorage.getItem("changeDate")==null){
        date = "22-Jan";
    }else{
        date = localStorage.getItem("changeDate");
    }
    document.getElementById("date").innerHTML = date;
    
    //Prompt for date
    document.getElementById("button").addEventListener("click", changeDate);
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

    function render(data) {

        var dateSlice = new Array();
        data.forEach(
            function(item){
                if (item.Date == date){
                    dateSlice.push(item);
                }
            }
        );

        var chart = d3.select("body")
                .append('svg')
                .attr('class', 'chart')
                .attr('width', labelArea + width + width)
                .attr('height', height);

        xFrom.domain(d3.extent(dateSlice, function (d) {
            return d[lCol];
        }));
        xTo.domain(d3.extent(dateSlice, function (d) {
            return d[rCol];
        }));

        y.domain(dateSlice.map(function (d) {
            return d.Country;
        }));

        var yPosByIndex = function (d) {
            return y(d.Country);
        };
        chart.selectAll("rect.left")
                .data(dateSlice)
                .enter().append("rect")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol]);
                })  
                .attr("y", yPosByIndex)
                .attr("class", "left")
                .attr("width", function (d) {
                    return xFrom(d[lCol]);
                })
                .attr("height", y.rangeBand());
        chart.selectAll("text.leftscore")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol])-40;
                })
                .attr("y", function (d) {
                    return y(d.Country) + y.rangeBand() / 2;
                })
                .attr("dx", "20")
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'leftscore')
                .text(function(d){return d[lCol];});
        chart.selectAll("text.name")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", (labelArea / 2) + width)
                .attr("y", function (d) {
                    return y(d.Country) + y.rangeBand() / 2;
                })
                .attr("dy", ".20em")
                .attr("text-anchor", "middle")
                .attr('class', 'name')
                .text(function(d){return d.Country;});

        chart.selectAll("rect.right")
                .data(dateSlice)
                .enter().append("rect")
                .attr("x", rightOffset)
                .attr("y", yPosByIndex)
                .attr("class", "right")
                .attr("width", function (d) {
                    return xTo(d[rCol]);
                })
                .attr("height", y.rangeBand());
        chart.selectAll("text.score")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", function (d) {
                    return xTo(d[rCol]) + rightOffset+55;
                })
                .attr("y", function (d) {
                    return y(d.Country) + y.rangeBand() / 2;
                })
                .attr("dx", -5)
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'score')
                .text(function(d){return d[rCol];});
        chart.append("text").attr("x",width/3).attr("y", 10).attr("class","title").text(lCol);
        chart.append("text").attr("x",width/3+rightOffset).attr("y", 10).attr("class","title").text(rCol);
        chart.append("text").attr("x",width+labelArea/3).attr("y", 10).attr("class","title").text("Country");
    }

    function type(d) {
        d["Deaths"] = +d["Deaths"];
        d["Infections"] = +d["Infections"];
        d["Recovered"] = +d["Recovered"];
        return d;
    }

    d3.csv("Corona_March19th.csv", type, render);
}