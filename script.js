
/* =====================================================
   BB84 Simulator — Main Script
   Alice → Eve → Bob → Key Sifting → Verification
   ===================================================== */

// Delay helper for the animated process tracker.
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Update the status of a process step.
function setStepState(stepId, state) {
    const step = document.getElementById(stepId);

    if (!step) return;

    step.classList.remove("active", "completed");

    if (state === "active") {
        step.classList.add("active");
    } else if (state === "completed") {
        step.classList.add("completed");
    }
}

// Reset all process steps before a new simulation.
function resetProcessSteps() {
    const stepIds = [
        "stepGeneration",
        "stepEncoding",
        "stepMeasurement",
        "stepSifting",
        "stepVerification"
    ];

    stepIds.forEach(stepId => {
        setStepState(stepId, "");
    });
}

// Safely update an element's text.
function updateText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

// Display an array as a readable sequence.
function formatSequence(sequence) {
    if (!sequence || sequence.length === 0) {
        return "—";
    }

    return sequence.join(" ");
}

// Generate and simulate a BB84 key with Eve intercepting photons.
async function generateSecureKey() {
    const button = document.getElementById("generateKeyButton");

    if (button && button.disabled) return;

    if (typeof generateRandomBits !== "function" ||
        typeof generateRandomBases !== "function" ||
        typeof encodePhoton !== "function" ||
        typeof measurePhoton !== "function" ||
        typeof interceptAndResend !== "function" ||
        typeof siftKey !== "function") {

        updateText(
            "statusText",
            "Error: required simulation functions are missing. Check the JavaScript files and script order."
        );

        console.error(
            "Missing function. Check alice.js, bob.js, eve.js and their script order in index.html."
        );

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Simulation in progress...";
    }

    resetProcessSteps();

    updateText("statusText", "Initializing simulation...");
    updateText("verificationTitle", "Verification pending");
    updateText(
        "verificationMessage",
        "The simulation is running. Results will appear after key sifting."
    );

    try {
        // ---------------------------------------------
        // STEP 1: Alice generates bits and bases.
        // ---------------------------------------------
        setStepState("stepGeneration", "active");
        updateText("statusText", "Generating Alice's random bits and bases...");

        await delay(600);

        const numberOfBits =
            typeof NUM_BITS === "number" ? NUM_BITS : 8;

        const aliceBits = generateRandomBits(numberOfBits);
        const aliceBases = generateRandomBases(numberOfBits);

        updateText("bits", formatSequence(aliceBits));
        updateText("bases", formatSequence(aliceBases));

        setStepState("stepGeneration", "completed");

        // ---------------------------------------------
        // STEP 2: Alice encodes bits into photon states.
        // ---------------------------------------------
        setStepState("stepEncoding", "active");
        updateText("statusText", "Encoding quantum states...");

        await delay(600);

        const alicePhotons = encodePhoton(aliceBits, aliceBases);

        const photonStates = alicePhotons.map(photon => {
            if (photon.basis === "Z") {
                return photon.bit === 0 ? "|0⟩" : "|1⟩";
            }

            return photon.bit === 0 ? "|+⟩" : "|−⟩";
        });

        updateText("photons", formatSequence(photonStates));

        setStepState("stepEncoding", "completed");

        // ---------------------------------------------
        // STEP 3: Eve intercepts and resends the photons.
        // ---------------------------------------------
        setStepState("stepMeasurement", "active");
        updateText("statusText", "Eve is intercepting and measuring photons...");

        await delay(600);

        const eveResult = interceptAndResend(alicePhotons);

        // Eve forwards newly prepared photons to Bob.
        const photonsSentToBob = eveResult.forwardedPhotons;

        // ---------------------------------------------
        // STEP 4: Bob chooses bases and measures photons.
        // ---------------------------------------------
        updateText("statusText", "Bob is measuring the forwarded photons...");

        const bobBases = generateRandomBases(numberOfBits);
        const bobKey = [];

        for (let i = 0; i < photonsSentToBob.length; i++) {
            bobKey.push(
                measurePhoton(photonsSentToBob[i], bobBases[i])
            );
        }

        updateText("bobBases", formatSequence(bobBases));
        updateText("bobKey", formatSequence(bobKey));

        await delay(600);

        setStepState("stepMeasurement", "completed");

        // ---------------------------------------------
        // STEP 5: Alice and Bob sift their keys.
        // Keep only positions where their bases match.
        // ---------------------------------------------
        setStepState("stepSifting", "active");
        updateText("statusText", "Sifting the keys...");

        await delay(600);

        const matchingPositions = [];

        for (let i = 0; i < numberOfBits; i++) {
            if (aliceBases[i] === bobBases[i]) {
                matchingPositions.push(i);
            }
        }

        const siftedAlice = siftKey(
            aliceBits,
            aliceBases,
            bobBases
        );

        const siftedBob = matchingPositions.map(index => bobKey[index]);

        updateText(
            "matchingPositions",
            matchingPositions.length
                ? matchingPositions.map(index => index + 1).join(", ")
                : "None"
        );

        updateText("siftedKey", formatSequence(siftedAlice));

        setStepState("stepSifting", "completed");

        // ---------------------------------------------
        // STEP 6: Estimate errors in the sifted key.
        // ---------------------------------------------
        setStepState("stepVerification", "active");
        updateText("statusText", "Checking for possible eavesdropping...");

        await delay(600);

        let matchingBits = 0;

        for (let i = 0; i < siftedAlice.length; i++) {
            if (siftedAlice[i] === siftedBob[i]) {
                matchingBits++;
            }
        }

        const totalSiftedBits = siftedAlice.length;

        const errorCount = totalSiftedBits - matchingBits;

        const errorRate = totalSiftedBits > 0
            ? (errorCount / totalSiftedBits) * 100
            : 0;

        const matchRate = totalSiftedBits > 0
            ? (matchingBits / totalSiftedBits) * 100
            : 0;

        updateText("matchingBits", `${matchingBits}/${totalSiftedBits}`);
        updateText("matchRate", `${matchRate.toFixed(1)}%`);

        // Log Eve's data for testing in the browser console.
        console.log("----- BB84 Simulation Results -----");
        console.log("Alice's bits:", aliceBits);
        console.log("Alice's bases:", aliceBases);
        console.log("Eve's bases:", eveResult.eveBases);
        console.log("Eve's measured bits:", eveResult.eveBits);
        console.log("Bob's bases:", bobBases);
        console.log("Bob's measured bits:", bobKey);
        console.log("Alice's sifted key:", siftedAlice);
        console.log("Bob's sifted key:", siftedBob);
        console.log("Errors detected:", errorCount);
        console.log("Estimated error rate:", `${errorRate.toFixed(1)}%`);

        // ---------------------------------------------
        // STEP 7: Display the verification result.
        // ---------------------------------------------
        if (totalSiftedBits === 0) {
            updateText("verificationTitle", "Insufficient key data");
            updateText(
                "verificationMessage",
                "No matching bases were found. Run the simulation again."
            );
            updateText(
                "statusText",
                "Simulation complete. No sifted key was produced."
            );
        } else if (errorCount > 0) {
            updateText("verificationTitle", "Possible interference detected");
            updateText(
                "verificationMessage",
                `The sifted keys differ at ${errorCount} of ${totalSiftedBits} positions. The estimated error rate is ${errorRate.toFixed(1)}%. This may indicate eavesdropping or another source of error.`
            );
            updateText(
                "statusText",
                "Simulation complete. Differences were detected in the sifted keys."
            );
        } else {
            updateText("verificationTitle", "No errors observed");
            updateText(
                "verificationMessage",
                "The sifted keys match in this run. This does not prove that the channel is secure or that Eve was absent."
            );
            updateText(
                "statusText",
                "Simulation complete. No sifted-key errors were observed."
            );
        }

        setStepState("stepVerification", "completed");

    } catch (error) {
        console.error("Simulation error:", error);

        updateText("statusText", "Simulation failed. Check the browser console.");
        updateText("verificationTitle", "Simulation error");
        updateText(
            "verificationMessage",
            error.message || "An unexpected error occurred."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Generate Secure Key";
        }
    }
}
