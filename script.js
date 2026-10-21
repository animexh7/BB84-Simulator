
/* BB84 Quantum Key Distribution Simulator
   Day 4: Bob's Measurement Animation
   Day 5: Verification UI Testing
*/

window.verifiedBB84Key = null;
window.bb84KeyVerified = false;

const ANIMATION_PREVIEW_COUNT = 12;
let mismatchPreviewSnapshot = null;
let simulationRunning = false;

function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function updateText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function formatSequence(sequence) {
    if (!sequence || sequence.length === 0) {
        return "—";
    }

    return sequence.join(" ");
}

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

function resetProcessSteps() {
    [
        "stepGeneration",
        "stepEncoding",
        "stepMeasurement",
        "stepSifting",
        "stepVerification"
    ].forEach(id => setStepState(id, ""));
}

function setPlaceholder(elementId, text) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.replaceChildren();

    const placeholder = document.createElement("span");
    placeholder.className = "animation-placeholder";
    placeholder.textContent = text;

    element.appendChild(placeholder);
}

function resetAliceAnimation() {
    [
        "animatedBits",
        "animatedBases",
        "animatedPhotons"
    ].forEach(id => setPlaceholder(id, "Waiting..."));

    const photon = document.getElementById("travellingPhoton");

    if (photon) {
        photon.classList.remove("traveling");
    }

    updateText("photonStatus", "Waiting to transmit photons");
    updateText(
        "aliceAnimationStatus",
        "Preparing Alice's quantum communication..."
    );
}

function resetBobAnimation() {
    [
        "bobAnimatedPhotons",
        "bobAnimatedBases",
        "bobAnimatedBits"
    ].forEach(id => setPlaceholder(id, "Waiting..."));

    updateText(
        "bobAnimationStatus",
        "Waiting for photons from Alice."
    );
}

async function animateSequence(elementId, values, type) {
    const container = document.getElementById(elementId);

    if (!container) return;

    container.replaceChildren();

    const preview = values.slice(0, ANIMATION_PREVIEW_COUNT);

    for (let i = 0; i < preview.length; i++) {
        const token = document.createElement("span");

        token.classList.add("bit-token");

        if (type === "basis") {
            token.classList.add(
                preview[i] === "Z" ? "basis-z" : "basis-x"
            );
        }

        if (type === "photon") {
            token.classList.add("photon-token");
        }

        if (type === "measured") {
            token.classList.add("measured-token");
        }

        token.textContent = String(preview[i]);
        container.appendChild(token);

        await delay(75);
    }

    if (values.length > ANIMATION_PREVIEW_COUNT) {
        const more = document.createElement("span");

        more.className = "animation-placeholder";
        more.textContent =
            `+ ${values.length - ANIMATION_PREVIEW_COUNT} more`;

        container.appendChild(more);
    }
}

/* Convert an encoded photon into its displayed quantum state. */
function photonToState(photon) {
    if (photon.basis === "Z") {
        return photon.bit === 0 ? "|0⟩" : "|1⟩";
    }

    return photon.bit === 0 ? "|+⟩" : "|−⟩";
}

async function animatePhotonTransmission() {
    const photon = document.getElementById("travellingPhoton");

    updateText("photonStatus", "Sending photons from Alice to Bob...");
    updateText(
        "aliceAnimationStatus",
        "Photons are travelling through the quantum channel."
    );

    if (!photon) {
        await delay(300);
        return;
    }

    photon.classList.remove("traveling");

    // Restart the CSS animation.
    void photon.offsetWidth;

    photon.classList.add("traveling");

    await delay(1450);

    photon.classList.remove("traveling");

    updateText("photonStatus", "Photons reached Bob");
    updateText(
        "aliceAnimationStatus",
        "Transmission preview complete. Bob can now measure the photons."
    );
}

