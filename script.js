// BB84 Simulator - Main Script

console.log("BB84 Simulator loaded!");

// Bob generates his measurement bases
const bobBases = generateRandomBases(aliceBits.length);

// Bob measures each photon
const bobKey = [];

for (let i = 0; i < encodedPhotons.length; i++) {
    const measuredBit = measurePhoton(
        encodedPhotons[i],
        bobBases[i]
    );

    bobKey.push(measuredBit);
}

// Create Alice's sifted key
const siftedAliceKey = siftKey(
    aliceBits,
    aliceBases,
    bobBases
);

// Create Bob's sifted key
const siftedBobKey = [];

for (let i = 0; i < bobKey.length; i++) {
    if (aliceBases[i] === bobBases[i]) {
        siftedBobKey.push(bobKey[i]);
    }
}

// Display the complete BB84 process
console.log("Bob's bases:", bobBases);
console.log("Bob's measured key:", bobKey);

console.log("Sifted Alice key:", siftedAliceKey);
console.log("Sifted Bob key:", siftedBobKey);

// Compare the sifted keys
compareKeys(siftedAliceKey, siftedBobKey);

