export function sceneCrimeMapAnimated({ crimeData, COLORS, WIDTH, HEIGHT, captionText }) {
  // Use all data, sorted by date
  let sample = crimeData.filter(d => d.Date).sort((a, b) => new Date(a.Date) - new Date(b.Date));

  d3.select("#scene-caption").html(captionText || `Animated map of Chicago crimes (2018–2025). Crimes appear over time, showing spatial and temporal patterns. Only Date, Primary Type, Latitude, Longitude, and Description are used.`);
  const container = d3.select("#viz");
  container.html("");
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);

  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Animated Crime Map Over Time");

  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", 60)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", COLORS.highlight)
    .text("Crimes appear in sequence by date");

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

  const crimeTypes = Array.from(new Set(sample.map(d => d["Primary Type"]))).sort();
  const colorScale = d3.scaleOrdinal()
    .domain(crimeTypes)
    .range(d3.schemeCategory10.concat(d3.schemeSet2, d3.schemeSet3));

  const projection = d3.geoMercator()
    .center([-87.6298, 41.8781])
    .scale(50000)
    .translate([WIDTH / 2, HEIGHT / 2 + 40]);

  d3.json("chicago.geojson").then(geojson => {
    svg.append("g")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("fill", COLORS.background)
      .attr("stroke", COLORS.muted)
      .attr("stroke-width", 1);

    let playing = false;
    let currentIdx = 0;
    let intervalId = null;

    const controls = container.append("div")
      .attr("class", "animation-controls")
      .style("margin", "10px 0");
    controls.append("button")
      .attr("id", "playPauseBtn")
      .text("Play")
      .on("click", () => {
        playing = !playing;
        d3.select("#playPauseBtn").text(playing ? "Pause" : "Play");
        if (playing) startAnimation();
        else stopAnimation();
      });

    controls.append("input")
      .attr("type", "range")
      .attr("min", 0)
      .attr("max", sample.length - 1)
      .attr("value", 0)
      .attr("id", "crimeSlider")
      .style("width", "300px")
      .on("input", function() {
        stopAnimation();
        currentIdx = +this.value;
        updateMap(currentIdx);
      });

    const dateDisplay = container.append("div")
      .attr("id", "animated-date-display")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("margin", "8px 0 4px 0")
      .style("text-align", "center")
      .style("color", COLORS.highlight);

    updateMap(0);

    function startAnimation() {
      intervalId = setInterval(() => {
        if (currentIdx < sample.length - 1) {
          currentIdx++;
          updateMap(currentIdx);
          d3.select("#crimeSlider").property("value", currentIdx);
        } else {
          stopAnimation();
        }
      }, 20);
    }

    function stopAnimation() {
      playing = false;
      d3.select("#playPauseBtn").text("Play");
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }

    function updateMap(idx) {
      svg.selectAll(".crime-dot").remove();
      svg.selectAll(".crime-dot")
        .data(sample.slice(0, idx + 1))
        .join("circle")
        .attr("class", "crime-dot")
        .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
        .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
        .attr("r", 3)
        .attr("fill", d => colorScale(d["Primary Type"]))
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("stroke", COLORS.highlight).attr("stroke-width", 2);
          tooltip
            .style("display", "block")
            .html(`<strong>Date:</strong> ${d.Date}<br><strong>Type:</strong> ${d["Primary Type"]}<br><strong>Description:</strong> ${d.Description}`);
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
      if (idx >= 0 && sample[idx] && sample[idx].Date) {
        dateDisplay.text(`Date: ${sample[idx].Date}`);
      } else {
        dateDisplay.text("");
      }
    }
  });
}