async function animateBobMeasurement(
    photonStates,
    bobBases,
    bobKey,
    eveEnabled
) {
    updateText(
        "bobAnimationStatus",
        eveEnabled
            ? "Bob is receiving photons that have passed through Eve."
            : "Bob has received photons from Alice."
    );

    // These are the photons Bob actually received.
    await animateSequence(
        "bobAnimatedPhotons",
        photonStates,
        "photon"
    );

    updateText(
        "bobAnimationStatus",
        "Bob is selecting random measurement bases..."
    );

    await animateSequence(
        "bobAnimatedBases",
        bobBases,
        "basis"
    );

    updateText(
        "bobAnimationStatus",
        "Bob is measuring the incoming photons..."
    );

    await animateSequence(
        "bobAnimatedBits",
        bobKey,
        "measured"
    );

    updateText(
        "bobAnimationStatus",
        "Measurement complete. Bob's measured bits are ready for key sifting."
    );
}

function resetQBERIndicator() {
    const fill = document.getElementById("qberBarFill");
    const track = document.getElementById("qberTrack");

    if (fill) {
        fill.style.width = "0%";
        fill.style.backgroundColor = "";
    }

    if (track) {
        track.setAttribute("aria-valuenow", "0");
    }

    updateText("qberIndicatorLabel", "Waiting for results");
}

function updateQBERIndicator(qber, threshold, sampleIsLargeEnough) {
    const fill = document.getElementById("qberBarFill");
    const track = document.getElementById("qberTrack");
    const label = document.getElementById("qberIndicatorLabel");

    if (qber === null || !Number.isFinite(qber)) {
        if (fill) fill.style.width = "0%";
        if (track) track.setAttribute("aria-valuenow", "0");
        if (label) label.textContent = "QBER unavailable";
        return;
    }

    const displayedQBER = Math.max(0, Math.min(100, qber));

    if (fill) {
        fill.style.width = `${displayedQBER}%`;

        if (qber > threshold) {
            fill.style.backgroundColor = "#d93025";
        } else if (sampleIsLargeEnough) {
            fill.style.backgroundColor = "#18864b";
        } else {
            fill.style.backgroundColor = "#d99a16";
        }
    }

    if (track) {
        track.setAttribute(
            "aria-valuenow",
            String(Math.round(displayedQBER))
        );
    }

    if (label) {
        if (qber > threshold) {
            label.textContent =
                `${qber.toFixed(2)}% · Above ${threshold}% threshold`;
        } else if (sampleIsLargeEnough) {
            label.textContent =
                `${qber.toFixed(2)}% · At or below threshold`;
        } else {
            label.textContent =
                `${qber.toFixed(2)}% · Sample too small`;
        }
    }
}

function resetVerificationColours() {
    const title = document.getElementById("verificationTitle");
    const message = document.getElementById("verificationMessage");

    if (title) title.style.color = "";
    if (message) message.style.color = "";
}

