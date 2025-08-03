export function sceneArrestPercentageByType({ crimeData, COLORS, WIDTH, HEIGHT }) {
  d3.select("#scene-caption").html(`Percentage of crimes resulting in arrest, grouped by type (2022–2025). This gives insights into whether certain types of crimes are more likely to result in arrests, which can inform law enforcement effectiveness.`);

  const container = d3.select("#viz");
  container.html("");
  const svg = container.append("svg").attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);

  const filteredData = crimeData.filter(d => d["Primary Type"] && d["Primary Type"].trim() !== "");
  const types = Array.from(new Set(filteredData.map(d => d["Primary Type"].trim()))).sort();

  const typeStats = types.map(type => {
    const crimes = filteredData.filter(d => d["Primary Type"].trim() === type);
    const arrested = crimes.filter(d => d.Arrest === true).length;
    return {
      type,
      percent: crimes.length ? (arrested / crimes.length) * 100 : 0,
      total: crimes.length,
      arrested
    };
  });

  const x = d3.scaleBand().domain(types).range([80, WIDTH - 40]).padding(0.2);
  const y = d3.scaleLinear().domain([0, 100]).range([HEIGHT - 60, 60]);

  const color = d3.scaleOrdinal()
    .domain(types)
    .range(
      types.map((t, i) => COLORS.crimeTypeMap?.[t] || d3.schemeCategory10[i % 10])
    );

  svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - 60})`)
    .call(d3.axisBottom(x).tickFormat(() => ""));

  svg.append("g")
    .attr("transform", `translate(80,0)`)
    .call(d3.axisLeft(y));

  svg.selectAll("rect.bar")
    .data(typeStats)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.type))
    .attr("y", d => y(d.percent))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.percent))
    .attr("fill", d => color(d.type))
    .attr("opacity", 0.8)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("stroke", COLORS.highlight).attr("stroke-width", 2);
      tooltip
        .style("display", "block")
        .html(`<strong>${d.type}</strong><br>Arrested: ${d.arrested}<br>Total: ${d.total}<br>Percent: ${d.percent.toFixed(2)}%`);
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

  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Percentage Arrested by Each Type");

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
}
