var filename = document.getElementById("metrochart").getAttribute("filename")

var w = document.body.clientWidth * 0.9;
var h = w / 3;
var margin = 20;


var colors = ["#676867", "#909090", "#BCBCBC", "#003785", "#003785", "#2D6BB5", "#5798DA", "#91C6F2", "#C7E4F8"]


d3.csv(filename, 
function(d) {return {GROUP:d.GROUP.replace('Metropolitan', 'Metro'), VAL:parseFloat(d.PCT_WFH)}}, 
function(error, data) {

    var xScale = d3.scaleBand()
                    // .domain(d3.range(data.length))
                    .domain(data.map(function(d) { return d.GROUP; }))
                    .rangeRound([margin, w-margin])
                    .paddingInner(0.05);

    var yScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([h - margin, margin])
                    .nice();

    var z = d3.scaleBand()
              .domain(d3.range(data.length))
              .range(colors)
                    

    //Create SVG element
    var svg = d3.select("#metro")
                .attr("align","center")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    xAxis = d3.axisBottom()
        .scale(xScale);

    yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(null, "").tickFormat(d3.format('.0%'));

    svg.append("g")
        .attr("class", "y.axis")
        .attr("transform", "translate(" + margin*2 + ",0)")
        .call(yAxis);

        // .ticks(data.length / 2);

    svg.append("g")
        .attr("class", "x.axis")
        .attr("transform", "translate(" + margin + "," + (h - margin) + ")")
        .call(xAxis);

    //Create bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
                return margin + xScale(d.GROUP);
        })
        .attr("y", function(d) {
                return h -margin// - yScale(d.VAL);
        })
        .attr("width", xScale.bandwidth())
        // .attr("height", function(d) {
        //     return yScale(0)})
        .attr("height", 0)
        .attr("fill", function(d, i) {
            return colors[i]})
        .attr("opacity", 0.9)

    // gridlines in y axis function
    function make_y_gridlines() {		
        return d3.axisLeft(yScale)
            .ticks(10)
    }

    svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(" + margin*2+ ", 0)")
      .call(make_y_gridlines()
          .tickSize(-w)
          .tickFormat("")
      )
    //   
      

    svg.selectAll("rect")
                .data(data)
                .transition()
                .duration(1000)
                .attr("y", function(d) {
                return yScale(d.VAL)})
                .attr("height", function(d) {
                    return h - margin - yScale(d.VAL);;
                })
                .delay(function(d,i) { return(i*200)})
            

    })