async function generateSecureKey() {
    const button = document.getElementById("generateKeyButton");

    if (simulationRunning || (button && button.disabled)) return;

    simulationRunning = true;

    // Clear a previous UI-only test before a real simulation.
    if (mismatchPreviewSnapshot) {
        restoreMismatchPreview();
    }

    window.verifiedBB84Key = null;
    window.bb84KeyVerified = false;

    if (typeof window.resetPharmaForNewSimulation === "function") {
        window.resetPharmaForNewSimulation();
    }

    resetProcessSteps();
    resetAliceAnimation();
    resetBobAnimation();
    resetQBERIndicator();
    resetVerificationColours();

    updateText("statusText", "Initializing simulation...");
    updateText("verificationTitle", "Verification Pending");
    updateText(
        "verificationMessage",
        "Generating bits and simulating quantum communication."
    );

    if (button) {
        button.disabled = true;
        button.textContent = "SIMULATION IN PROGRESS...";
    }

    const previewButton = document.getElementById("previewMismatchButton");

    if (previewButton) previewButton.disabled = true;

    try {
        // Step 1: Generate Alice's random bits and bases.
        setStepState("stepGeneration", "active");
        updateText("statusText", "Generating random bits and bases...");

        await delay(200);

        const numberOfBits = window.NUM_BITS || 128;

        const aliceBits = generateRandomBits(numberOfBits);
        const aliceBases = generateRandomBases(numberOfBits);

        updateText("bits", formatSequence(aliceBits));
        updateText("bases", formatSequence(aliceBases));

        await animateSequence("animatedBits", aliceBits, "bit");

        updateText(
            "aliceAnimationStatus",
            "Bits generated. Alice is choosing preparation bases..."
        );

        await animateSequence("animatedBases", aliceBases, "basis");

        updateText(
            "aliceAnimationStatus",
            "Bits and bases generated. Preparing quantum states..."
        );

        setStepState("stepGeneration", "completed");

        // Step 2: Encode the bits as photon states.
        setStepState("stepEncoding", "active");
        updateText("statusText", "Encoding quantum states...");

        await delay(200);

        const alicePhotons = encodePhoton(aliceBits, aliceBases);

        const photonStates = alicePhotons.map(photonToState);

        updateText("photons", formatSequence(photonStates));

        await animateSequence(
            "animatedPhotons",
            photonStates,
            "photon"
        );

        setStepState("stepEncoding", "completed");

        // Step 3: Transmit the photons.
        setStepState("stepMeasurement", "active");
        updateText("statusText", "Transmitting photons to Bob...");

        await animatePhotonTransmission();

        const eveToggle = document.getElementById("eveToggle");
        const eveEnabled = eveToggle ? eveToggle.checked : false;

        let eveResult;
        let photonsSentToBob;

        if (eveEnabled) {
            updateText(
                "statusText",
                "Eve is intercepting and resending photons..."
            );

            eveResult = interceptAndResend(alicePhotons);
            photonsSentToBob = eveResult.forwardedPhotons;
        } else {
            eveResult = {
                eveBases: [],
                eveBits: []
            };

            photonsSentToBob = alicePhotons;
        }

        // Convert the actual photons sent to Bob into display labels.
        // When Eve is enabled, these are Eve's newly encoded photons.
        const bobPhotonStates = photonsSentToBob.map(photonToState);

        // Step 4: Bob measures the photons he received.
        updateText("statusText", "Bob is measuring the photons...");

        const bobBases = generateRandomBases(numberOfBits);
        const bobKey = [];

        for (let i = 0; i < photonsSentToBob.length; i++) {
            bobKey.push(
                measurePhoton(photonsSentToBob[i], bobBases[i])
            );
        }

        updateText("bobBases", formatSequence(bobBases));
        updateText("bobKey", formatSequence(bobKey));

        // Animate Bob's actual incoming photons and measured bits.
        await animateBobMeasurement(
            bobPhotonStates,
            bobBases,
            bobKey,
            eveEnabled
        );

        setStepState("stepMeasurement", "completed");

        // Step 5: Keep positions where Alice and Bob used matching bases.
        setStepState("stepSifting", "active");
        updateText("statusText", "Sifting keys...");

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

        const siftedBob = matchingPositions.map(
            index => bobKey[index]
        );

        updateText(
            "matchingPositions",
            matchingPositions.length
                ? matchingPositions.map(index => index + 1).join(", ")
                : "None"
        );

        updateText("siftedKey", formatSequence(siftedAlice));
        updateText("siftedKeyLength", siftedAlice.length);

        setStepState("stepSifting", "completed");

        // Step 6: Estimate the quantum bit error rate.
        setStepState("stepVerification", "active");
        updateText("statusText", "Sampling keys and estimating QBER...");

        await delay(300);

        const result = compareKeys(siftedAlice, siftedBob, 0.5);

        const {
            sampledBits,
            mismatches,
            qber,
            threshold,
            message,
            secureEnough,
            remainingAliceKey,
            remainingBobKey
        } = result;

        updateText("sampleSize", sampledBits);

        updateText(
            "matchingBits",
            `${sampledBits - mismatches}/${sampledBits}`
        );

        updateText(
            "qberValue",
            qber === null ? "N/A" : `${qber.toFixed(2)}%`
        );

        updateQBERIndicator(
            qber,
            threshold,
            sampledBits >= 10
        );

        const remainingA = remainingAliceKey || [];
        const remainingB = remainingBobKey || [];

        updateText("remainingKeyLength", remainingA.length);

        const keysMatch =
            remainingA.length > 0 &&
            remainingA.length === remainingB.length &&
            remainingA.every(
                (bit, index) => bit === remainingB[index]
            );

        // Step 7: Display the verification result.
        const titleElement = document.getElementById("verificationTitle");
        const messageElement = document.getElementById("verificationMessage");

        if (sampledBits < 10 || qber === null) {
            updateText("verificationTitle", "Sample Too Small");

            updateText(
                "verificationMessage",
                `${message} Only ${sampledBits} bits were sampled.`
            );

            updateText(
                "statusText",
                "Not enough sample bits. Run the simulation again."
            );

            updateText(
                "aliceAnimationStatus",
                "Transmission complete. Verification needs a larger sample."
            );

            updateText(
                "bobAnimationStatus",
                "Measurement complete. A larger verification sample is needed."
            );

        } else if (!secureEnough || !keysMatch) {
            updateText(
                "verificationTitle",
                "Possible Eavesdropping — Key Rejected"
            );

            updateText(
                "verificationMessage",
                `${message} QBER: ${qber.toFixed(2)}%.`
            );

            updateText(
                "statusText",
                "Key rejected. Run the simulation again."
            );

            updateText(
                "aliceAnimationStatus",
                "Transmission complete. The demonstration key was rejected."
            );

            updateText(
                "bobAnimationStatus",
                "Measurement complete. The demonstration key was rejected."
            );

            if (titleElement) titleElement.style.color = "#d93025";
            if (messageElement) messageElement.style.color = "#d93025";

        } else {
            updateText("verificationTitle", "Key Verified");

            updateText(
                "verificationMessage",
                `${message} QBER: ${qber.toFixed(2)}%. This is only a simulation.`
            );

            updateText(
                "statusText",
                "The key passed the demonstration verification check."
            );

            window.verifiedBB84Key = remainingA.slice();
            window.bb84KeyVerified = true;

            updateText(
                "aliceAnimationStatus",
                "Transmission complete. The demonstration key passed verification."
            );

            updateText(
                "bobAnimationStatus",
                "Measurement complete. The demonstration key passed verification."
            );

            if (titleElement) titleElement.style.color = "#18864b";
            if (messageElement) messageElement.style.color = "#18864b";
        }

        window.dispatchEvent(new Event("bb84-key-updated"));

        console.log("BB84 results:", {
            aliceBits,
            aliceBases,
            eveBases: eveResult.eveBases,
            eveBits: eveResult.eveBits,
            bobBases,
            bobKey,
            siftedAlice,
            siftedBob,
            sampledBits,
            mismatches,
            qber,
            threshold
        });

        setStepState("stepVerification", "completed");

    } catch (error) {
        console.error("Simulation error:", error);

        window.verifiedBB84Key = null;
        window.bb84KeyVerified = false;

        if (typeof window.resetPharmaForNewSimulation === "function") {
            window.resetPharmaForNewSimulation();
        }

        updateText("statusText", "Simulation failed.");
        updateText("verificationTitle", "Simulation Error");
        updateText(
            "verificationMessage",
            error.message || "An unexpected error occurred."
        );

        updateText(
            "aliceAnimationStatus",
            "The simulation encountered an error. Check the browser console."
        );

        updateText(
            "bobAnimationStatus",
            "Measurement failed. Check the browser console."
        );

        window.dispatchEvent(new Event("bb84-key-updated"));

    } finally {
        simulationRunning = false;

        if (button) {
            button.disabled = false;
            button.textContent = "GENERATE SECURE KEY";
        }

        if (previewButton) {
            previewButton.disabled = false;
        }

        window.dispatchEvent(new Event("bb84-key-updated"));
    }
}

