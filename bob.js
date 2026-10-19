// Bob's BB84 Functions

function generateRandomBases(length) {
    const bases = [];

    for (let i = 0; i < length; i++) {
        bases.push(Math.random() < 0.5 ? "Z" : "X");
    }

    return bases;
}

// Measure a photon using Bob's selected basis
function measurePhoton(photon, guessedBasis) {
    if (photon.basis === guessedBasis) {
        return photon.bit;
    }

    return Math.random() < 0.5 ? 0 : 1;
}

// Compare Alice's and Bob's sifted keys
function compareKeys(aliceKey, bobKey, sampleFraction = 0.5) {
    if (aliceKey.length !== bobKey.length) {
        throw new Error("Alice's and Bob's keys must have equal lengths.");
    }

    const length = aliceKey.length;

    if (length === 0) {
        return {
            sampledBits: 0,
            mismatches: 0,
            qber: null,
            threshold: 11,
            secureEnough: false,
            message: "No sifted bits available.",
            remainingAliceKey: [],
            remainingBobKey: []
        };
    }

    // Shuffle the positions randomly
    const indices = Array.from(
        { length: length },
        (_, i) => i
    );

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [indices[i], indices[j]] =
            [indices[j], indices[i]];
    }

    // Keep at least one bit for the remaining key
    const sampleSize = Math.min(
        length - 1,
        Math.floor(length * sampleFraction)
    );

    const sampleIndices = indices.slice(0, sampleSize);
    const sampledPositions = new Set(sampleIndices);

    let mismatches = 0;

    for (const index of sampleIndices) {
        if (aliceKey[index] !== bobKey[index]) {
            mismatches++;
        }
    }

    const qber = sampleSize > 0
        ? (mismatches / sampleSize) * 100
        : null;

    const threshold = 11;

    // Remove the publicly revealed sample bits
    const remainingAliceKey = aliceKey.filter(
        (_, index) => !sampledPositions.has(index)
    );

    const remainingBobKey = bobKey.filter(
        (_, index) => !sampledPositions.has(index)
    );

    // Require at least 10 sampled bits for this demonstration
    const enoughSampleData = sampleSize >= 10;

    const secureEnough =
        enoughSampleData &&
        qber !== null &&
        qber <= threshold;

    let message;

    if (!enoughSampleData) {
        message =
            "Sample too small for a reliable security estimate. Generate more bits.";
    } else if (qber > threshold) {
        message =
            "QBER exceeds 11%. Reject the key in this simulation.";
    } else {
        message =
            "Sample QBER is at or below 11%. This does not prove real-world security.";
    }

    return {
        sampledBits: sampleSize,
        mismatches: mismatches,
        qber: qber,
        threshold: threshold,
        secureEnough: secureEnough,
        message: message,
        remainingAliceKey: remainingAliceKey,
        remainingBobKey: remainingBobKey
    };
}
