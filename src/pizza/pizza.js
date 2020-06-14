var filename = "data/pizza/neighborhood_summary.csv"

var w = document.body.clientWidth * 0.45;
var h = w * 2;
var margin = Math.round(document.body.clientWidth * 0.1);

//Create SVG element
var svgBar = d3.select("body")
    .attr("align","center")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var svgChoropleth = d3.select("body")
    .attr("align", "right")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
    
palette=['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']
var colorMapper = d3.scaleQuantize()
    .range(palette)       

var recalcDomain = function(plotVar, data) {
        values = data.map(function(d) { return d[plotVar] })
        maxVal = d3.max(values)
        if (d3.min(values) < 0) {
            minVal = d3.min(values)
        } else {
            minVal = 0
        }
        console.log(minVal, maxVal)
        return [minVal, maxVal]
        }
    
var yScale = d3.scaleBand()
    .rangeRound([margin*0.2, h-margin*0.2])
    .paddingInner(0.05);


var xScale = d3.scaleLinear()
    .range([0, w - margin*2])
    .nice()

// Define map projection
var projection = d3.geoMercator()
    .translate([w, h/2])
    .center([-73.88, 40.78])
    .scale(h * 200);

// Define path generator
var path = d3.geoPath()
             .projection(projection);

var csvParse = function(row) {
    parsedRow = {}
    Object.keys(row).forEach(function(key) {
        colName = key
        colValue = row[key]

        if ((['neighborhood', 'top_cuisine']).includes(colName)) {
            parsedRow[colName] = colValue
        } else {
            parsedRow[colName] = parseFloat(colValue)
        }
    })

    return parsedRow
}