/* ==========================================
   DAY 5: REVERSIBLE UI-ONLY MISMATCH PREVIEW
   ========================================== */

function saveMismatchPreviewSnapshot() {
    const ids = [
        "statusText",
        "verificationTitle",
        "verificationMessage",
        "matchingBits",
        "qberValue",
        "qberIndicatorLabel"
    ];

    const elements = {};

    ids.forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            elements[id] = {
                text: element.textContent,
                color: element.style.color
            };
        }
    });

    const fill = document.getElementById("qberBarFill");
    const track = document.getElementById("qberTrack");

    mismatchPreviewSnapshot = {
        elements: elements,
        fillWidth: fill ? fill.style.width : "",
        fillColor: fill ? fill.style.backgroundColor : "",
        ariaValue: track ? track.getAttribute("aria-valuenow") : "0",
        verifiedKey: Array.isArray(window.verifiedBB84Key)
            ? window.verifiedBB84Key.slice()
            : null,
        keyVerified: window.bb84KeyVerified
    };
}

function showMismatchPreview() {
    if (simulationRunning || mismatchPreviewSnapshot) return;

    saveMismatchPreviewSnapshot();

    const sampleSizeElement = document.getElementById("sampleSize");
    const sampleSize = Number(
        sampleSizeElement ? sampleSizeElement.textContent : 0
    );

    const displayedSampleSize =
        Number.isFinite(sampleSize) && sampleSize > 0
            ? sampleSize
            : 32;

    updateText(
        "statusText",
        "UI TEST ONLY: Previewing a rejected-key screen."
    );

    updateText(
        "verificationTitle",
        "UI TEST: Possible Eavesdropping — Key Rejected"
    );

    updateText(
        "verificationMessage",
        "UI PREVIEW ONLY: 100% of the displayed sample is mismatched. This is not a real simulation result."
    );

    updateText("matchingBits", `0/${displayedSampleSize}`);
    updateText("qberValue", "100.00%");
    updateText(
        "qberIndicatorLabel",
        "100.00% · UI test only · Above 11% threshold"
    );

    const fill = document.getElementById("qberBarFill");
    const track = document.getElementById("qberTrack");

    if (fill) {
        fill.style.width = "100%";
        fill.style.backgroundColor = "#d93025";
    }

    if (track) {
        track.setAttribute("aria-valuenow", "100");
    }

    const title = document.getElementById("verificationTitle");
    const message = document.getElementById("verificationMessage");

    if (title) title.style.color = "#d93025";
    if (message) message.style.color = "#d93025";

    // A UI preview must never enable pharmaceutical encryption.
    window.verifiedBB84Key = null;
    window.bb84KeyVerified = false;
    window.dispatchEvent(new Event("bb84-key-updated"));

    const previewButton = document.getElementById("previewMismatchButton");
    const restoreButton = document.getElementById("clearMismatchPreviewButton");

    if (previewButton) previewButton.disabled = true;
    if (restoreButton) restoreButton.disabled = false;

    updateText(
        "uiTestStatus",
        "Preview active. No BB84 calculation was changed. Restore actual results when finished."
    );
}

