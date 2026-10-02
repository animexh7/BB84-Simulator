// Day 2 - Alice's BB84 functions

const NUM_BITS = 8;

// Generate random bits: 0 or 1
function generateRandomBits(numberOfBits) {
    const bits = [];

    for (let i = 0; i < numberOfBits; i++) {
        bits.push(Math.floor(Math.random() * 2));
    }

    return bits;
}

// Generate random bases: Z or X
function generateRandomBases(numberOfBits) {
    const bases = [];

    for (let i = 0; i < numberOfBits; i++) {
        bases.push(Math.random() < 0.5 ? "Z" : "X");
    }

    return bases;
}

// Encode each bit using Alice's chosen basis
function encodePhoton(bits, bases) {
    const photons = [];

    for (let i = 0; i < bits.length; i++) {
        photons.push({
            bit: bits[i],
            basis: bases[i]
        });
    }

    return photons;
}


// Test Alice's functions
const aliceBits = generateRandomBits(NUM_BITS);
const aliceBases = generateRandomBases(NUM_BITS);
const encodedPhotons = encodePhoton(aliceBits, aliceBases);

console.log("Alice's bits:", aliceBits);
console.log("Alice's bases:", aliceBases);
console.log("Encoded photons:", encodedPhotons);

// Display Alice's data on the webpage
document.getElementById("bits").textContent = aliceBits.join(" ");
document.getElementById("bases").textContent = aliceBases.join(" ");

document.getElementById("photons").textContent =
    encodedPhotons
        .map(photon => `(${photon.bit}, ${photon.basis})`)
        .join("   ");