d3.csv(filename, csvParse, function(data) {
    
    var allNeighborhoods = data.map(function(d) { return d['neighborhood'] })

    function draw_plots(plotVar) {

        // colorMapper.domain([d3.min(data, function(d) {return parseFloat(d[plotVar])} ),
        //                     d3.max(data, function(d) {if (d['n_pizzeria'] > 5){
        //                             return parseFloat(d[plotVar])};
        //                         })])
    
        yScale.domain(data.map(function(d) { return d.neighborhood; }))
        xScale.domain(recalcDomain(plotVar, data))
        colorMapper.domain(recalcDomain(plotVar, data))
        xAxis = d3.axisTop()
            .scale(xScale)
            .ticks(5)
        
        yAxis = d3.axisLeft()
            .scale(yScale);
    
        svgBar.append("g")
            .attr("class", "y.axis")
            .attr("transform", "translate(" + margin*1.5 + "," + 0 + ")")
            .call(yAxis);
    
        svgBar.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin*1.5 + "," + margin*0.2 + ")")
            .call(xAxis);
                    
        svgBar.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("id", function(d) {
                return d.neighborhood;
            })
            .attr("y", function(d, i) {
                    return yScale(d.neighborhood);
            })
            .attr("x", margin*1.5)
            .attr("width", function(d) {
                return xScale(d[plotVar])
            })
            .attr("height", yScale.bandwidth())
            .attr("fill", "lightgray")
            .attr("opacity", 0.8)
            .on("mouseover", function() {
    
                barHighlight = this.id
    
                d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", function(d) {
                    return colorMapper(d[plotVar])
                });
    
                svgChoropleth.selectAll("path")
                    .filter(function(path) {
                        // only apply code below to shapes that are in the data csv
                        isInData = allNeighborhoods.includes(path["properties"]["neighborhood"])
                        return (isInData)
                    })
                    .style("stroke", "white")
                    .style("opacity", 0.3)
                    .filter(function(path) {
                        isHover = path['properties']["neighborhood"] == barHighlight
                        return isHover;
                    })
                    .style("stroke", "black")
                    .style("opacity", 1)
                        
            })
            .on("mouseout", function() {
                svgChoropleth.selectAll("path")
                    .filter(function(path) {
                        // only apply code below to shapes that are in the data csv
                        isInData = allNeighborhoods.includes(path["properties"]["neighborhood"])
                        return isInData
                    })
                    .style("opacity", 0.8)
                    .style("stroke", "white")
    
                d3.selectAll("rect")
                    .transition()
                    .duration(250)
                    .attr("fill", "lightgray");
                })
        
        
        d3.json("data/pizza/nycneighborhoods.json", function(json) {	
            //Bind data and create one path per GeoJSON feature					
            svgChoropleth.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", "gray")
                .style("stroke", "white")
                .style("opacity", 0.3)
                .filter(function(path) {
                    // only apply code below to shapes that are in the data csv
                    return allNeighborhoods.includes(path["properties"]["neighborhood"])
                })
                .style("opacity", 0.8)
                .style("fill", function(path) {
                    for (i =0; i < data.length; i++) {
                        if (data[i]['neighborhood'] == path["properties"]["neighborhood"]) {
                            value = parseFloat(data[i][plotVar])
                            if (value) {
                                return colorMapper(value)
                            } else {
                                // if null value returned
                                return 'lightgray'
                            }
                        }
                    }
                })
                .on("mouseover", function(path) {
                    highlight = path["properties"]["neighborhood"]
    
                    d3.selectAll("rect")
                        .filter(function(r) {
                            return r["neighborhood"] == highlight
                        })
                        .transition()
                        .duration(100)
                        .attr("fill", function(d) {
                            return colorMapper(d[plotVar])
                        });
    
                })
                .on("mouseout", function() {
                    d3.selectAll("rect")
                        .transition()
                        .duration(250)
                        .attr("fill", "lightgray");
                    })       
        
        
            })

    }

    function update_plots(plotVar) {

        xScale.domain(recalcDomain(plotVar, data))
        colorMapper.domain(recalcDomain(plotVar, data))
        // colorMapper.domain([d3.min(data, function(d) {return parseFloat(d[plotVar])} ),
        //                     d3.max(data, function(d) {if (d['n_pizzeria'] > 5){
        //                             return parseFloat(d[plotVar])};
        //                         })])

        
        svgBar.selectAll("rect")
            .transition()
            .duration(500)
            .ease(d3.easeCubicInOut)
            .attr("x", margin*1.5)
            .attr("width", function(d) {
                return xScale(d[plotVar])
            })
        
        svgBar.selectAll("rect")
            .on("mouseover", function() {
        
                barHighlight = this.id

                d3.select(this)
                .transition()
                .duration(100)
                .attr("fill", function(d) {
                    return colorMapper(d[plotVar])
                });

                svgChoropleth.selectAll("path")
                    .filter(function(path) {
                        // only apply code below to shapes that are in the data csv
                        isInData = allNeighborhoods.includes(path["properties"]["neighborhood"])
                        return (isInData)
                    })
                    .style("stroke", "white")
                    .style("opacity", 0.3)
                    .filter(function(path) {
                        isHover = path['properties']["neighborhood"] == barHighlight
                        return isHover;
                    })
                    .style("stroke", "black")
                    .style("opacity", 1)
                        
            })
            .on("mouseout", function() {
                svgChoropleth.selectAll("path")
                    .filter(function(path) {
                        // only apply code below to shapes that are in the data csv
                        isInData = allNeighborhoods.includes(path["properties"]["neighborhood"])
                        return isInData
                    })
                    .style("opacity", 0.8)
                    .style("stroke", "white")

                d3.selectAll("rect")
                    .transition()
                    .duration(250)
                    .attr("fill", "lightgray");
                })
        

        svgBar.select(".x.axis")
            .transition()
            .duration(500)
            .call(xAxis);

        svgChoropleth.selectAll("path")
            .filter(function(path) {
                // only apply code below to shapes that are in the data csv
                return allNeighborhoods.includes(path["properties"]["neighborhood"])
            })
            .style("opacity", 0.8)
            .style("fill", function(path) {
                for (i =0; i < data.length; i++) {
                    if (data[i]['neighborhood'] == path["properties"]["neighborhood"]) {
                        value = parseFloat(data[i][plotVar])
                        if (value) {
                            return colorMapper(value)
                        } else {
                            // if null value returned
                            return 'lightgray'
                        }
                    }
                }
            })
            .on("mouseover", function(path) {
                highlight = path["properties"]["neighborhood"]

                d3.selectAll("rect")
                    .filter(function(r) {
                        return r["neighborhood"] == highlight
                    })
                    .transition()
                    .duration(100)
                    .attr("fill", function(d) {
                        return colorMapper(d[plotVar])
                    });

            })
            .on("mouseout", function() {
                d3.selectAll("rect")
                    .transition()
                    .duration(250)
                    .attr("fill", "lightgray");
                })
            
        
    }

    plotVariable = d3.select('#plotvar').node().value
    draw_plots(plotVariable)

    d3.select("#plotvar")
        .on("change", function() {
            newPlotVariable = d3.select('#plotvar').node().value
            update_plots(newPlotVariable);
        })
    })