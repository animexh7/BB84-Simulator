
/* Pharmaceutical Data Encryption and Decryption */

const pharmaInput = document.getElementById("pharmaData");
const encryptButton = document.getElementById("encryptBtn");
const decryptButton = document.getElementById("decryptBtn");
const encryptedOutput = document.getElementById("encryptedData");
const decryptedOutput = document.getElementById("decryptedData");
const pharmaStatus = document.getElementById("pharmaStatus");

let encryptedRecord = null;
let activeAESKey = null;
let keyUsedForEncryption = null;
let operationInProgress = false;

/* Get a valid, accepted BB84 demonstration key */
function getVerifiedKeyBits() {
    const title = document.getElementById("verificationTitle");
    const bits = window.verifiedBB84Key;

    if (
        window.bb84KeyVerified !== true ||
        !Array.isArray(bits) ||
        bits.length < 256 ||
        !bits.every(bit => bit === 0 || bit === 1) ||
        !title ||
        title.textContent.trim() !== "Key Verified"
    ) {
        return null;
    }

    return bits.slice();
}

/* Check whether two bit arrays are identical */
function sameBits(first, second) {
    return (
        Array.isArray(first) &&
        Array.isArray(second) &&
        first.length === second.length &&
        first.every((bit, index) => bit === second[index])
    );
}

/* Enable or disable buttons according to the current state */
function updatePharmaButtons() {
    const hasVerifiedKey = getVerifiedKeyBits() !== null;

    if (encryptButton) {
        encryptButton.disabled =
            operationInProgress || !hasVerifiedKey;
    }

    if (decryptButton) {
        decryptButton.disabled =
            operationInProgress ||
            !hasVerifiedKey ||
            !encryptedRecord ||
            !activeAESKey ||
            !keyUsedForEncryption;
    }
}

/* Clear old ciphertext and decrypted data */
function clearPharmaResults(message) {
    encryptedRecord = null;
    activeAESKey = null;
    keyUsedForEncryption = null;

    if (encryptedOutput) {
        encryptedOutput.textContent = "No data encrypted.";
    }

    if (decryptedOutput) {
        decryptedOutput.textContent = "No data decrypted yet.";
    }

    if (pharmaStatus) {
        pharmaStatus.textContent = message;
    }

    updatePharmaButtons();
}

/* Called when a new BB84 simulation starts */
window.resetPharmaForNewSimulation = function () {
    clearPharmaResults(
        "Generate and verify a new BB84 key before encrypting data."
    );
};

/* Derive a 256-bit AES key from the accepted shared bit string.
   This is an educational demo, not a complete QKD key-derivation protocol. */
