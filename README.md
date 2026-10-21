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