
/* =====================================================
   BB84 QUANTUM KEY DISTRIBUTION SIMULATOR
   Alice -> Eve -> Bob -> Sifting -> QBER Verification
   ===================================================== */

// Delay helper for process animation.
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Safely update interface text.
function updateText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

// Update process tracker state.
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

// Reset process tracker.
function resetProcessSteps() {
    [
        "stepGeneration",
        "stepEncoding",
        "stepMeasurement",
        "stepSifting",
        "stepVerification"
    ].forEach(id => setStepState(id, ""));
}

// Main simulation.
async function generateSecureKey() {
    const button = document.getElementById("generateKeyButton");

    if (button && button.disabled) return;

    // Check that required functions are available.
    const requiredFunctions = [
        "generateRandomBits",
        "generateRandomBases",
        "encodePhoton",
        "measurePhoton",
        "interceptAndResend",
        "siftKey",
        "compareKeys"
    ];

    for (const functionName of requiredFunctions) {
        if (typeof window[functionName] !== "function") {
            const message =
                `Missing function: ${functionName}. Check alice.js, bob.js and eve.js.`;

            console.error(message);
            updateText("statusText", message);
            updateText("verificationTitle", "Simulation Error");
            updateText("verificationMessage", message);
            return;
        }
    }

    if (button) {
        button.disabled = true;
        button.textContent = "SIMULATION IN PROGRESS...";
    }

    resetProcessSteps();

    updateText("statusText", "Initializing simulation...");
    updateText("verificationTitle", "Verification Pending");
    updateText(
        "verificationMessage",
        "Generating bits and simulating quantum communication."
    );

    try {
        // ---------------------------------------------
        // STEP 1: Alice generates random bits and bases.
        // ---------------------------------------------
        setStepState("stepGeneration", "active");
        updateText("statusText", "Generating random bits and bases...");

        await delay(400);

        const aliceBits = generateRandomBits(NUM_BITS);
        const aliceBases = generateRandomBases(NUM_BITS);

        updateText("bits", aliceBits.join(" "));
        updateText("bases", aliceBases.join(" "));

        setStepState("stepGeneration", "completed");

        // ---------------------------------------------
        // STEP 2: Alice encodes quantum states.
        // ---------------------------------------------
        setStepState("stepEncoding", "active");
        updateText("statusText", "Encoding quantum states...");

        await delay(400);

        const alicePhotons = encodePhoton(aliceBits, aliceBases);

        const photonStates = alicePhotons.map(photon => {
            if (photon.basis === "Z") {
                return photon.bit === 0 ? "|0⟩" : "|1⟩";
            }

            return photon.bit === 0 ? "|+⟩" : "|−⟩";
        });

        updateText("photons", photonStates.join(" "));

        setStepState("stepEncoding", "completed");

        // ---------------------------------------------
        // STEP 3: Eve intercepts and resends photons.
        // ---------------------------------------------
        setStepState("stepMeasurement", "active");
        updateText("statusText", "Eve is intercepting and measuring photons...");

        await delay(400);

        const eveResult = interceptAndResend(alicePhotons);
        const photonsSentToBob = eveResult.forwardedPhotons;

        // ---------------------------------------------
        // STEP 4: Bob measures forwarded photons.
        // ---------------------------------------------
        updateText("statusText", "Bob is measuring the photons...");

        const bobBases = generateRandomBases(NUM_BITS);
        const bobKey = [];

        for (let i = 0; i < photonsSentToBob.length; i++) {
            bobKey.push(
                measurePhoton(photonsSentToBob[i], bobBases[i])
            );
        }

        updateText("bobBases", bobBases.join(" "));
        updateText("bobKey", bobKey.join(" "));

        await delay(400);

        setStepState("stepMeasurement", "completed");

        // ---------------------------------------------
        // STEP 5: Sift keys using matching bases.
        // ---------------------------------------------
        setStepState("stepSifting", "active");
        updateText("statusText", "Sifting keys using matching bases...");

        await delay(400);

        const matchingPositions = [];

        for (let i = 0; i < NUM_BITS; i++) {
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

        updateText("siftedKey", siftedAlice.join(" "));

        setStepState("stepSifting", "completed");

        // ---------------------------------------------
        // STEP 6: Sample sifted keys and calculate QBER.
        // ---------------------------------------------
        setStepState("stepVerification", "active");
        updateText("statusText", "Sampling keys and estimating QBER...");

        await delay(400);

        const verificationResult = compareKeys(
            siftedAlice,
            siftedBob,
            0.5
        );

        if (
            !verificationResult ||
            typeof verificationResult.sampledBits !== "number"
        ) {
            throw new Error(
                "compareKeys() returned an unexpected result. Check bob.js."
            );
        }

        const {
            sampledBits,
            mismatches,
            qber,
            threshold,
            message,
            remainingAliceKey,
            remainingBobKey
        } = verificationResult;

        // ---------------------------------------------
        // STEP 7: Display verification statistics.
        // These IDs must also exist in index.html.
        // ---------------------------------------------
        updateText("siftedKeyLength", siftedAlice.length);
        updateText("sampleSize", sampledBits);

        updateText(
            "matchingBits",
            `${sampledBits - mismatches}/${sampledBits}`
        );

        updateText(
            "qberValue",
            qber === null ? "N/A" : `${qber.toFixed(2)}%`
        );

        updateText(
            "remainingKeyLength",
            remainingAliceKey.length
        );

        // Log the simulation for debugging.
        console.log("----- BB84 Simulation Results -----");
        console.log("Alice's bits:", aliceBits);
        console.log("Alice's bases:", aliceBases);
        console.log("Eve's bases:", eveResult.eveBases);
        console.log("Eve's measured bits:", eveResult.eveBits);
        console.log("Bob's bases:", bobBases);
        console.log("Bob's measured bits:", bobKey);
        console.log("Alice's sifted key:", siftedAlice);
        console.log("Bob's sifted key:", siftedBob);

        console.log("----- QBER Verification -----");
        console.log("Sifted key length:", siftedAlice.length);
        console.log("Sample size:", sampledBits);
        console.log("Mismatches:", mismatches);
        console.log(
            "Estimated QBER:",
            qber === null ? "N/A" : `${qber.toFixed(2)}%`
        );
        console.log("Threshold:", `${threshold}%`);
        console.log("Decision:", message);
        console.log("Alice's remaining key:", remainingAliceKey);
        console.log("Bob's remaining key:", remainingBobKey);

        // ---------------------------------------------
        // STEP 8: Display verification decision.
        // ---------------------------------------------
        const titleElement = document.getElementById("verificationTitle");
        const messageElement = document.getElementById("verificationMessage");

        if (titleElement) titleElement.style.color = "";
        if (messageElement) messageElement.style.color = "";

        if (qber === null || sampledBits === 0) {
            updateText("verificationTitle", "Insufficient Key Data");
            updateText("verificationMessage", message);
            updateText(
                "statusText",
                "Simulation complete. No usable sample was available."
            );

        } else if (sampledBits < 10) {
            updateText("verificationTitle", "Sample Too Small");
            updateText("verificationMessage", message);
            updateText(
                "statusText",
                `Sample QBER: ${qber.toFixed(1)}%. More data is needed for a meaningful estimate.`
            );

        } else if (qber > threshold) {
            updateText(
                "verificationTitle",
                "Possible Eavesdropping — Key Rejected"
            );

            if (titleElement) titleElement.style.color = "red";
            if (messageElement) messageElement.style.color = "red";

            updateText(
                "verificationMessage",
                `${message} QBER: ${qber.toFixed(1)}% (${mismatches}/${sampledBits} mismatches).`
            );

            updateText(
                "statusText",
                "Key rejected by the demonstration QBER check."
            );

        } else {
            updateText("verificationTitle", "Sample Within Threshold");

            if (titleElement) titleElement.style.color = "green";
            if (messageElement) messageElement.style.color = "green";

            updateText(
                "verificationMessage",
                `${message} QBER: ${qber.toFixed(1)}% (${mismatches}/${sampledBits} mismatches). This does not prove the channel is secure.`
            );

            updateText(
                "statusText",
                "Sample error rate is within the illustrative threshold."
            );
        }

        setStepState("stepVerification", "completed");

    } catch (error) {
        console.error("Simulation error:", error);

        updateText("statusText", "Simulation failed. Check the browser console.");
        updateText("verificationTitle", "Simulation Error");
        updateText(
            "verificationMessage",
            error.message || "An unexpected error occurred."
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "GENERATE SECURE KEY";
        }
    }
}
