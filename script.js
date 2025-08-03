import { sceneIntro } from './sceneIntro.js';
import { sceneTrendLine } from './sceneTrendLine.js';
import { sceneCrimeMapByType } from './sceneCrimeMapByType.js';
import { sceneCrimeMapAnimated } from './sceneCrimeMapAnimated.js';
import { sceneCrimeTypePercentage } from './sceneCrimeTypePercentage.js';
import { sceneArrestPercentageByType } from './sceneArrestPercentageByType.js';

let currentScene = 0;
const scenes = [
  { id: 0, name: "Chicago and Crime" },
  { id: 1, name: "Type of Crime by Percentage Year Till Now" },
  { id: 2, name: "Percentage Arrested by Each Type" },
  { id: 3, name: "Crime Map by Type in Chicago" },
  { id: 4, name: "Animated Crime Map Over Time" },
  { id: 5, name: "Crime Trends in Chicago" }
];


const WIDTH = 900;
const HEIGHT = 480;
const MARGIN = { top: 50, right: 40, bottom: 60, left: 70 };

const COLORS = {
  main: "#007bff",
  highlight: "#ff6347",
  background: "#e0f7fa",
  muted: "#ccc"
};

let crimeData = [];
let threshold = 60; 

d3.csv("Crimes-data.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d.Latitude = +d.Latitude;
    d.Longitude = +d.Longitude;
    d.Arrest = d.Arrest === "true";
  });
  crimeData = data;
  init();
});

function init() {
  bindControls();
  buildJumpDots();
  renderScene(currentScene);
}

function bindControls() {
  d3.select("#nextBtn").on("click", () => gotoScene(currentScene + 1));
  d3.select("#prevBtn").on("click", () => gotoScene(currentScene - 1));

  d3.select("body").on("keydown", (event) => {
    if (event.key === "ArrowRight") gotoScene(currentScene + 1);
    if (event.key === "ArrowLeft") gotoScene(currentScene - 1);
  });
}

function buildJumpDots() {
  d3.select("#jumpDots")
    .selectAll("button")
    .data(scenes)
    .join("button")
    .attr("aria-label", d => `Jump to scene ${d.id + 1}: ${d.name}`)
    .classed("active", d => d.id === currentScene)
    .on("click", (e, d) => gotoScene(d.id));
}

function updateJumpDots() {
  d3.select("#jumpDots").selectAll("button")
    .classed("active", (d, i) => i === currentScene);
}

function gotoScene(idx) {
  currentScene = (idx + scenes.length) % scenes.length;
  renderScene(currentScene);
}

function renderScene(sceneIndex) {
  d3.select("#viz").html("");
  d3.select("#slideIndicator").text(`Slide ${sceneIndex + 1} of ${scenes.length} — ${scenes[sceneIndex].name}`);
  updateJumpDots();

  if (sceneIndex === 0) {
    sceneIntro({ COLORS, WIDTH, HEIGHT, addAnnotation });
  } else if (sceneIndex === 1) {
    sceneCrimeTypePercentage({ crimeData, COLORS, WIDTH, HEIGHT });
  } else if (sceneIndex === 2) {
    sceneArrestPercentageByType({ crimeData, COLORS, WIDTH, HEIGHT });
  } else if (sceneIndex === 3) {
    sceneCrimeMapByType({ crimeData, COLORS, WIDTH, HEIGHT });
  } else if (sceneIndex === 4) {
    // Prepare only allowed fields for animation scene
    const allowedFields = ["Date", "Primary Type", "Latitude", "Longitude", "Description"];
    const animationData = crimeData.map(d => {
      return {
        Date: d.Date,
        "Primary Type": d["Primary Type"],
        Latitude: d.Latitude,
        Longitude: d.Longitude,
        Description: d.Description
      };
    });
    sceneCrimeMapAnimated({
      crimeData: animationData,
      COLORS,
      WIDTH,
      captionText: `Animated map of Chicago crimes (2022–2025)`,
      HEIGHT
      
    });
  } else if (sceneIndex === 5) {
    sceneTrendLine({
      crimeData,
      COLORS,
      WIDTH,
      HEIGHT,
      MARGIN,
      captionText: `Crime breakdown for 2025: Which types are most common? This chart shows the number of reported crimes by type for the latest year in the dataset. Hover bars for details.`
    });
  }
}

function addAnnotation(svg, { x, y, dx = 30, dy = -30, label = "" }) {
  const annotations = [{ note: { label }, x, y, dx, dy }];
  const makeAnnots = d3.annotation().annotations(annotations);
  svg.append("g").call(makeAnnots);
}
