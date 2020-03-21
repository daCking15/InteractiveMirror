window.onload=function(){
    main();
}
    
function main (){
    //width of Country Middle Section
    var labelArea = 160;
    var textArea = 75;
    var countryWidth = 94;
    var textHeight = 20;
    
    //chart sizing variables
    var chart,
        width = 2500;
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
    
    //Date
    var date;
    if (localStorage.getItem("changeDate")==null){
        date = "22-Jan";
    }else{
        date = localStorage.getItem("changeDate");
    }
    document.getElementById("date").innerHTML = date;
    document.getElementById("button").addEventListener("click", changeDate);
    
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

        var countries = d3.select(".CountryDiv")
            .append('svg')
            .attr('class', 'chart')
            .attr('width', countryWidth)
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
        leftChart.selectAll("rect.left")
                .data(dateSlice)
                .enter().append("rect")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol]/100);
                })  
                .attr("y", yPosByIndex)
                .attr("class", "left")
                .attr("width", function (d) {
                    return xFrom(d[lCol]);
                })
                .attr("height", y.rangeBand());
        leftChart.selectAll("text.leftscore")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", function (d) {
                    return width - xFrom(d[lCol]/100)-40;
                })
                .attr("y", function (d) {
                    return y(d.Country) + y.rangeBand() / 2;
                })
                .attr("dx", "20")
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'leftscore')
                .text(function(d){return d[lCol];});
        countries.selectAll("text.name")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", 45)
                .attr("y", function (d) {
                    return y(d.Country) + y.rangeBand() / 2;
                })
                .attr("dy", ".20em")
                .attr("text-anchor", "middle")
                .attr('class', 'name')
                .text(function(d){return d.Country;});

        rightChart.selectAll("rect.right")
                .data(dateSlice)
                .enter().append("rect")
                .attr("x", 0)
                .attr("y", yPosByIndex)
                .attr("class", "right")
                .attr("width", function (d) {
                    return xTo(d[rCol]/100);
                })
                .attr("height", y.rangeBand());
        rightChart.selectAll("text.score")
                .data(dateSlice)
                .enter().append("text")
                .attr("x", function (d) {
                    return xTo(d[rCol]/100)+rightOffset;
                })
                .attr("y", function (d) {
                    return y(d.Country) + y.rangeBand() / 2;
                })
                .attr("dx", -5)
                .attr("dy", ".36em")
                .attr("text-anchor", "end")
                .attr('class', 'score')
                .text(function(d){return d[rCol];});
        leftChart.append("text").attr("x",width-80).attr("y", 15).attr("class","title").text(lCol);
        rightChart.append("text").attr("x",0).attr("y", 15).attr("class","title").text(rCol);
        countries.append("text").attr("x",18).attr("y", 15).attr("class","title").text("Country");
    }

    function type(d) {
        d["Deaths"] = +d["Deaths"];
        d["Infections"] = +d["Infections"];
        d["Recovered"] = +d["Recovered"];
        return d;
    }

    d3.csv("Corona_March19th.csv", type, render);
}