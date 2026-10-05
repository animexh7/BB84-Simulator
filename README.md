# BB84 Quantum Key Distribution Simulator

## Secure Data Transmission Prototype

A browser-based simulation of the **BB84 Quantum Key Distribution (QKD) protocol)**, presented as a prototype for secure pharmaceutical data transmission.

The project demonstrates how two communicating parties can establish a shared secret key by using randomly selected quantum bases and discarding measurements where the selected bases do not match.

> **Note:** This project is a classical software simulation of the BB84 protocol. It does not use real quantum hardware or actual quantum communication.

---

## Project Overview

The purpose of this project is to demonstrate the basic working principles of the BB84 quantum key distribution protocol through an interactive web-based simulation.

The prototype represents a secure data-transmission environment in which a quantum-generated key can be established and verified before being used for secure communication.

The system performs the following stages:

1. Generate a random binary sequence.
2. Randomly select a basis for each bit.
3. Encode the bits into simulated quantum states.
4. Generate a second random basis sequence for measurement.
5. Measure the transmitted states.
6. Compare the selected bases.
7. Discard positions where the bases do not match.
8. Generate the sifted key.
9. Compare the resulting keys.
10. Display the key agreement and verification status.

---

## What is BB84?

BB84 is a Quantum Key Distribution protocol proposed by **Charles Bennett and Gilles Brassard in 1984**.

The protocol uses two possible bases for representing and measuring quantum states:

- **Z basis**
- **X basis**

For each transmitted bit, the sender randomly chooses a basis and encodes the bit.

The receiver independently chooses a random basis to measure the received state.

After transmission, both sides publicly compare their basis choices.

They keep only the positions where the same basis was used.

These remaining bits form the **sifted key**.

---

## BB84 Simulation Flow

```text
Random Bit Generation
        ↓
Random Basis Selection
        ↓
Quantum State Encoding
        ↓
Quantum State Measurement
        ↓
Basis Reconciliation
        ↓
Key Sifting
        ↓
Key Comparison
        ↓
Key Verification