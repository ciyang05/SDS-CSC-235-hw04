d3.json("genreGraph.json").then(function(graph){
    makeMatrix(graph);
});

function makeMatrix(graph){
    const genres = graph.nodes.map(d => d.id).sort();

    const matrixData = [];

    graph.links.forEach(link => {
        matrixData.push ({
            row: link.source,
            col: link.target,
            value: link.value
        });
        matrixData.push ({
            row: link.source,
            col: link.target,
            value: link.value
        });
    });
    genres.forEach(g => {
        matrixData.push({
            row: g,
            col: g,
            value: 0
        });
    });

    drawMatrix(matrixData, genres);
}

function drawMatrix(matrixData, genres){
    const maxValue = d3.max(matrixData, d => d.value);
    const color = d3.scaleSequential(d3.interpolateReds)

    .domain([0, maxValue]);
    const margin = { top: 150, right: 30, bottom: 30, left: 150};
    const width = 900;
    const height = 900;


const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const x = d3.scaleBand()
    .domain(genres)
    .range([margin.left, width - margin.right])
    .padding(.05);

const y = d3.scaleBand()
    .domain(genres)
    .range([margin.top, height - margin.bottom])
    .padding(0.05)

svg.append("g")
    .attr("transform", `translate(0, ${margin.top})`)
    .call(d3.axisTop(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "start");

svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

svg.selectAll("rect.cell")
    .data(matrixData)
    .join("rect")
    .attr("x", d => x(d.col))
    .attr("y", d => y(d.row))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d.value))
    .attr("class", "cell")
    .on("click", function(event, d){
        d3.select("#info")
            .text(`${d.row} and ${d.col} appear together ${d.value} times`)

        d3.selectAll("rect.cell")
            .attr("stroke", null);
        d3.select(this)
            .attr("stroke", "red")
            .attr("stroke-width", 2);
    


    })

    .on("mouseover", function(event, d){
        d3.selectAll("rect.cell")
        .attr("opacity", 0.1);

        d3.selectAll("rect.cell")
            .filter(cell => cell.row === d.row || cell.col === d.col)
            .attr("opacity", 1);  
    })
    .on("mouseout", function(){
        d3.selectAll("rect.cell")
        .attr("opacity", 1);
    });


}




function update(data) {
    console.log(data);
}

function getCol(data) {
    const links = [];

    data.forEach(d => {

        if (!d.listed_in)
            return
        const genres = d.listed_in.split(", ");

        for (let i = 0; i < genres.length; i++) {
            for (let j = i + 1; j < genres.length; j++) {
                links.push({
                    //First part of connection
                    source: genres[i],
                    //Second part of connection
                    target: genres[j],
                    value: 1
                });
                links.push({
                    //First part of connection
                    source: genres[j],
                    //Second part of connection
                    target: genres[i],
                    value: 1
                });
            }
        }


    });
    return links;
};



// force direct graph

function drawGraph(data) {

    // document.getElementsByTagName("h2")[0].innerHTML = "Correlations Between Actors in Netflix Movies";
    // document.getElementsByTagName("h3")[0].innerHTML = "";


    // dimensions
    const width = 650;
    const height = 650;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    const plot_height = height - margin.top - margin.bottom;
    const plot_width = width - margin.left - margin.right;

    // canvas and plot 
    const canvas = d3.select("#canvas")
        .append("svg")
        .style("background", "#DAF2F0")
        .attr("height", height)
        .attr("width", width);

    const plot = canvas.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    canvas.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("class", "force-title")
        .text("Co-Occurance Between Actors in Netflix Movies")

    // update nodes
    function updateNodes() {
        nodeGroup.selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("cx", d => d.x = Math.max(10, Math.min(plot_width - 10, d.x)))
            .attr("cy", d => d.y = Math.max(10, Math.min(plot_height - 10, d.y)))
            .attr("r", 10)
            .style("fill", "#FFFBB3")
            .style("stroke", "#FDE49F")
            .attr("class", "viz");
    }

    const linkGroup = plot.append("g").attr("class", "links");
    const nodeGroup = plot.append("g").attr("class", "nodes");


    // update links
    function updateLinks() {
        linkGroup.selectAll("line")
            .data(data.links)
            .join("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            .style("stroke", "#2FBCBC")
            .style("stroke-width", 2)
    }

    // ticked
    function ticked() {
        updateLinks();
        updateNodes();

        // when user hovers over a node, tooltip shows up w/name of the actor
        plot.selectAll(".viz")
            .on("mouseover", function (e, d) {
                tooltip.transition().duration(500).style("opacity", 0.9);

                tooltip
                    .html(`<strong>${d.id}</strong>`)
                    .style("left", e.pageX + 10 + "px")
                    .style("top", e.pageY - 10 + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition().duration(500).style("opacity", 0);
            })

        d3.selectAll("circle").call(drag);

    }

    const drag = d3.drag().on("drag", handleDrag);

    // allows user to drag the nodes (a user interaction)
    function handleDrag(e) {
        e.subject.x = Math.max(10, Math.min(plot_width - 10, e.x));
        e.subject.y = Math.max(10, Math.min(plot_height - 10, e.y));

        updateLinks();
        updateNodes();
    }

    // force stimulation 
    const simulation = d3.forceSimulation(data.nodes)
        // has to do w/charge of individual node
        // pushing nodes apart
        .force("charge", d3.forceManyBody().strength(-100))
        // how node reacts to center of plot
        // pulling nodes together
        .force("center", d3.forceCenter(plot_width / 2, plot_height / 2).strength(1))
        // links between nodes
        // how nodes are linked to each other
        .force("link", d3.forceLink().links(data.links).id(d => d.id).distance(75))
        .on("tick", ticked);


    // tooltip
    let tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

}

function draw() {
    // loads and parses data 
    d3.json("graph.json").then(data => {
        // console.log(data);
        // console.log("data was successfully loaded");
        console.log("nodes: ", data.nodes);
        console.log("links", data.links);
        drawGraph(data);
    }).catch(error => {
        console.warn("Could not load data:", error);
    });
}









