let MODEL = null;

const fields = [
  "State","District","Latitude","Longitude","Movement_History",
  "Annual_Rainfall_Normal_mm","Rainfall_Pattern","Soil_Distribution","Vegetation"
];

async function loadModel() {
    const response = await fetch("model.json");
    MODEL = await response.json();

    for (const col of MODEL.categorical) {

        const select = document.getElementById(col);
        select.innerHTML = "";

        // Make a separate copy of the options
        let options = [...MODEL.mappings[col]];

        // Remove ONLY the unwanted Rainfall Pattern option
         if (col === "Rainfall_Pattern") {
    options = options.filter(v =>
        String(v).trim().toLowerCase() !== "unknown" &&
        !String(v).startsWith("2018 13966 KER/IDK/58B16/2018/08") &&
        String(v).trim() !== "RD"
    );
}

if (col === "Soil_Distribution") {
    options = options.filter(v => {
        const value = String(v).trim();
        return value.toLowerCase() !== "unknown" &&
               value !== "2018" &&
               value !== "29 Phulban";
    });
}

if (col === "Vegetation") {
    options = options.filter(v => {
        const value = String(v).trim();
        return value.toLowerCase() !== "unknown" &&
               value !== "RD" &&
               !value.startsWith("Date road to NH 49") &&
               !value.startsWith("Kohima 25.669 94.114") &&
               !value.startsWith("Semi Village 30.5155 79.0619");
    });
}

        // Add all remaining options
        options.forEach(v => {
            const option = document.createElement("option");

            option.value = v;
            option.textContent = v;

            select.appendChild(option);
        });
    }

    const state = document.getElementById("State");

    state.addEventListener(
        "change",
        updateDistricts
    );

    updateDistricts();
}

function updateDistricts(){
  const state = document.getElementById("State").value;
  const district = document.getElementById("District");
  const all = MODEL.mappings.District;

  // The CSV may contain districts that occur in multiple states, so retain
  // all districts rather than making an unsafe geographic assumption.
  district.innerHTML = "";
  all.forEach(v=>{
    const o=document.createElement("option");
    o.value=v;o.textContent=v;district.appendChild(o);
  });
}

function encodeValue(col, value){
  const arr = MODEL.mappings[col];
  let idx = arr.indexOf(String(value).trim());
  if(idx < 0) idx = 0;
  return idx;
}

function scaledFeature(col, value){
  if(MODEL.stats[col]){
    return (Number(value)-MODEL.stats[col].mean) / MODEL.stats[col].std;
  }
  const idx = encodeValue(col,value);
  const denom = Math.max(MODEL.mappings[col].length-1,1);
  return (idx/denom)*2-1;
}

function makeVector(){
  const values = {
    State: document.getElementById("State").value,
    District: document.getElementById("District").value,
    Latitude: document.getElementById("Latitude").value,
    Longitude: document.getElementById("Longitude").value,
    Movement_History: document.getElementById("Movement_History").value,
    Annual_Rainfall_Normal_mm: document.getElementById("Annual_Rainfall_Normal_mm").value,
    Rainfall_Pattern: document.getElementById("Rainfall_Pattern").value,
    Soil_Distribution: document.getElementById("Soil_Distribution").value,
    Vegetation: document.getElementById("Vegetation").value
  };
  return MODEL.features.map(f => scaledFeature(f, values[f]));
}

function distance(a,b){
  let s=0;
  for(let i=0;i<a.length;i++){
    const d=a[i]-b[i];
    s += d*d;
  }
  return Math.sqrt(s);
}

// Browser-friendly nearest-neighbour voting over the supplied labelled dataset.
// It uses the same 9 non-target inputs and never uses Movement _Type as an input.
function predict(vector){
  const neighbors = [];
  for(let i=0;i<MODEL.rows.length;i++){
    neighbors.push({
      d: distance(vector, MODEL.rows[i]),
      label: MODEL.labels[i]
    });
  }

  // Use the closest 31 records, weighted by inverse distance.
  neighbors.sort((a,b)=>a.d-b.d);
  const k = Math.min(31, neighbors.length);
  const scores = {LOW:0, MEDIUM:0, HIGH:0};

  for(let i=0;i<k;i++){
    const n=neighbors[i];
    const weight = 1/(n.d+0.05);
    if(scores[n.label] !== undefined) scores[n.label] += weight;
  }

    const lowScore = scores.LOW;
  const highScore = scores.MEDIUM + scores.HIGH;
  const total = lowScore + highScore || 1;
  const probs = {
    LOW: lowScore/total,
    HIGH: highScore/total
  };

  const risk = probs.HIGH >= probs.LOW ? "HIGH" : "LOW";
  return {risk, probs};
}

function showResult(result){
  const box=document.getElementById("result");
  box.classList.remove("hidden");

  document.getElementById("riskLabel").textContent=result.risk;
  document.getElementById("confidence").textContent =
    Math.round(result.probs[result.risk]*100)+"% confidence";

  for(const c of ["LOW","HIGH"]){
    const p=Math.round(result.probs[c]*100);
    const id=c.toLowerCase();
    document.getElementById(id+"Bar").style.width=p+"%";
    document.getElementById(id+"Prob").textContent=p+"%";
  }

  box.scrollIntoView({behavior:"smooth",block:"nearest"});
}

document.getElementById("riskForm").addEventListener("submit", e=>{
  e.preventDefault();
  if(!MODEL) return;
  showResult(predict(makeVector()));
});

loadModel().catch(err=>{
  console.error(err);
  alert("Could not load model.json. Make sure all website files are uploaded to the same GitHub Pages folder.");
});