async function deriveAESKey(bits) {
    if (
        !Array.isArray(bits) ||
        bits.length < 256 ||
        !bits.every(bit => bit === 0 || bit === 1)
    ) {
        throw new Error(
            "The verified BB84 key does not contain enough valid bits."
        );
    }

    const bitString = bits.join("");
    const encoder = new TextEncoder();

    const digest = await window.crypto.subtle.digest(
        "SHA-256",
        encoder.encode(bitString)
    );

    return window.crypto.subtle.importKey(
        "raw",
        digest,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

/* Ensure browser cryptography is available */
function isCryptoAvailable() {
    return Boolean(
        window.crypto &&
        window.crypto.subtle &&
        typeof window.crypto.getRandomValues === "function"
    );
}

/* Encrypt pharmaceutical data */
if (pharmaInput && encryptButton && decryptButton) {
    encryptButton.addEventListener("click", async function () {
        if (operationInProgress) return;

        const bits = getVerifiedKeyBits();

        if (!bits) {
            clearPharmaResults(
                "Encryption blocked. Generate and verify a valid BB84 key first."
            );
            return;
        }

        const data = pharmaInput.value.trim();

        if (!data) {
            pharmaStatus.textContent =
                "Please enter pharmaceutical data.";
            return;
        }

        if (!isCryptoAvailable()) {
            pharmaStatus.textContent =
                "Web Crypto is unavailable. Use HTTPS or localhost.";
            return;
        }

        operationInProgress = true;
        updatePharmaButtons();
        clearPharmaResults("Preparing encryption...");
        pharmaStatus.textContent = "Encrypting data...";

        try {
            const aesKey = await deriveAESKey(bits);

            /* Check that the BB84 key has not changed */
            if (!sameBits(bits, getVerifiedKeyBits())) {
                clearPharmaResults(
                    "The BB84 key changed. Generate and verify a new key."
                );
                return;
            }

            const iv = window.crypto.getRandomValues(
                new Uint8Array(12)
            );

            const plaintextBytes = new TextEncoder().encode(data);

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                aesKey,
                plaintextBytes
            );

            /* Recheck after the asynchronous encryption operation */
            if (!sameBits(bits, getVerifiedKeyBits())) {
                clearPharmaResults(
                    "The BB84 key changed. Encryption was discarded."
                );
                return;
            }

            activeAESKey = aesKey;
            keyUsedForEncryption = bits.slice();

            encryptedRecord = {
                iv: Array.from(iv),
                ciphertext: Array.from(new Uint8Array(ciphertext))
            };

            encryptedOutput.textContent =
                JSON.stringify(encryptedRecord);

            decryptedOutput.textContent = "No data decrypted yet.";
            pharmaStatus.textContent =
                "Encryption successful using the verified BB84 demonstration key.";

        } catch (error) {
            console.error("Encryption error:", error);

            clearPharmaResults(
                "Encryption failed. Please generate a valid key and try again."
            );
        } finally {
            operationInProgress = false;
            updatePharmaButtons();
        }
    });

    /* Decrypt pharmaceutical data */
    decryptButton.addEventListener("click", async function () {
        if (operationInProgress) return;

        const bits = getVerifiedKeyBits();

        if (!bits) {
            clearPharmaResults(
                "Decryption blocked. Generate and verify a BB84 key first."
            );
            return;
        }

        if (
            !encryptedRecord ||
            !activeAESKey ||
            !keyUsedForEncryption
        ) {
            pharmaStatus.textContent =
                "Encrypt data using the current verified key first.";
            updatePharmaButtons();
            return;
        }

        if (!sameBits(bits, keyUsedForEncryption)) {
            clearPharmaResults(
                "The BB84 key changed. Encrypt the data again."
            );
            return;
        }

        operationInProgress = true;
        updatePharmaButtons();
        pharmaStatus.textContent = "Decrypting data...";

        try {
            const plaintext = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: new Uint8Array(encryptedRecord.iv)
                },
                activeAESKey,
                new Uint8Array(encryptedRecord.ciphertext)
            );

            /* Do not release plaintext if the key changed during decryption */
            if (
                !sameBits(bits, getVerifiedKeyBits()) ||
                !sameBits(bits, keyUsedForEncryption)
            ) {
                decryptedOutput.textContent = "No data decrypted yet.";
                pharmaStatus.textContent =
                    "The BB84 key changed. Please encrypt the data again.";
                return;
            }

            decryptedOutput.textContent =
                new TextDecoder().decode(plaintext);

            pharmaStatus.textContent =
                "Decryption successful. Original data recovered.";

        } catch (error) {
            console.error("Decryption error:", error);

            decryptedOutput.textContent = "Decryption failed.";
            pharmaStatus.textContent =
                "Decryption failed. The key or encrypted data may be invalid.";
        } finally {
            operationInProgress = false;
            updatePharmaButtons();
        }
    });

    /* Respond to BB84 verification changes */
    window.addEventListener("bb84-key-updated", function () {
        if (!getVerifiedKeyBits()) {
            clearPharmaResults(
                "The BB84 key is not verified. Encryption is blocked."
            );
        } else {
            updatePharmaButtons();
        }
    });

    updatePharmaButtons();

} else {
    console.error(
        "Pharmaceutical UI elements are missing. Check the IDs in index.html."
    );
}
