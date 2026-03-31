
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












