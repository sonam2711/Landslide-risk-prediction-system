function predictRisk() {

    // =========================
    // GET INPUTS
    // =========================

    const rainfall =
        Number(document.getElementById("rainfall").value);

    const elevation =
        Number(document.getElementById("elevation").value);

    const slope =
        Number(document.getElementById("slope").value);

    const vegetation =
        document.getElementById("vegetation").value;


    // =========================
    // VALIDATE INPUTS
    // =========================

    if (
        document.getElementById("rainfall").value === "" ||
        document.getElementById("elevation").value === "" ||
        document.getElementById("slope").value === "" ||
        vegetation === ""
    ) {

        alert(
            "Please enter all environmental parameters."
        );

        return;
    }


    // =========================
    // TEMPORARY DEMO MODEL
    // =========================
    //
    // IMPORTANT:
    // This is NOT your trained Random Forest.
    //
    // We will replace this section with
    // your actual AI model/API later.
    // =========================

    let score = 0;


    // Rainfall

    if (rainfall >= 300) {

        score += 3;

    }

    else if (rainfall >= 150) {

        score += 2;

    }

    else {

        score += 1;

    }


    // Slope

    if (slope >= 35) {

        score += 3;

    }

    else if (slope >= 20) {

        score += 2;

    }

    else {

        score += 1;

    }


    // Vegetation

    if (vegetation === "none") {

        score += 3;

    }

    else if (vegetation === "sparse") {

        score += 2;

    }

    else if (vegetation === "moderate") {

        score += 1;

    }

    else {

        score += 0;

    }


    // =========================
    // DETERMINE RISK
    // =========================

    let risk;
    let message;
    let riskClass;


    if (score >= 7) {

        risk = "HIGH";

        riskClass = "high";

        message =
            "The current environmental conditions indicate an elevated landslide risk. Continuous monitoring is recommended.";

    }


    else if (score >= 5) {

        risk = "MEDIUM";

        riskClass = "medium";

        message =
            "The current environmental conditions indicate a moderate landslide risk. Continue monitoring the area.";

    }


    else {

        risk = "LOW";

        riskClass = "low";

        message =
            "The current environmental conditions indicate a relatively low landslide risk.";

    }


    // =========================
    // DISPLAY RESULT
    // =========================

    const riskElement =
        document.getElementById("risk");

    const statusElement =
        document.getElementById("status");

    const messageElement =
        document.getElementById("message");


    riskElement.innerText = risk;

    statusElement.innerText =
        risk + " RISK";

    messageElement.innerText =
        message;


    // Remove previous class

    statusElement.classList.remove(
        "waiting",
        "low",
        "medium",
        "high"
    );


    // Add current risk class

    statusElement.classList.add(
        riskClass
    );


    // =========================
    // DISPLAY INPUT SUMMARY
    // =========================

    document.getElementById(
        "showRainfall"
    ).innerText =
        rainfall + " mm";


    document.getElementById(
        "showElevation"
    ).innerText =
        elevation + " m";


    document.getElementById(
        "showSlope"
    ).innerText =
        slope + "°";


    document.getElementById(
        "showVegetation"
    ).innerText =
        vegetation.charAt(0).toUpperCase()
        + vegetation.slice(1);
}
