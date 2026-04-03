
d3.csv("cleaned.csv")
    .then(function (data) {
        const links = getCol(data);
        const matrixData = links.map(d => ({
            row: d.source,
            col: d.target,
            value: d.value
        }));


        const wordToId = new Map();

        let index = 0;

        links.forEach(d => {
            if (!wordToId.has(d.source)) {
                wordToId.set(d.source, index++);
            }
            if (!wordToId.has(d.target)) {
                wordToId.set(d.target, index++)
            }
        })

        const numericalGenre = links.map(d => ({
            source: wordToId.get(d.source),
            target: wordToId.get(d.target),
            value: +d.value
        }));
        //update(data);
        console.log(numericalGenre)
    });



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





// code for Actor & Movies data

// loads and parses data 
d3.json("graph.json").then(data => {
    console.log("loading data...");
    console.log(data);
    console.log("data was successfully loaded");
    drawGraph(data);
}).catch(error => {
    console.warn("Could not load data:", error);
});

function drawGraph(data) {

    // update nodes
    function updateNodes() {
        plot.selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 10)
            .style("fill", d => colormap[d.label])
            .style("stroke", d => d3.color().darker())
            .attr("class", "viz");
    }

    // update links
    function updateLinks() {
        plot.selectAll("line")
            .data(data.links)
            .join("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
    }

    // ticked
    function ticked() {
        updateNodes();
        updateLinks();

        plot.selectAll(".viz")
            .on("mouseover", function (e, d) {
                tooltip.transition().duration(500).style("opacity", 0.9);

                tooltip
                    .html(tooltipText(d.label))
                    .style("left", e.pageX + "px")
                    .style("top", e.pageY + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition().duration(500).style("opacity", 0);
            })
    }

    // force stimulation 
    const simulation = d3.forceSimulation(data.nodes)
        // has to do w/charge of individual node
        // pushing nodes apart
        .force("charge", d3.forceManyBody())
        // how node reacts to center of plot
        // pulling nodes together
        .force("center", d3.forceCenter())
        // links between nodes
        // how nodes are linked to each other
        .force("link", d3.forceLink().links(data.links))
    on("tick", ticked);

}









