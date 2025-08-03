export function sceneTrendLine({crimeData, COLORS, WIDTH, HEIGHT, MARGIN, annotationText, captionText}) {
  // Show a horizontal bar chart of crime counts by type for 2025
  const latestYear = 2025;
  const filtered = crimeData.filter(d => d.Year === latestYear && d["Primary Type"]);
  const typeCounts = d3.rollups(
    filtered,
    v => v.length,
    d => d["Primary Type"]
  ).sort((a, b) => b[1] - a[1]);

  // Color scale for crime types (consistent with other scenes)
  const crimeTypes = typeCounts.map(d => d[0]);
  const colorScale = d3.scaleOrdinal()
    .domain(crimeTypes)
    .range(d3.schemeTableau10.concat(d3.schemeSet2, d3.schemeSet3));

  d3.select("#scene-caption").html(captionText || `
Crime breakdown for ${latestYear}: Which types are most common? This chart shows the number of reported crimes by type for the latest year in the dataset. Hover bars for details.`);

  const container = d3.select("#viz");
  container.html(""); // Clear previous content
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);

  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text(`Crime Types in ${latestYear}`);

  // Tooltip div
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

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const y = d3.scaleBand()
    .domain(typeCounts.map(d => d[0]))
    .range([0, innerHeight])
    .padding(0.15);

  const x = d3.scaleLinear()
    .domain([0, d3.max(typeCounts, d => d[1])]).nice()
    .range([0, innerWidth]);

  const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top + 40})`);

  g.selectAll("rect")
    .data(typeCounts)
    .join("rect")
    .attr("y", d => y(d[0]))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d[1]))
    .attr("fill", d => colorScale(d[0]))
    .on("mouseover", function(event, d) {
      d3.select(this).attr("fill", COLORS.highlight);
      tooltip
        .style("display", "block")
        .html(`<strong>${d[0]}</strong><br><strong>Incidents:</strong> ${d[1].toLocaleString()}`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.offsetX + 20) + "px")
        .style("top", (event.offsetY + 10) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("fill", colorScale(d[0]));
      tooltip.style("display", "none");
    });

  g.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .style("font-size", "13px");

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(",d")));
}
