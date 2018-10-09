const v1_container = d3.select("#vis1-container");

const
    height = 500,
    width = v1_container.node().getBoundingClientRect().width,
    margin = { top: 20, right: 50, bottom: 40, left: 70 },
    yearParse = d3.timeParse("%Y"),
    svg = v1_container.append('svg').attr("width", width).attr("height", height);

var xAxis, yAxis, x, y, tooltip;

var colors = {
    global: "#009CBF",
    nh: "#60B515",
    sh: "#948981"
};


var line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y(d => y(d.value))

var data_glb = [];
var data_sh = [];
var data_nh = [];

d3.csv(
    "data/global.csv",
    (d, i) => {
        console.log(i);
        d = {
            date: yearParse(d.Year),
            value: +d["J-D"],
            name: 'Promedio - ' + d.Year
        }
        data_glb.push(d);
    }
).then(() => {
    console.log(data_glb);
    updateScales(data_glb);
    createChart(data_glb, colors.global, "global");
    getDataNh();
    getDataSh();

    createLegends();
});

function getDataNh() {
    d3.csv(
        "data/nh.csv",
        (d, i) => {
            d = {
                date: yearParse(d.Year),
                value: +d["J-D"],
                name: 'Hemisferio Norte - ' + d.Year
            }
            data_nh.push(d);
        }
    ).then(() => {
        createChart(data_nh, colors.nh, "nh");
    });
}

function getDataSh() {
    d3.csv(
        "data/sh.csv",
        (d, i) => {
            d = {
                date: yearParse(d.Year),
                value: +d["J-D"],
                name: 'Hemisferio Sur - ' + d.Year
            }
            data_sh.push(d);
        }
    ).then(() => {
        createChart(data_sh, colors.sh, "sh");
        createTooltip();
    });
}

function updateScales(data) {
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


    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

}

function createLegends() {
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("fill", "black")
        .attr("id", "y_legend")
        .text("Cambios de temperatura ºC")
        .style("text-anchor", "middle")
        .attr("transform", function (d) {
            return "rotate(-90)";
        });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("fill", "black")
        .attr("id", "y_legend")
        .style("text-anchor", "middle")
        .text("Año");
}

function createChart(data, color, name) {
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("id", name + "_line")
        .attr("d", line);

    createPoints(data, color, name);
}

function createPoints(data, color, name) {
    svg.selectAll(".year-dot-" + name)
        .data(data)
        .enter().append("circle")
        .attr("class", "year-dot-" + name)
        .attr("r", 3.5)
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .style("fill", color)
        .attr("cz", 0)
        .on("mouseover", mousemoved)
        .on("mouseleave", () => {
            tooltip.attr("transform", `translate(-1000, 0)`)
        });
}

function mousemoved(d) {
    console.log("Mouse moved --> " + JSON.stringify(d));
    var coords = d3.mouse(this);
    tooltip.attr("transform", `translate(${coords[0] + 15},${coords[1] - 25})`)
    tooltip.select("#tooltip-title")
        .text(d.name);tooltip.select("#tooltip-text")
        .text(`cambio de T: ${d.value}ºC`);
    //tooltip.select('#tooltip-kioskos')
    //    .text(`cambio ra: ${d.change}ºC`);
    d3.event.preventDefault();

}

function glb_checkboxChanged() {
    var glb_checked = document.getElementById('glb_checkbox_input').checked
    if (glb_checked) {
        //createChart(data_glb, colors.global, "global");
        svg.select('#global_line').attr("visibility", "visible");
        svg.selectAll('.year-dot-global').attr("visibility", "visible");
    } else {
        //svg.select('#global_line').remove();
        svg.select('#global_line').attr("visibility", "hidden");
        svg.selectAll('.year-dot-global').attr("visibility", "hidden");
    }
}

function nh_checkboxChanged() {
    var nh_checked = document.getElementById('nh_checkbox_input').checked
    if (nh_checked) {
        svg.select('#nh_line').attr("visibility", "visible");
        svg.selectAll('.year-dot-nh').attr("visibility", "visible");
    } else {
        svg.select('#nh_line').attr("visibility", "hidden");
        svg.selectAll('.year-dot-nh').attr("visibility", "hidden");
    }
}
function sh_checkboxChanged() {
    var sh_checked = document.getElementById('sh_checkbox_input').checked
    if (sh_checked) {
        svg.select('#sh_line').attr("visibility", "visible");
        svg.selectAll('.year-dot-sh').attr("visibility", "visible");
    } else {
        svg.select('#sh_line').attr("visibility", "hidden");
        svg.selectAll('.year-dot-sh').attr("visibility", "hidden");
    }
}

function createTooltip() {
    tooltip = svg.append("g")
        .attr("id", "tooltip")
        .attr("transform", "translate(-1000,0)")
        .style("font", "12px sans-serif")
        .style("z-index", 1000);

    let tooltip_bg = tooltip.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 150)
        .attr("height", 60)
        .attr("fill", "#000000bb");

    let tool_text = tooltip.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("id", "tooltip_1");

    let tool_title = tool_text.append("tspan")
        .attr("id", "tooltip-title")
        .attr("x", 10)
        .attr("y", 15)
        .style("font-weight", "bold")
        .style("font-family", "'Dosis', sans-serif");

    let tooltip_text = tool_text.append("tspan")
        .attr("id", "tooltip-text")
        .attr("x", 10)
        .attr("y", 35)
        .style("font-weight", "regular")
        .style("font-family", "'Dosis', sans-serif");

    let tooltip_kioskos = tool_text.append("tspan")
        .attr("id", "tooltip-kioskos")
        .attr("x", 10)
        .attr("y", 50)
        .style("font-family", "'Dosis', sans-serif");
}
