var w = document.body.clientWidth * 0.9;
var h = w /3;
var margin = 20;


var colors = ["#676867", "#909090", "#BCBCBC", "#003785", "#003785", "#2D6BB5", "#5798DA", "#91C6F2", "#C7E4F8"]


d3.csv("../resources/wfh/metro.csv", //filename, 
function(d) {return {GROUP:d.GROUP, VAL:parseFloat(d.PCT_WFH)}}, 
function(error, data) {

    console.log(data)

    var xScale = d3.scaleBand()
                    .domain(d3.range(data.length))
                    .rangeRound([margin, w-margin])
                    .paddingInner(0.05);

    var yScale = d3.scaleLinear()
                    .domain([0, 0.5])
                    .range([margin, h-margin]);
    
    var z = d3.scaleBand().domain(d3.range(data.length)).range(colors)
                    

    //Create SVG element
    var svg = d3.select("#chart")
                .attr("align","center")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    //Create bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
                return xScale(i);
        })
        .attr("y", function(d) {
                return h - yScale(d.VAL);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
                return yScale(d.VAL)
        })
        .attr("fill", function(d, i) {
            return colors[i]});

    // Create labels
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
                return d.GROUP;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
                return xScale(i) + xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
                return h - yScale(d.VAL) + 14;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white")

    })
