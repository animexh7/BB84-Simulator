## Theory-to-Code Mapping

The BB84 Simulator demonstrates the main stages of Quantum Key Distribution (QKD), from random-bit generation and quantum-state preparation to basis comparison, key verification, and secure data encryption.

| Theoretical Concept | Implementation | Code File | Purpose |
|---|---|---|---|
| Random bit generation | `generateRandomBits()` | `alice.js` | Generates a random binary sequence of 0s and 1s. |
| Random basis selection | `generateRandomBases()` | `alice.js` | Assigns the Z or X basis to each bit. |
| Quantum-state encoding | `encodePhoton()` | `alice.js` | Represents each prepared photon as a bit and its corresponding basis. |
| Quantum measurement | `measurePhoton()` | `bob.js` | Returns the original bit when the measurement basis matches; otherwise, produces a random result. |
| Basis reconciliation and key sifting | `siftKey()` | `alice.js` | Retains bits at positions where Alice's and Bob's bases match. |
| Eavesdropping simulation | `interceptAndResend()` | `eve.js` | Models an interceptor measuring photons using randomly selected bases and resending replacement photons. |
| Error-rate estimation | `compareKeys()` | `bob.js` | Compares a sample of sifted bits, counts mismatches, and calculates the Quantum Bit Error Rate (QBER). |
| Key acceptance decision | Verification logic | `script.js` | Uses sample size, QBER, and remaining-key consistency to determine whether the demonstration key is accepted. |
| Photon-transmission visualization | Animation functions | `script.js`, `index.html`, `style.css` | Visualizes Alice's bit preparation, basis selection, photon encoding, and transmission towards Bob. |
| Symmetric data encryption | Web Crypto API with AES-GCM | `pharma.js` | Encrypts formulation data after an accepted BB84 demonstration key is available. |
| AES key derivation | `deriveAESKey()` | `pharma.js` | Derives a 256-bit AES key by applying SHA-256 to the accepted bit string. |
| Data decryption | Web Crypto API with AES-GCM | `pharma.js` | Decrypts the ciphertext and verifies successful recovery of the original plaintext through the application flow. |
| Input validation | Validation checks | `bob.js`, `pharma.js` | Rejects invalid bits, invalid bases, mismatched key lengths, and unsupported inputs. |

### Important Implementation Details

**1. BB84 key generation and sifting**

Alice generates random bits and preparation bases. Bob independently chooses measurement bases. The simulator retains only positions where both parties selected the same basis.

**2. Eavesdropping and QBER**

The optional Eve mode simulates an intercept-and-resend attack. Eve measures each photon in a randomly selected basis and resends a photon based on her measurement. When Eve chooses the wrong basis, this can introduce errors detectable through QBER.

\[
\mathrm{QBER}=\frac{\text{Number of mismatched sampled bits}}{\text{Total sampled bits}}\times100\%
\]

The current demonstration uses an 11% QBER threshold and requires at least 10 sampled bits. These are simulation parameters, not a complete security proof.

**3. Pharmaceutical data protection**

After the application accepts a demonstration key, `pharma.js` derives an AES key using SHA-256 and encrypts the entered formulation data using AES-GCM with a randomly generated 12-byte IV. Decryption uses the corresponding key and IV to recover the original text.

**4. Security scope**

This is an educational, software-based BB84 simulation. It does not use real quantum hardware and does not implement every requirement of a production QKD system, such as a complete security proof, privacy amplification, authenticated classical communication, and a production-grade key-management protocol. A low QBER and matching remaining keys in this demonstration should not be interpreted as proof of real-world security.


## How to Run the Project

### Prerequisites
- A computer with Visual Studio Code installed.
- A web browser such as Google Chrome.
- The Live Server extension in Visual Studio Code (recommended).

### Steps to Run

**1. Download the project**

- Open the BB84-Simulator repository on GitHub.
- Click the green **Code** button.
- Select **Download ZIP**.
- Extract the downloaded ZIP file to a folder on your computer.

**2. Open the project in Visual Studio Code**

- Open Visual Studio Code.
- Select **File → Open Folder**.
- Choose the extracted `BB84-Simulator` project folder.
- Check that files such as `index.html`, `style.css`, `script.js`, `alice.js`, `bob.js`, `eve.js`, and `pharma.js` are present.

**3. Start the website**

- Open the Extensions panel in Visual Studio Code.
- Search for **Live Server** and install it if it is not already installed.
- Open `index.html`.
- Click **Go Live** at the bottom of Visual Studio Code.
- The project should open in your default browser.

**4. Test the BB84 Simulator**

- Keep Eve OFF and generate a key.
- Check the key verification result.
- Turn Eve ON and generate another key.
- Observe the Quantum Bit Error Rate (QBER) and the verification result. The key may be rejected if the error rate crosses the configured threshold.

**5. Test Pharmaceutical Data Encryption**

- Enter sample pharmaceutical formulation data in the input field.
- Click **Encrypt** to encrypt the entered data.
- Click **Decrypt** to recover the original data.
- Check that the decrypted output matches the original input.

**6. Check the Results**

The simulator should demonstrate key generation, basis comparison, eavesdropping detection, key verification, and pharmaceutical data encryption and decryption.


## Screenshots

### 1. Successful Key Verification
<img width="1917" height="867" alt="screenshot1" src="https://github.com/user-attachments/assets/af7113ab-a893-40b1-b422-02a97150ca3c" />

### 2. Eavesdropping Detection
<img width="1917" height="870" alt="screenshot2" src="https://github.com/user-attachments/assets/810e5800-8d03-4512-aacc-82bc84b8b14c" />

### 3. Pharmaceutical Data Encryption and Decryption
<img width="1881" height="797" alt="screenshot3" src="https://github.com/user-attachments/assets/2c5c8487-f03b-4e82-bc6b-5a39f0af4425" />



