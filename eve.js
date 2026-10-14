
/* =====================================================
   Eve.js — BB84 Intercept-Resend Attack
   ===================================================== */

// Eve independently chooses random measurement bases.
function generateEveRandomBases(numberOfBits) {
    const bases = [];

    for (let i = 0; i < numberOfBits; i++) {
        bases.push(Math.random() < 0.5 ? "Z" : "X");
    }

    return bases;
}


// Eve intercepts and measures Alice's photons,
// then prepares fresh photons to forward to Bob.
function interceptAndResend(photons) {

    // Step 1: Eve chooses her own random bases.
    const eveBases = generateEveRandomBases(photons.length);

    // Step 2: Eve measures each intercepted photon.
    // Reuse measurePhoton() from bob.js.
    const eveBits = [];

    for (let i = 0; i < photons.length; i++) {
        const measuredBit = measurePhoton(
            photons[i],
            eveBases[i]
        );

        eveBits.push(measuredBit);
    }

    // Step 3: Eve encodes fresh photons using
    // her measured bits and her chosen bases.
    const forwardedPhotons = encodePhoton(
        eveBits,
        eveBases
    );

    // Step 4: Forward Eve's photons to Bob.
    return {
        eveBases: eveBases,
        eveBits: eveBits,
        forwardedPhotons: forwardedPhotons
    };
}
