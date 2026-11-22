import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Tiny stack VM, ISA v1: 32-bit wrapping ints, 256-value stack, 64-deep calls,
// 256 memory words, 1M-step and 64KiB-output limits, traps 2-11.
function run(p: Uint8Array, inp: Uint8Array): [number, Uint8Array] {
  const s = new Int32Array(256), c = new Int32Array(64), m = new Int32Array(256);
  const o = new Uint8Array(65536);
  let sp = 0, cp = 0, pc = 0, ip = 0, ol = 0, n = 0;
  try {
    for (;;) {
      if (n >= 1e6) throw 10;
      if (pc < 0 || pc >= p.length) throw 9;
      const op = p[pc];
      n++;
      switch (op) {
        case 0x00: return [0, o.subarray(0, ol)];
        case 0x01:
          if (pc + 2 > p.length) throw 9;
          if (sp >= 256) throw 3;
          s[sp++] = (p[pc + 1] << 24) >> 24; pc += 2; break;
        case 0x02:
          if (pc + 5 > p.length) throw 9;
          if (sp >= 256) throw 3;
          s[sp++] = p[pc + 1] | (p[pc + 2] << 8) | (p[pc + 3] << 16) | (p[pc + 4] << 24); pc += 5; break;
        case 0x03: if (sp < 1) throw 2; sp--; pc++; break;
        case 0x04:
          if (sp < 1) throw 2; if (sp >= 256) throw 3;
          s[sp] = s[sp - 1]; sp++; pc++; break;
        case 0x05: {
          if (sp < 2) throw 2;
          const t = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = t; pc++; break;
        }
        case 0x06:
          if (sp < 2) throw 2; if (sp >= 256) throw 3;
          s[sp] = s[sp - 2]; sp++; pc++; break;
        case 0x07: {
          if (sp < 3) throw 2;
          const t = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = t; pc++; break;
        }
        case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: {
          if (sp < 2) throw 2;
          const b = s[--sp], a = s[--sp];
          let r: number;
          if (op === 0x10) r = a + b; else if (op === 0x11) r = a - b; else if (op === 0x12) r = Math.imul(a, b);
          else if (op === 0x13) { if (!b) throw 4; r = Math.trunc(a / b); }
          else if (op === 0x14) { if (!b) throw 4; r = a % b; }
          else if (op === 0x15) { if (!b) throw 4; r = Math.trunc((a >>> 0) / (b >>> 0)); }
          else if (op === 0x16) { if (!b) throw 4; r = (a >>> 0) % (b >>> 0); }
          else if (op === 0x18) r = a & b; else if (op === 0x19) r = a | b; else if (op === 0x1a) r = a ^ b;
          else if (op === 0x1c) r = a << b; else if (op === 0x1d) r = a >> b; else if (op === 0x1e) r = a >>> b;
          else if (op === 0x20) r = a === b ? 1 : 0; else if (op === 0x21) r = a < b ? 1 : 0;
          else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
          s[sp++] = r; pc++; break;
        }
        case 0x17: if (sp < 1) throw 2; s[sp - 1] = -s[sp - 1]; pc++; break;
        case 0x1b: if (sp < 1) throw 2; s[sp - 1] = ~s[sp - 1]; pc++; break;
        case 0x30:
          if (pc + 3 > p.length) throw 9;
          pc += 3 + (((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16); break;
        case 0x31: case 0x32: {
          if (pc + 3 > p.length) throw 9;
          if (sp < 1) throw 2;
          const off = ((p[pc + 1] | (p[pc + 2] << 8)) << 16) >> 16;
          const v = s[--sp]; pc += 3;
          if ((op === 0x31) === (v === 0)) pc += off;
          break;
        }
        case 0x33:
          if (pc + 3 > p.length) throw 9;
          if (cp >= 64) throw 7;
          c[cp++] = pc + 3; pc = p[pc + 1] | (p[pc + 2] << 8); break;
        case 0x34: if (cp < 1) throw 8; pc = c[--cp]; break;
        case 0x40: {
          if (sp < 1) throw 2;
          const a = s[sp - 1];
          if (a < 0 || a > 255) throw 6;
          s[sp - 1] = m[a]; pc++; break;
        }
        case 0x41: {
          if (sp < 2) throw 2;
          const a = s[--sp], v = s[--sp];
          if (a < 0 || a > 255) throw 6;
          m[a] = v; pc++; break;
        }
        case 0x50: {
          if (sp < 1) throw 2;
          const t = String(s[--sp]);
          if (ol + t.length > 65536) throw 11;
          for (let i = 0; i < t.length; i++) o[ol++] = t.charCodeAt(i);
          pc++; break;
        }
        case 0x51:
          if (sp < 1) throw 2;
          if (ol >= 65536) throw 11;
          o[ol++] = s[--sp] & 255; pc++; break;
        case 0x52:
          if (sp >= 256) throw 3;
          s[sp++] = ip < inp.length ? inp[ip++] : -1; pc++; break;
        case 0x53: if (sp < 1) throw 2; return [s[--sp] & 255, o.subarray(0, ol)];
        default: throw 5;
      }
    }
  } catch (e) {
    if (typeof e !== 'number') throw e;
    return [e, o.subarray(0, ol)];
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const [code, out] = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin')));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), out);
  writeFileSync(join(O, id, 'exit.txt'), code + '\n');
}
