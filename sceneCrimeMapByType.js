export function sceneCrimeMapByType({ crimeData, COLORS, WIDTH, HEIGHT }) {
  const container = d3.select("#viz");
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);


  let tooltip = container.select(".tooltip");
  if (tooltip.empty()) {
    tooltip = container.append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("font-size", "14px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
      .style("display", "none");
  }

  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .attr("fill", COLORS.background);

  d3.json("chicago.geojson").then(geoData => {
    const projection = d3.geoMercator()
      .fitSize([WIDTH, HEIGHT], geoData);
    const path = d3.geoPath().projection(projection);

    svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path)
      .attr("fill", "#fff")
      .attr("stroke", COLORS.muted)
      .attr("stroke-width", 1);


    const filtered = crimeData.filter(d => d.Latitude && d.Longitude); // No sort or slice here

    const types = Array.from(new Set(filtered.map(d => d["Primary Type"] || d["Type"] || "Other")));
    const color = d3.scaleOrdinal()
      .domain(types)
      .range(d3.schemeCategory10);

    svg.selectAll("circle.crime")
      .data(filtered)
      .join("circle")
      .attr("class", "crime")
      .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
      .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
      .attr("r", 3)
      .attr("fill", d => color(d["Primary Type"] || d["Type"] || "Other"))
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke", "#222").attr("stroke-width", 2);
        tooltip
          .style("display", "block")
          .html(
            `<strong>Type:</strong> ${d["Primary Type"] || d["Type"] || "Other"}<br>` +
            (d.Date ? `<strong>Date:</strong> ${d.Date}<br>` : "") +
            `<strong>Lat:</strong> ${d.Latitude.toFixed(4)}, <strong>Lon:</strong> ${d.Longitude.toFixed(4)}`
          );
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.offsetX + 20) + "px")
          .style("top", (event.offsetY + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke", null);
        tooltip.style("display", "none");
      });

    const legend = svg.append("g").attr("transform", `translate(20, 60)`);
    types.slice(0, 8).forEach((type, i) => {
      legend.append("circle")
        .attr("cx", 0)
        .attr("cy", i * 22)
        .attr("r", 7)
        .attr("fill", color(type));
      legend.append("text")
        .attr("x", 15)
        .attr("y", i * 22 + 5)
        .text(type)
        .attr("font-size", 14)
        .attr("alignment-baseline", "middle");
    });

    svg.append("text")
      .attr("x", WIDTH / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text("Crime Map by Type");

    d3.select("#scene-caption").html(`This map shows a random sample of 5,000 crimes in Chicago, colored by type. Explore spatial patterns and compare the prevalence of different crime categories across the city.`);
  });
}
