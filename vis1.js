const v1_container = d3.select("#vis1-container");

const
    height = 500,
    width = v1_container.node().getBoundingClientRect().width;
margin = { top: 20, right: 50, bottom: 40, left: 70 },
    yearParse = d3.timeParse("%Y");

var data = [];

d3.csv(
    "data/global.csv",
    (d) => {
        d = {
            date: yearParse(d.Year),
            value: +d["J-D"]
        }
        data.push(d);
    }
).then(() => {
    console.log(data);
    createChart(data);
});

function createChart(data) {
    x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])

    y = d3.scaleLinear()
        .domain([d3.min(data, d => d.value), d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top])

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y));

    line = d3.line()
        .defined(d => !isNaN(d.value))
        .x(d => x(d.date))
        .y(d => y(d.value))

    const svg = d3.select('#vis-target-1');

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    svg.append("text")
        .attr("x", -height/2)
        .attr("y", 20)
        .attr("fill", "black")
        .attr("id", "y_legend")
        .text("Cambios de temperatura ºC")
        .style("text-anchor", "middle")
        .attr("transform", function (d) {
            return "rotate(-90)";
        });

    

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height)
        .attr("fill", "black")
        .attr("id", "y_legend")
        .style("text-anchor", "middle")
        .text("Año");

}