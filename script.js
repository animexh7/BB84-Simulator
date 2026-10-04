// =====================================================
// BB84 Simulator - Main Script
// Controls the transmission pipeline and UI
// =====================================================

console.log("BB84 Simulator loaded!");


// -----------------------------------------------------
// Generate a complete secure key
// -----------------------------------------------------

function generateSecureKey() {

    console.log("Starting new BB84 transmission...");


    // 1. Generate random bits
    const currentBits = generateRandomBits(NUM_BITS);


    // 2. Generate random bases
    const currentAliceBases = generateRandomBases(NUM_BITS);


    // 3. Encode the bits into quantum states
    const currentPhotons = encodePhoton(
        currentBits,
        currentAliceBases
    );


    // 4. Bob generates his measurement bases
    const currentBobBases = generateRandomBases(NUM_BITS);


    // 5. Bob measures every photon
    const currentBobKey = [];

    for (let i = 0; i < currentPhotons.length; i++) {

        const measuredBit = measurePhoton(
            currentPhotons[i],
            currentBobBases[i]
        );

        currentBobKey.push(measuredBit);
    }


    // 6. Sift Alice's key
    const currentSiftedAliceKey = siftKey(
        currentBits,
        currentAliceBases,
        currentBobBases
    );


    // 7. Sift Bob's key
    const currentSiftedBobKey = [];

    for (let i = 0; i < currentBobKey.length; i++) {

        if (currentAliceBases[i] === currentBobBases[i]) {

            currentSiftedBobKey.push(
                currentBobKey[i]
            );

        }
    }


    // -------------------------------------------------
    // Console output
    // -------------------------------------------------

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


    // -------------------------------------------------
    // Calculate matching bits
    // -------------------------------------------------

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
            (matchingBits /
            currentSiftedAliceKey.length) * 100;

    }


    // -------------------------------------------------
    // Update transmission data on webpage
    // -------------------------------------------------

    document.getElementById("bits").textContent =
        currentBits.join(" ");


    document.getElementById("bases").textContent =
        currentAliceBases.join(" ");


    document.getElementById("photons").textContent =
        currentPhotons
            .map(
                photon =>
                    `(${photon.bit}, ${photon.basis})`
            )
            .join("   ");


    // -------------------------------------------------
    // Update verification information
    // -------------------------------------------------

    document.getElementById("siftedKey").textContent =
        currentSiftedAliceKey.length > 0
            ? currentSiftedAliceKey.join(" ")
            : "No matching bases";


    document.getElementById("matchingBits").textContent =
        `${matchingBits} / ${currentSiftedAliceKey.length}`;


    document.getElementById("matchRate").textContent =
        `${matchRate.toFixed(0)}%`;


    // -------------------------------------------------
    // Update system status
    // -------------------------------------------------

    document.getElementById("statusText").textContent =
        "TRANSMISSION COMPLETE";


    document.getElementById("verificationTitle").textContent =
        "KEY VERIFIED";


    document.getElementById("verificationMessage").textContent =
        `${matchingBits} of ${currentSiftedAliceKey.length} sifted bits matched successfully.`;


    console.log(
        "Matching bits:",
        matchingBits
    );

    console.log(
        "Match rate:",
        matchRate.toFixed(0) + "%"
    );


    // -------------------------------------------------
    // Existing compareKeys function from Bob module
    // -------------------------------------------------

    compareKeys(
        currentSiftedAliceKey,
        currentSiftedBobKey
    );

}


// -----------------------------------------------------
// Generate key button
// -----------------------------------------------------

document
    .getElementById("generateKeyButton")
    .addEventListener(
        "click",
        generateSecureKey
    );


// -----------------------------------------------------
// Initial simulation
// -----------------------------------------------------

document
    .getElementById("generateKeyButton")
    .addEventListener(
        "click",
        generateSecureKey
    );
