const v1_container = d3.select("#vis1-container");

const
    full_height = v1_container.node().getBoundingClientRect().height,
    height = 0.7 * full_height,
    width = v1_container.node().getBoundingClientRect().width,
    margin = { top: 20, right: 50, bottom: 40, left: 70 },
    tooltip_size = { height: 80, width: 150 },
    yearParse = d3.timeParse("%Y"),
    yearFormat = d3.timeFormat("%Y"),
    svg = v1_container.append('svg').attr("width", width).attr("height", full_height),
    minYear = 1880;
console.log(height);

var vertical_indicator;

function createVerticalIndicator() {
    vertical_indicator = svg.append("line")
        .attr("x1", -100)
        .attr("y1", tooltip_size.height)
        .attr("x2", -100)
        .attr("y2", full_height + 5)
        .attr("stroke-dasharray", "4 4")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");
}
svg.on("mousemove", mousemoved);

var xAxis, yAxis, xScale, y, tooltip, normalize;

var colors = {
    global: "#009CBF",
    nh: "#60B515",
    sh: "#948981",
    tooltip_text: "#314351"
};


var line = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => xScale(d.date))
    .y(d => y(d.value))

var data_glb = [];
var data_sh = [];
var data_nh = [];

d3.csv(
    "data/global.csv",
    (d, i) => {
        data_glb.push(mapDataElement(d));
    }
).then(() => {
    getDataNh();
});

function getDataNh() {
    d3.csv(
        "data/nh.csv",
        (d, i) => {
            data_nh.push(mapDataElement(d));
        }
    ).then(() => {

        getDataSh();
    });
}

function getDataSh() {
    d3.csv(
        "data/sh.csv",
        (d, i) => {
            data_sh.push(mapDataElement(d));
        }
    ).then(() => {
        updateScales(data_glb);
        createChart(data_glb, colors.global, "global");
        createChart(data_nh, colors.nh, "nh");
        createChart(data_sh, colors.sh, "sh");
        createLegends();
        createTooltip();
        initHorizonChart({ glb: data_glb, nh: data_nh, sh: data_sh }, { width: width, height: full_height - height }, { x: 0, y: height }, svg, margin)
        createVerticalIndicator();
    });
}

function mapDataElement(d) {
    d = {
        date: yearParse(d.Year),
        value: +d["J-D"],
        name: d.Year,
        DJF: +d.DJF,
        MAM: +d.MAM,
        JJA: +d.JJA,
        SON: +d.SON
    }
    return d;
}

function updateScales(data) {
    xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right])

    y = d3.scaleLinear()
        .domain([d3.min(data, d => d.value), d3.max(data, d => d.value)]).nice()
        .range([height - margin.bottom, margin.top])

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(width / 80).tickFormat(yearFormat));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y));

    normalize = d3.scaleLinear().domain([-1, 1]).range([1, 0]);

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
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => y(d.value))
        .style("fill", color)
        .attr("cz", 0);
}

function mousemoved() {
    const coords = d3.mouse(this);
    var x = coords[0];
    if (x <= margin.left) {
        x = margin.left;
    }
    if (x >= width - margin.right) {
        x = width - margin.right;
    }
    vertical_indicator
        .attr("x1", x)
        .attr("x2", x);

    updateTooltip(x);

}

function updateTooltip(x) {
    if (tooltip === undefined) {
        return;
    }
    var tx = x - tooltip_size.width / 2;
    if (tx <= margin.left) {
        tx = margin.left;
    }
    if (tx > width - margin.right - tooltip_size.width) {
        tx = width - margin.right - tooltip_size.width;
    }
    tooltip.attr("transform", `translate(${tx},0)`)

    const year = +yearFormat(xScale.invert(x));
    const glbD = data_glb[year - minYear];
    const nhD = data_nh[year - minYear];
    const shD = data_sh[year - minYear];
    tooltip.select("#tooltip-title")
        .text("" + year);
    tooltip.select("#tooltip-average")
        .text(`∆T promedio: ${glbD.value}ºC`);
    tooltip.select('#tooltip-nh')
        .text(`∆T nh: ${nhD.value}ºC`);
    tooltip.select('#tooltip-sh')
        .text(`∆T sh: ${shD.value}ºC`);

    if (!isNaN(glbD.value)) {
        var color = d3.interpolateRdBu(normalize(glbD.value));
        color = color.replace('rgb', 'rgba').replace(')', ', 0.8)');
        tooltip.select('.tooltip-bg').attr("fill", color)
    }
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
        .attr("class", "tooltip-bg")
        .attr("width", tooltip_size.width)
        .attr("height", tooltip_size.height)
        .attr("fill", "#000000bb");

    let tool_text = tooltip.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .attr("fill", colors.tooltip_text)
        .attr("id", "tooltip_1");

    tool_text.append("tspan")
        .attr("id", "tooltip-title")
        .attr("x", 10)
        .attr("y", 22)
        .style("font-weight", "bold")
        .style("font-size", 20);

    tool_text.append("tspan")
        .attr("id", "tooltip-average")
        .attr("x", 10)
        .attr("y", 40)
        .style("font-weight", "regular");

    tool_text.append("tspan")
        .attr("id", "tooltip-nh")
        .attr("x", 10)
        .attr("y", 55);

    tool_text.append("tspan")
        .attr("id", "tooltip-sh")
        .attr("x", 10)
        .attr("y", 70);
}
