export function sceneIntro({COLORS, WIDTH, HEIGHT, addAnnotation, captionText}) {
  d3.select("#scene-caption").html(captionText || `
Chicago is one of America largest  and great city.  Very iconic  skyline to legendary jazz clubs to some of word class museums.  However, beneath  the city rich culture and busy streets lies a very complex story, and sometime  marked by challenges such crime. Today we will look into the Chicago crime data from 2022 to 2025 (July). Dataset is quite large so I normalized it. The difference of few percentage may suggest greater then it its showing in the graphs since data is normalized.`);

  const svg = d3.select("#viz").html("").append("svg")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);

  const projection = d3.geoOrthographic()
    .scale(240)
    .translate([WIDTH / 2, HEIGHT / 2])
    .rotate([0, -30])
    .clipAngle(90);

  const path = d3.geoPath().projection(projection);
  const globe = svg.append("g");

  globe.append("path")
    .datum({ type: "Sphere" })
    .attr("fill", COLORS.background)
    .attr("stroke", COLORS.muted)
    .attr("d", path);

  d3.json("world-110m.json").then(worldData => {
    const countries = topojson.feature(worldData, worldData.objects.countries);

    globe.selectAll("path.country")
      .data(countries.features)
      .join("path")
      .attr("class", "country")
      .attr("fill", "#ccc")
      .attr("stroke", "#333")
      .attr("d", path);

    let rotationTimer = d3.timer((elapsed) => {
      const rotation = [elapsed * 0.02 - 90, -30];
      projection.rotate(rotation);
      globe.selectAll("path").attr("d", path);
    });

    setTimeout(() => {
      const initialScale = projection.scale();
      const targetScale = 480;
      const initialRotate = projection.rotate();
      const targetRotate = [-87.6298, -41.8781];
      d3.transition()
        .duration(2000)
        .tween("zoom-rotate", () => {
          const r = d3.interpolate(initialRotate, targetRotate);
          const s = d3.interpolate(initialScale, targetScale);
          return t => {
            projection.rotate(r(t)).scale(s(t));
            globe.selectAll("path").attr("d", path);
          };
        })
        .on("end", () => {
          rotationTimer.stop();
          addAnnotation(svg, {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            dx: 40,
            dy: -40,
            label: "Chicago"
          });
        });
    }, 3000);
  });
}
