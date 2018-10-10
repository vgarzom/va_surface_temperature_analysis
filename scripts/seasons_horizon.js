const overlap = 9;

var href_base = "http://localhost:8080#";
function initHorizonChart(_data, size, position, svg, _margin) {
    var width = size.width - _margin.left - _margin.right;
    var height = size.height - _margin.top;
    var scheme = "schemeReds";
    const separation = 2;
    const step = (height / 8) - separation;
    const mG = svg.append('g')
        .attr("id", "horizon-chart")
        .attr("transform", `translate(${position.x + _margin.left},${position.y})`);

    const data = parseData(_data);

    var area = d3.area()
        .curve(d3.curveBasis)
        .defined(d => !isNaN(d.value))
        .x(d => x(d.date))
        .y0(0)
        .y1(d => y(d.value))

    var xAxis = g => g
        .attr("transform", `translate(0,${_margin.top})`)
        .call(d3.axisTop(x).ticks(width / 80).tickSizeOuter(0))
        .call(g => g.selectAll(".tick").filter(d => x(d) < _margin.left || x(d) >= width - _margin.right).remove())
        .call(g => g.select(".domain").remove())

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(d.values, d => d.value))])
        .range([0, -overlap * step])

    var x = d3.scaleUtc()
        .domain([data[0].values[0].date, data[0].values[data[0].values.length - 1].date])
        .range([0, width])

    color = i => d3[scheme][Math.max(3, overlap)][i + Math.max(0, 3 - overlap)]

    const g = mG.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * (step + separation) + _margin.top})`);

    g.append("clipPath")
        .attr("id", d => d.clip.id)
        .append("rect")
        .attr("width", width)
        .attr("height", step);

    g.append("defs").append("path")
        .attr("id", d => d.path.id)
        .attr("d", d => area(d.values));

    g.append("g")
        .attr("clip-path", d => "url(" + d.clip.href + ")")
        .selectAll("use")
        .data(d => new Array(overlap).fill(d))
        .enter().append("use")
        .attr("fill", (d, i) => color(i))
        .attr("transform", (d, i) => `translate(0,${(i + 1) * step})`)
        .attr("xlink:href", d => d.path.href);

    g.append("text")
        .attr("x", -_margin.left + 10)
        .attr("y", step / 2)
        .attr("dy", "0.35em")
        .attr("class", "label label-info")
        .text(d => d.key);

    g.append("line")
        .attr("x1", 0)
        .attr("y1", 0 - separation/2)
        .attr("x2", width)
        .attr("y2", 0 - separation/2)
        .attr("stroke-dasharray", "20 4")
        .attr("stroke", "gray")
        .attr("stroke-width", 0.75)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");


    //g.append("g")
    //    .call(xAxis);
}

function parseData(data) {

    var DJF_nh = {
        key: "Dec-Jan-Feb | North H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_djf_nh",
            href: href_base + "clip_djf_nh"
        },
        path: {
            id: "path_djf_nh",
            href: href_base + "path_djf_nh"
        }
    };

    var MAM_nh = {
        key: "Mar-Apr-May | North H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_mam_nh",
            href: href_base + "clip_mam_nh"
        },
        path: {
            id: "path_mam_nh",
            href: href_base + "path_mam_nh"
        }
    };
    var JJA_nh = {
        key: "Jun-Jul-Aug | North H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_jja_nh",
            href: href_base + "clip_jja_nh"
        },
        path: {
            id: "path_jja_nh",
            href: href_base + "path_jja_nh"
        }
    };
    var SON_nh = {
        key: "Sep-Oct-Nov | North H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_son_nh",
            href: href_base + "clip_son_nh"
        },
        path: {
            id: "path_son_nh",
            href: href_base + "path_son_nh"
        }
    };

    for (var i = 0; i < data.nh.length; i++) {
        const d = data.nh[i];
        DJF_nh.values.push({ name: "DJF nh", date: d.date, value: d.DJF });
        if (!isNaN(d.DJF))
            DJF_nh.sum = DJF_nh.sum + d.DJF;

        JJA_nh.values.push({ name: "JJA nh", date: d.date, value: d.JJA });
        if (!isNaN(d.JJA))
            JJA_nh.sum = JJA_nh.sum + d.JJA;

        MAM_nh.values.push({ name: "MAM nh", date: d.date, value: d.MAM });
        if (!isNaN(d.MAM))
            MAM_nh.sum = MAM_nh.sum + d.MAM;

        SON_nh.values.push({ name: "SON nh", date: d.date, value: d.SON });
        if (!isNaN(d.SON))
            SON_nh.sum = SON_nh.sum + d.SON;
    }

    var DJF_sh = {
        key: "Dec-Jan-Feb | South H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_djf_sh",
            href: href_base + "clip_djf_sh"
        },
        path: {
            id: "path_djf_sh",
            href: href_base + "path_djf_sh"
        }
    };
    var MAM_sh = {
        key: "Mar-Apr-May | South H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_mam_sh",
            href: href_base + "clip_mam_sh"
        },
        path: {
            id: "path_mam_sh",
            href: href_base + "path_mam_sh"
        }
    };
    var JJA_sh = {
        key: "Jul-Jun-Aug | South H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_jja_sh",
            href: href_base + "clip_jja_sh"
        },
        path: {
            id: "path_jja_sh",
            href: href_base + "path_jja_sh"
        }
    };
    var SON_sh = {
        key: "Sep-Oct-Nov | South H.",
        values: [],
        sum: 0,
        clip: {
            id: "clip_son_sh",
            href: href_base + "clip_son_sh"
        },
        path: {
            id: "path_son_sh",
            href: href_base + "path_son_sh"
        }
    };

    for (var i = 0; i < data.sh.length; i++) {
        const d = data.sh[i];
        DJF_sh.values.push({ name: "DJF sh", date: d.date, value: d.DJF });
        if (!isNaN(d.DJF))
            DJF_sh.sum = DJF_sh.sum + d.DJF;

        JJA_sh.values.push({ name: "JJA sh", date: d.date, value: d.JJA });
        if (!isNaN(d.JJA))
            JJA_sh.sum = JJA_sh.sum + d.JJA;

        MAM_sh.values.push({ name: "MAM sh", date: d.date, value: d.MAM });
        if (!isNaN(d.MAM))
            MAM_sh.sum = MAM_sh.sum + d.MAM;

        SON_sh.values.push({ name: "SON sh", date: d.date, value: d.SON });
        if (!isNaN(d.SON))
            SON_sh.sum = SON_sh.sum + d.SON;
    }


    var data = [DJF_nh, DJF_sh, MAM_nh, MAM_sh, JJA_nh, JJA_sh, SON_nh, SON_sh];
    console.log(data);
    return data;
}
