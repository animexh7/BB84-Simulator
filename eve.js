// Eve's BB84 Intercept-Resend Attack

function generateEveRandomBases(numberOfBits) {
    const bases = [];

    for (let i = 0; i < numberOfBits; i++) {
        bases.push(Math.random() < 0.5 ? "Z" : "X");
    }

    return bases;
}

function interceptAndResend(photons) {
    // Eve chooses random measurement bases
    const eveBases = generateEveRandomBases(photons.length);

    const eveBits = [];

    // Eve measures each photon
    for (let i = 0; i < photons.length; i++) {
        const measuredBit = measurePhoton(
            photons[i],
            eveBases[i]
        );

        eveBits.push(measuredBit);
    }

    // Eve creates new photons and forwards them to Bob
    const forwardedPhotons = encodePhoton(
        eveBits,
        eveBases
    );

    return {
        eveBases: eveBases,
        eveBits: eveBits,
        forwardedPhotons: forwardedPhotons
    };
}
