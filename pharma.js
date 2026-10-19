// Pharmaceutical Data Encryption and Decryption

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

function getVerifiedKeyBits() {
    const title = document.getElementById("verificationTitle");

    if (
        !window.bb84KeyVerified ||
        !Array.isArray(window.verifiedBB84Key) ||
        window.verifiedBB84Key.length === 0 ||
        !title ||
        title.textContent.trim() !== "Key Verified"
    ) {
        return null;
    }

    return window.verifiedBB84Key.slice();
}

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
            !activeAESKey;
    }
}

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

window.resetPharmaForNewSimulation = function () {
    clearPharmaResults(
        "Generate and verify a new BB84 key before encrypting data."
    );
};

async function deriveAESKey(bits) {
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

function sameBits(first, second) {
    return Array.isArray(first) &&
        Array.isArray(second) &&
        first.length === second.length &&
        first.every((bit, index) => bit === second[index]);
}

if (pharmaInput && encryptButton && decryptButton) {
    encryptButton.addEventListener("click", async function () {
        if (operationInProgress) return;

        const bits = getVerifiedKeyBits();

        if (!bits) {
            clearPharmaResults(
                "Please generate and verify a matching BB84 key first."
            );
            return;
        }

        const data = pharmaInput.value.trim();

        if (!data) {
            pharmaStatus.textContent =
                "Please enter pharmaceutical data.";
            return;
        }

        if (!window.crypto || !window.crypto.subtle) {
            pharmaStatus.textContent =
                "Web Crypto is unavailable. Run the site on HTTPS or localhost.";
            return;
        }

        clearPharmaResults("Preparing encryption...");
        operationInProgress = true;
        updatePharmaButtons();
        pharmaStatus.textContent = "Encrypting data...";

        try {
            const aesKey = await deriveAESKey(bits);
            const iv = window.crypto.getRandomValues(
                new Uint8Array(12)
            );

            const plaintextBytes = new TextEncoder().encode(data);

            const ciphertext = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                aesKey,
                plaintextBytes
            );

            if (!sameBits(bits, getVerifiedKeyBits())) {
                clearPharmaResults(
                    "The BB84 key changed. Generate and verify a new key."
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
                "Encryption successful using the verified BB84 key.";

        } catch (error) {
            console.error("Encryption error:", error);
            clearPharmaResults("Encryption failed. Please try again.");
        } finally {
            operationInProgress = false;
            updatePharmaButtons();
        }
    });

    decryptButton.addEventListener("click", async function () {
        if (operationInProgress) return;

        const bits = getVerifiedKeyBits();

        if (!bits) {
            decryptedOutput.textContent = "No data decrypted yet.";
            pharmaStatus.textContent =
                "Please generate and verify a matching BB84 key first.";
            updatePharmaButtons();
            return;
        }

        if (
            !encryptedRecord ||
            !activeAESKey ||
            !keyUsedForEncryption
        ) {
            pharmaStatus.textContent =
                "Please encrypt data using the current verified key first.";
            updatePharmaButtons();
            return;
        }

        if (!sameBits(bits, keyUsedForEncryption)) {
            clearPharmaResults(
                "The BB84 key changed. Encrypt your data again."
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
                "Decryption failed. Please verify the key and encrypted data.";
        } finally {
            operationInProgress = false;
            updatePharmaButtons();
        }
    });

    window.addEventListener("bb84-key-updated", updatePharmaButtons);
    updatePharmaButtons();
}
