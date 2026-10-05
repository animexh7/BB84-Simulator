// =====================================================
// BB84 Simulator - Main Script
// Controls the BB84 pipeline and user interface
// =====================================================


// -----------------------------------------------------
// Small delay for visual process updates
// -----------------------------------------------------

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


// -----------------------------------------------------
// Update a process step
// -----------------------------------------------------

function setStepState(stepId, state) {

    const step = document.getElementById(stepId);

    if (!step) {
        return;
    }

    step.classList.remove("active", "completed");

    if (state === "active") {
        step.classList.add("active");
    }

    if (state === "completed") {
        step.classList.add("completed");
    }
}


// -----------------------------------------------------
// Reset all process steps
// -----------------------------------------------------

function resetProcessSteps() {

    const steps = [
        "stepGeneration",
        "stepEncoding",
        "stepMeasurement",
        "stepSifting",
        "stepVerification"
    ];

    steps.forEach(function (stepId) {
        setStepState(stepId, "reset");
    });
}


// -----------------------------------------------------
// Generate a complete BB84 secure key
// -----------------------------------------------------

async function generateSecureKey() {

    const button = document.getElementById("generateKeyButton");

    const statusText = document.getElementById("statusText");

    const statusDot = document.querySelector(".status-dot");

    const verificationTitle =
        document.getElementById("verificationTitle");

    const verificationMessage =
        document.getElementById("verificationMessage");


    // Disable button while simulation is running
    button.disabled = true;
    button.textContent = "PROCESSING TRANSMISSION...";


    // Reset process tracker
    resetProcessSteps();


    // Reset verification display
    document.getElementById("siftedKey").textContent = "—";
    document.getElementById("matchingBits").textContent = "—";
    document.getElementById("matchRate").textContent = "—";

    document.getElementById("bobBases").textContent = "—";
    document.getElementById("bobKey").textContent = "—";
    document.getElementById("matchingPositions").textContent = "—";


    statusText.textContent = "TRANSMISSION PROCESSING";


    verificationTitle.textContent = "Processing Transmission";

    verificationMessage.textContent =
        "Generating and reconciling quantum states...";


    console.log("Starting new BB84 transmission...");


    // =================================================
    // STEP 1 — STATE GENERATION
    // =================================================

    setStepState("stepGeneration", "active");

    await delay(300);


    const currentBits =
        generateRandomBits(NUM_BITS);


    const currentAliceBases =
        generateRandomBases(NUM_BITS);


    document.getElementById("bits").textContent =
        currentBits.join(" ");


    document.getElementById("bases").textContent =
        currentAliceBases.join(" ");


    setStepState("stepGeneration", "completed");


    // =================================================
    // STEP 2 — QUANTUM ENCODING
    // =================================================

    setStepState("stepEncoding", "active");

    await delay(300);


    const currentPhotons =
        encodePhoton(
            currentBits,
            currentAliceBases
        );


    document.getElementById("photons").textContent =
        currentPhotons
            .map(
                photon =>
                    `(${photon.bit}, ${photon.basis})`
            )
            .join("   ");


    setStepState("stepEncoding", "completed");


    // =================================================
    // STEP 3 — MEASUREMENT
    // =================================================

    setStepState("stepMeasurement", "active");

    await delay(300);


    const currentBobBases =
        generateRandomBases(NUM_BITS);


    const currentBobKey = [];


    for (
        let i = 0;
        i < currentPhotons.length;
        i++
    ) {

        const measuredBit =
            measurePhoton(
                currentPhotons[i],
                currentBobBases[i]
            );


        currentBobKey.push(measuredBit);

    }


    document.getElementById("bobBases").textContent =
        currentBobBases.join(" ");


    document.getElementById("bobKey").textContent =
        currentBobKey.join(" ");


    setStepState("stepMeasurement", "completed");


    // =================================================
    // STEP 4 — KEY SIFTING
    // =================================================

    setStepState("stepSifting", "active");

    await delay(300);


    const currentSiftedAliceKey =
        siftKey(
            currentBits,
            currentAliceBases,
            currentBobBases
        );


    const currentSiftedBobKey = [];

    const matchingPositions = [];


    for (
        let i = 0;
        i < currentBobKey.length;
        i++
    ) {

        if (
            currentAliceBases[i] ===
            currentBobBases[i]
        ) {

            currentSiftedBobKey.push(
                currentBobKey[i]
            );

            matchingPositions.push(i + 1);

        }

    }


    document.getElementById("siftedKey").textContent =
        currentSiftedAliceKey.length > 0
            ? currentSiftedAliceKey.join(" ")
            : "No matching bases";


    document.getElementById("matchingPositions").textContent =
        matchingPositions.length > 0
            ? matchingPositions.join(", ")
            : "None";


    setStepState("stepSifting", "completed");


    // =================================================
    // STEP 5 — KEY VERIFICATION
    // =================================================

    setStepState("stepVerification", "active");

    await delay(300);


    let matchingBits = 0;


    for (
        let i = 0;
        i < currentSiftedAliceKey.length;
        i++
    ) {

        if (
            currentSiftedAliceKey[i] ===
            currentSiftedBobKey[i]
        ) {

            matchingBits++;

        }

    }


    let matchRate = 0;


    if (currentSiftedAliceKey.length > 0) {

        matchRate =
            (
                matchingBits /
                currentSiftedAliceKey.length
            ) * 100;

    }


    document.getElementById("matchingBits").textContent =
        `${matchingBits} / ${currentSiftedAliceKey.length}`;


    document.getElementById("matchRate").textContent =
        `${matchRate.toFixed(0)}%`;


    // Run Riya's comparison function
    compareKeys(
        currentSiftedAliceKey,
        currentSiftedBobKey
    );


    setStepState("stepVerification", "completed");


    // =================================================
    // FINAL STATUS
    // =================================================

    statusText.textContent =
        "TRANSMISSION COMPLETE";


    statusDot.style.background =
        "#2e9b70";


    verificationTitle.textContent =
        "KEY VERIFIED";


    verificationMessage.textContent =
        `${matchingBits} of ${currentSiftedAliceKey.length} ` +
        `sifted bits matched successfully.`;


    // Re-enable button
    button.disabled = false;

    button.textContent =
        "GENERATE SECURE KEY";


    // Console information
    console.log("Alice's bits:", currentBits);

    console.log(
        "Alice's bases:",
        currentAliceBases
    );

    console.log(
        "Encoded photons:",
        currentPhotons
    );

    console.log(
        "Bob's bases:",
        currentBobBases
    );

    console.log(
        "Bob's measured key:",
        currentBobKey
    );

    console.log(
        "Sifted Alice key:",
        currentSiftedAliceKey
    );

    console.log(
        "Sifted Bob key:",
        currentSiftedBobKey
    );

    console.log(
        "Matching bits:",
        matchingBits
    );

    console.log(
        "Match rate:",
        matchRate.toFixed(0) + "%"
    );

}


// -----------------------------------------------------
// Generate Secure Key button
// -----------------------------------------------------

document
    .getElementById("generateKeyButton")
    .addEventListener(
        "click",
        generateSecureKey
    );


// -----------------------------------------------------
// Initial state
// -----------------------------------------------------

console.log("BB84 Simulator loaded!");