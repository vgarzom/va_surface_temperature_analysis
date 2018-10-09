const v1_container = d3.select("#vis1-container");

const
    height = 500,
    width = v1_container.node().getBoundingClientRect().width,
    margin = { top: 20, right: 50, bottom: 40, left: 70 },
    yearParse = d3.timeParse("%Y"),
    svg = d3.select('#vis-target-1');

var xAxis, yAxis, x, y;

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
    (d) => {
        d = {
            date: yearParse(d.Year),
            value: +d["J-D"]
        }
        data_glb.push(d);
    }
).then(() => {
    console.log(data_glb);
    updateScales(data_glb);
    createLegends();
    createChart(data_glb, colors.global, "global");
    getDataNh();
    getDataSh();
});

function getDataNh() {
    d3.csv(
        "data/nh.csv",
        (d) => {
            d = {
                date: yearParse(d.Year),
                value: +d["J-D"]
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
        (d) => {
            d = {
                date: yearParse(d.Year),
                value: +d["J-D"]
            }
            data_sh.push(d);
        }
    ).then(() => {

        createChart(data_sh, colors.sh, "sh");
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
        .style("fill", color);
}

function glb_checkboxChanged() {
    var glb_checked = document.getElementById('glb_checkbox_input').checked
    if (glb_checked) {
        createChart(data_glb, colors.global, "global");
    } else {
        svg.select('#global_line').remove();
        svg.selectAll('.year-dot-global').remove();
    }
}

function nh_checkboxChanged() {
    var nh_checked = document.getElementById('nh_checkbox_input').checked
    if (nh_checked) {
        createChart(data_nh, colors.nh, "nh");
    } else {
        svg.select('#nh_line').remove();
        svg.selectAll('.year-dot-nh').remove();
    }
}
function sh_checkboxChanged() {
    var sh_checked = document.getElementById('sh_checkbox_input').checked
    if (sh_checked) {
        createChart(data_sh, colors.sh, "sh");
    } else {
        svg.select('#sh_line').remove();
        svg.selectAll('.year-dot-sh').remove();
    }
}