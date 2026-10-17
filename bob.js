function generateRandomBases(length) {
    let bases = [];

    for (let i = 0; i < length; i++) {
        let randomNumber = Math.random();

        if (randomNumber < 0.5) {
            bases.push("Z");
        } else {
            bases.push("X");
        }
    }

    return bases;
}
function measurePhoton(photon, guessedBasis) {
    if (photon.basis === guessedBasis) {
        return photon.bit;
    } else {
        return Math.random() < 0.5 ? 0 : 1;
    }
}

function compareKeys(aliceKey, bobKey, sampleFraction = 0.5) {
    if (aliceKey.length !== bobKey.length) {
        throw new Error("Alice's and Bob's keys must have equal lengths.");
    }

    if (aliceKey.length === 0) {
        return {
            sampledBits: 0,
            mismatches: 0,
            qber: null,
            threshold: 11,
            secureEnough: false,
            message: "No sifted bits available for sampling.",
            remainingAliceKey: [],
            remainingBobKey: []
        };
    }

    // Randomly choose positions to reveal publicly.
    const indices = Array.from(
        { length: aliceKey.length },
        (_, i) => i
    );

    // Shuffle the positions.
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Choose a sample, leaving at least one bit when possible.
    const sampleSize = aliceKey.length === 1
        ? 1
        : Math.min(
            aliceKey.length - 1,
            Math.max(1, Math.floor(aliceKey.length * sampleFraction))
        );

    const sampleIndices = indices.slice(0, sampleSize);
    const revealedPositions = new Set(sampleIndices);

    let mismatches = 0;

    for (const index of sampleIndices) {
        if (aliceKey[index] !== bobKey[index]) {
            mismatches++;
        }
    }

    const qber = (mismatches / sampleSize) * 100;
    const threshold = 11;

    // Remove publicly revealed bits from the remaining key.
    const remainingAliceKey = aliceKey.filter(
        (_, index) => !revealedPositions.has(index)
    );

    const remainingBobKey = bobKey.filter(
        (_, index) => !revealedPositions.has(index)
    );

    // A single bit is insufficient for meaningful security estimation.
    const enoughSampleData = sampleSize >= 10;
    const secureEnough = enoughSampleData && qber <= threshold;

    let message;

    if (!enoughSampleData) {
        message =
            "Sample too small for a reliable security estimate. Demonstration only.";
    } else if (qber > threshold) {
        message =
            "QBER exceeds 11%. Reject the key in this simplified simulation.";
    } else {
        message =
            "Sample QBER is at or below 11%. Further security checks are still required.";
    }

    const result = {
        sampledBits: sampleSize,
        mismatches,
        qber,
        threshold,
        secureEnough,
        message,
        remainingAliceKey,
        remainingBobKey
    };

    console.log("Sampled bits:", sampleSize);
    console.log("Mismatches:", mismatches);
    console.log("Estimated QBER:", qber.toFixed(2) + "%");
    console.log("Threshold:", threshold + "%");
    console.log("Decision:", message);
    console.log("Alice's remaining key:", remainingAliceKey);
    console.log("Bob's remaining key:", remainingBobKey);

    return result;
}