function restoreMismatchPreview() {
    if (!mismatchPreviewSnapshot) return;

    const snapshot = mismatchPreviewSnapshot;

    Object.keys(snapshot.elements).forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = snapshot.elements[id].text;
            element.style.color = snapshot.elements[id].color;
        }
    });

    const fill = document.getElementById("qberBarFill");
    const track = document.getElementById("qberTrack");

    if (fill) {
        fill.style.width = snapshot.fillWidth;
        fill.style.backgroundColor = snapshot.fillColor;
    }

    if (track) {
        track.setAttribute("aria-valuenow", snapshot.ariaValue || "0");
    }

    window.verifiedBB84Key = snapshot.verifiedKey
        ? snapshot.verifiedKey.slice()
        : null;

    window.bb84KeyVerified = snapshot.keyVerified;

    mismatchPreviewSnapshot = null;

    const previewButton = document.getElementById("previewMismatchButton");
    const restoreButton = document.getElementById("clearMismatchPreviewButton");

    if (previewButton) previewButton.disabled = simulationRunning;
    if (restoreButton) restoreButton.disabled = true;

    updateText("uiTestStatus", "UI test inactive. Actual displayed results restored.");

    window.dispatchEvent(new Event("bb84-key-updated"));
}

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("generateKeyButton");
    const previewButton = document.getElementById("previewMismatchButton");
    const restoreButton = document.getElementById("clearMismatchPreviewButton");

    if (button) {
        button.addEventListener("click", generateSecureKey);
    }

    if (previewButton) {
        previewButton.addEventListener("click", showMismatchPreview);
    }

    if (restoreButton) {
        restoreButton.addEventListener("click", restoreMismatchPreview);
    }
});

