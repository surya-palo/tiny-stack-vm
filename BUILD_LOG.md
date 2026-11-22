# Build log — tiny stack VM

## Design
`main.ts` (Node 22, TS, no deps): one `run(program, input)` interpreter + a driver answering every `/input/<id>/` into `/output/<id>/stdout.bin` + `exit.txt`. Typed-array state (`Int32Array` stacks/memory, `Uint8Array` output); stores wrap automatically. Exact ISA.md semantics: `Math.imul` for MUL, `Math.trunc` for DIV, `>>> 0` for DIVU/MODU/LTU, PUSH8 sign-extends, EXIT masks to a byte. Traps 2-11 via throw/catch in ISA order; a trapping PRINT/PUTC writes nothing, earlier output kept.

## Tests
- Kit practice set, kit scorer: **1,000,000/1,000,000** (40/40), 0.26s.
- 64 hand-assembled adversarial tests vs the reference VM (byte-exact stdout + exit): **64/64**. Every trap, exact step/output boundaries, MUL overflow, INT_MIN/-1, unsigned ops, shifts >= 32, nested calls, IN past EOF.