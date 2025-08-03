
export function sceneCrimeTypePercentage({ crimeData, COLORS, WIDTH, HEIGHT }) {
  d3.select("#scene-caption").html(`Percentage of each crime type per year (2022–2025)`);

  const container = d3.select("#viz");
  container.html("");

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);


  const filteredData = crimeData.filter(d =>
    d.Year && d["Primary Type"] && d["Primary Type"].trim() !== ""
  ).map(d => ({
    ...d,
    normType: d["Primary Type"].trim().toUpperCase()
  }));

  if (filteredData.length === 0) {
    container.append("div")
      .style("color", "#888")
      .style("text-align", "center")
      .style("margin-top", "40px")
      .text("No valid data available for visualization.");
    return;
  }


  const years = Array.from(new Set(filteredData.map(d => d.Year))).sort();
  const types = Array.from(new Set(filteredData.map(d => d.normType))).filter(t => t && t.trim() !== "").sort();


  const color = d3.scaleOrdinal()
    .domain(types)
    .range(d3.schemeCategory10.concat(d3.schemeSet2, d3.schemeSet3, d3.schemePaired, d3.schemeDark2, d3.schemeAccent));


  const yearTypeCounts = {};
  years.forEach(year => {
    yearTypeCounts[year] = {};
    types.forEach(type => {
      yearTypeCounts[year][type] = 0;
    });
  });

  filteredData.forEach(d => {
    if (yearTypeCounts[d.Year] && yearTypeCounts[d.Year][d.normType] !== undefined) {
      yearTypeCounts[d.Year][d.normType]++;
    }
  });

  const percentByYearType = {};
  years.forEach(year => {
    const total = types.reduce((sum, type) => sum + yearTypeCounts[year][type], 0);
    percentByYearType[year] = {};
    types.forEach(type => {
      percentByYearType[year][type] = total ? (yearTypeCounts[year][type] / total) * 100 : 0;
    });
  });

  
  const x = d3.scaleBand().domain(years).range([180, WIDTH - 40]).padding(0.2);
  const y = d3.scaleLinear().domain([0, 100]).range([HEIGHT - 60, 60]);

  svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - 60})`)
    .call(d3.axisBottom(x));
  svg.append("g")
    .attr("transform", `translate(180,0)`)
    .call(d3.axisLeft(y));

  
  const yOffset = {};
  years.forEach(year => yOffset[year] = 0);

  types.forEach(type => {
    years.forEach(year => {
      const percent = percentByYearType[year][type];
      if (percent === 0) return;

      svg.append("rect")
        .attr("x", x(year))
        .attr("y", y(yOffset[year] + percent))
        .attr("width", x.bandwidth())
        .attr("height", y(yOffset[year]) - y(yOffset[year] + percent))
        .attr("fill", color(type))
        .attr("opacity", 0.8)
        .on("mouseover", function(event) {
          d3.select(this).attr("stroke", COLORS.highlight).attr("stroke-width", 2);
          container.select(".tooltip")
            .style("display", "block")
            .html(`<strong>${type}</strong><br>Year: ${year}<br>Percent: ${percent.toFixed(2)}%`);
        })
        .on("mousemove", function(event) {
          container.select(".tooltip")
            .style("left", (event.offsetX + 20) + "px")
            .style("top", (event.offsetY + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("stroke", null);
          container.select(".tooltip").style("display", "none");
        });

      yOffset[year] += percent;
    });
  });


  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Percentage of Crime Types per Year (Stacked)");

  // Scrollable legend
  const legendHeight = Math.min(types.length * 22, HEIGHT - 80);
  const legend = container.append("div")
    .attr("class", "legend-scroll")
    .style("height", legendHeight + "px")
    .style("overflow-y", "auto")
    .style("width", "160px")
    .style("position", "absolute")
    .style("top", "80px")
    .style("left", "20px")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "8px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.10)")
    .style("padding", "8px");

  legend.append("div")
    .style("font-weight", "bold")
    .style("margin-bottom", "6px")
    .text("Primary Type");

  types.forEach(type => {
    const row = legend.append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "2px");

    row.append("div")
      .style("width", "18px")
      .style("height", "18px")
      .style("background", color(type))
      .style("margin-right", "8px")
      .style("border-radius", "4px");

    row.append("span")
      .style("font-size", "13px")
      .text(type);
  });

  // Tooltip
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
