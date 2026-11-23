# Build log — tiny stack VM (golfed)
`main.ts`: exact ISA v1 interpreter, table-driven (opcode map + imm/pops/pushes digit strings), Node 22, no deps. Driver answers every /input/<id>/ into /output/<id>/.
Tests: kit practice 1,000,000/1,000,000 (40/40, grade-local); 88 targeted edge cases + 5,000 fuzz programs, all byte-exact vs reference vm.mjs (stdout + exit).
