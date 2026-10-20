
/* BB84 Quantum Key Distribution Simulator
   Day 4: Alice's Bit, Basis, Photon and Transmission Animation
*/

window.verifiedBB84Key = null;
window.bb84KeyVerified = false;

const ANIMATION_PREVIEW_COUNT = 12;

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

/* ==========================================
   DAY 4: ALICE ANIMATION FUNCTIONS
   ========================================== */

// Reset the animation panel for a new simulation.
function resetAliceAnimation() {
    const previewIds = [
        "animatedBits",
        "animatedBases",
        "animatedPhotons"
    ];

    previewIds.forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.replaceChildren();

            const placeholder = document.createElement("span");
            placeholder.className = "animation-placeholder";
            placeholder.textContent = "Waiting...";

            element.appendChild(placeholder);
        }
    });

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

// Animate values appearing one at a time.
// Only the preview is animated; the full arrays remain unchanged.
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

        token.textContent = String(preview[i]);
        token.style.animationDelay = "0ms";

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

// Animate one photon travelling along the Alice-to-Bob channel.
async function animatePhotonTransmission() {
    const photon = document.getElementById("travellingPhoton");

    updateText("photonStatus", "Sending photons from Alice to Bob...");
    updateText("aliceAnimationStatus", "Photons are travelling through the quantum channel.");

    if (!photon) {
        await delay(300);
        return;
    }

    photon.classList.remove("traveling");

    // Restart the CSS animation reliably.
    void photon.offsetWidth;

    photon.classList.add("traveling");

    await delay(1450);

    photon.classList.remove("traveling");

    updateText("photonStatus", "Photons reached Bob");
    updateText("aliceAnimationStatus", "Transmission preview complete. Bob can now measure the photons.");
}

// Display Alice's bits, bases, and encoded photon states in sequence.
async function animateAlicePreparation(aliceBits, aliceBases, photonStates) {
    updateText("aliceAnimationStatus", "Alice is generating random bits...");

    await animateSequence("animatedBits", aliceBits, "bit");

    updateText("aliceAnimationStatus", "Alice is selecting random preparation bases...");

    await animateSequence("animatedBases", aliceBases, "basis");

    updateText("aliceAnimationStatus", "Alice is encoding bits into quantum states...");

    await animateSequence("animatedPhotons", photonStates, "photon");

    await animatePhotonTransmission();
}

/* ==========================================
   MAIN BB84 SIMULATION
   ========================================== */

async function generateSecureKey() {
    const button = document.getElementById("generateKeyButton");

    if (button && button.disabled) return;

    window.verifiedBB84Key = null;
    window.bb84KeyVerified = false;

    if (typeof window.resetPharmaForNewSimulation === "function") {
        window.resetPharmaForNewSimulation();
    }

    resetProcessSteps();
    resetAliceAnimation();

    updateText("statusText", "Initializing simulation...");
    updateText("verificationTitle", "Verification Pending");

    updateText(
        "verificationMessage",
        "Generating bits and simulating quantum communication."
    );

    const titleElement = document.getElementById("verificationTitle");
    const messageElement = document.getElementById("verificationMessage");

    if (titleElement) titleElement.style.color = "";
    if (messageElement) messageElement.style.color = "";

    if (button) {
        button.disabled = true;
        button.textContent = "SIMULATION IN PROGRESS...";
    }

    try {
        // Step 1: Alice generates random bits and bases.
        setStepState("stepGeneration", "active");

        updateText("statusText", "Generating random bits and bases...");

        await delay(200);

        const numberOfBits = 2048;

        const aliceBits = generateRandomBits(numberOfBits);
        const aliceBases = generateRandomBases(numberOfBits);

        updateText("bits", formatSequence(aliceBits));
        updateText("bases", formatSequence(aliceBases));

        // Day 4 animation: show Alice's random bits and bases.
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

        // Step 2: Alice encodes the photons.
        setStepState("stepEncoding", "active");

        updateText("statusText", "Encoding quantum states...");

        await delay(200);

        const alicePhotons = encodePhoton(aliceBits, aliceBases);

        const photonStates = alicePhotons.map(photon => {
            if (photon.basis === "Z") {
                return photon.bit === 0 ? "|0⟩" : "|1⟩";
            }

            return photon.bit === 0 ? "|+⟩" : "|−⟩";
        });

        updateText("photons", formatSequence(photonStates));

        // Day 4 animation: show encoded photon states.
        await animateSequence("animatedPhotons", photonStates, "photon");

        setStepState("stepEncoding", "completed");

        // Step 3: Transmit photons from Alice to Bob.
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

        // Step 4: Bob measures the photons.
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

        await delay(300);

        setStepState("stepMeasurement", "completed");

        // Step 5: Sift keys using matching bases.
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

        // Step 6: Estimate QBER using a random sample.
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

        const remainingA = remainingAliceKey || [];
        const remainingB = remainingBobKey || [];

        updateText("remainingKeyLength", remainingA.length);

        const keysMatch =
            remainingA.length > 0 &&
            remainingA.length === remainingB.length &&
            remainingA.every(
                (bit, index) => bit === remainingB[index]
            );

        // Step 7: Decide whether to accept the demonstration key.
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

            if (titleElement) titleElement.style.color = "red";
            if (messageElement) messageElement.style.color = "red";

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

            window.dispatchEvent(new Event("bb84-key-updated"));

            updateText(
                "aliceAnimationStatus",
                "Transmission complete. The demonstration key passed verification."
            );

            if (titleElement) titleElement.style.color = "green";
            if (messageElement) messageElement.style.color = "green";
        }

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

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "GENERATE SECURE KEY";
        }

        window.dispatchEvent(new Event("bb84-key-updated"));
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("generateKeyButton");

    if (button) {
        button.addEventListener("click", generateSecureKey);
    }
});

