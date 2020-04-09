var filename = document.getElementById("groupedchart").getAttribute("filename")

var w = document.body.clientWidth * 0.9;
var h = w /3;
var margin = 20;

//Create SVG element
var svg = d3.select("#grouped")
            .attr("align","center")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var xOuter = d3.scaleBand()
    .rangeRound([margin*2, w-margin*3])
    .paddingInner(0.5)
    .paddingOuter(0.1);

var xInner = d3.scaleBand()
    .domain(['USA', 'NYC'])
    .padding(0);

var yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([h - margin, margin])
    .nice();

var z = d3.scaleOrdinal()
    .domain(["USA", "NYC"])
    .range(["#c3c3c3", "#003884"]);

var breakdown = 'Age'
// var breakdown = d3.select('#breakdown').node().value;

var drawX = function(xScale) {
    xAxis = d3.axisBottom()
        .scale(xScale);
        // .ticks(data.length / 2);

    svg.append("g")
        .attr("class", "x.axis")
        .attr("transform", "translate(0," + (h - margin) + ")")
        .call(xAxis);
}

function make_y_gridlines() {		
    return d3.axisLeft(yScale)
        .ticks(10)
}

//Create bars
d3.csv(filename, 
function(d) {return {CATEGORY:d.CATEGORY, GROUP:d.GROUP, AREA:d.AREA, VAL:parseFloat(d.PCT_WFH)}}, 
function(error, fulldata) {

    var data = fulldata.filter(function(d) {return d.CATEGORY == breakdown})
    
    xOuter.domain(data.map(function(d) { return d.GROUP; }))
    xInner.rangeRound([0, xOuter.bandwidth() - margin]);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {return  xInner(d.AREA) + xOuter(d.GROUP)})
        .attr("y", h - margin)
        .attr("opacity", 0.9)
        .attr("width", xOuter.bandwidth())
        .attr("height", 0)

    drawX(xOuter)

    yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(null, "").tickFormat(d3.format('.0%'));

    svg.append("g")
        .attr("class", "y.axis")
        .attr("transform", "translate(" + margin*2 + ",0)")
        .call(yAxis);

    update_plot = function() {

        svg.selectAll("rect")
            .transition()
            .duration(500)
            .attr("y", h)
            .attr("height", 0)
        

        var breakdown = d3.select('#breakdown').node().value;
        var data = fulldata.filter(function(d) {return d.CATEGORY == breakdown})

        xOuter.domain(data.map(function(d) { return d.GROUP; }))
        xInner.rangeRound([0, xOuter.bandwidth()]);

        function naiveTransition(axis, scale) {
            axis.scale(scale)
            svg.select("g")
            .attr("class", "x.axis")
            .transition()
            .duration(500)
            .attr("transform", "translate(0," + (h - margin) + ")")
            .call(axis);
        }

        naiveTransition(xAxis, xOuter)
        
        //Update all rects
        bars = svg.selectAll("rect")
        .data(data)
        .transition()
        .delay(function(d, i) {
                if (d.AREA == "USA") {return 0}
                else {return i *100;}
            })
        .duration(1000)
        .attr("x", function(d) {
            return xInner(d.AREA) + xOuter(d.GROUP)})
            // return xInner(d.AREA); })
        .attr("y", function(d) {
                return yScale(d.VAL);
        })
        .attr("width", (w - margin*2) / data.length )
        .attr("height", function(d) {
                return h - yScale(d.VAL) - margin;
        })
        .attr("fill", function(d) {
                return z(d.AREA)
        })

    
        svg.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(" + margin*2+ ", 0)")
        .call(make_y_gridlines()
            .tickSize(-w)
            .tickFormat("")
        )
        //   
        

    }

    update_plot()
    // update with new data			
    d3.select("#breakdown")
        .on("change", function() {
            update_plot()
            

            });
                            
        });

