Bug: Incorrect Rotor Double-Stepping
The Enigma machine's rotor stepping mechanism was flawed. When the middle rotor hit its notch, it correctly triggered the left rotor to step. However, the middle rotor itself failed to advance on that same keystroke, which is historically inaccurate. This "double-stepping anomaly" broke the encryption sequence, making messages impossible to decrypt correctly.

Fix: Corrected Stepping Logic
The fix was implemented in the stepRotors() method. The logic was adjusted to ensure that when the middle rotor is at its notch, it advances along with the left rotor. This restores the authentic Enigma stepping behavior, ensuring the encryption is now perfectly symmetrical and reversible.