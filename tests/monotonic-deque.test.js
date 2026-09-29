// Checks the stepper logic in layouts/shortcodes/monotonic-deque.html against a
// brute-force window max. Run: node tests/monotonic-deque.test.js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const src = fs.readFileSync(path.join(__dirname, "../layouts/shortcodes/monotonic-deque.html"), "utf8");
const m = src.match(/\/\* LOGIC:BEGIN[^*]*\*\/([\s\S]*?)\/\* LOGIC:END \*\//);
assert(m, "logic block markers not found");
const { buildTrace, parseInput } = new Function(m[1] + "\nreturn { buildTrace, parseInput };")();

function brute(nums, k) {
  const out = [];
  for (let i = k - 1; i < nums.length; i++) out.push(Math.max(...nums.slice(i - k + 1, i + 1)));
  return out;
}

function check(nums, k) {
  const t = buildTrace(nums, k), n = nums.length, want = brute(nums, k);
  assert.deepStrictEqual(t.out, want, "deque output");
  assert.deepStrictEqual(t.heapOut, want, "heap output");
  const pushes = new Array(n).fill(0), pops = new Array(n).fill(0);
  let outs = 0;
  for (const s of t.steps) {
    if (s.phase === "push") pushes[s.i]++;
    if (s.phase === "pop" || s.phase === "expire") pops[s.ghost.idx]++;
    if (s.phase === "expire") assert.strictEqual(s.ghost.idx, s.i - k, "only index i-k expires");
    assert(s.deque.length <= k, "deque bounded by k");
    for (let a = 0; a < s.deque.length; a++) {
      if (s.phase !== "pop" && s.phase !== "expire") assert(s.deque[a] >= s.lo && s.deque[a] <= s.i, "deque inside window");
      if (a > 0) assert(nums[s.deque[a - 1]] >= nums[s.deque[a]], "non-increasing front to back");
    }
    if (s.phase === "output") {
      assert.strictEqual(nums[s.deque[0]], want[outs], "front is the window max");
      outs++;
    }
  }
  assert.strictEqual(outs, want.length);
  assert(pushes.every((c) => c === 1), "each index pushed exactly once");
  assert(pops.every((c) => c <= 1), "each index popped at most once");
  const final = t.steps[t.steps.length - 1];
  assert.strictEqual(final.pushed.filter(Boolean).length, n);
  const totalOps = pushes.reduce((a, b) => a + b) + pops.reduce((a, b) => a + b);
  assert(totalOps <= 2 * n, "total ops at most 2n");
  for (const s of t.steps) assert(!/—/.test(s.text) && !/[“”’]/.test(s.text), "plain punctuation");
}

let seed = 12345;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const randInt = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

let cases = 0, withTies = 0;
for (let t = 0; t < 600; t++) {
  const n = randInt(1, 16);
  const range = t % 3 === 0 ? 2 : t % 3 === 1 ? 5 : 99; // small ranges force ties
  const nums = Array.from({ length: n }, () => randInt(-range, range));
  const ks = [1, n, randInt(1, n)];
  for (const k of ks) { check(nums, k); cases++; }
  if (new Set(nums).size < n) withTies++;
}
// Presets and edge cases
check([1, 3, -1, -3, 5, 3, 6, 7], 3);
check([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
check([10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 4);
check([4, 4, 4, 4, 4, 4, 4, 4, 4], 3);
check([1, 4, 7, 2, 5, 8, 3, 6, 9, 4], 4);
check([7], 1);
cases += 6;

// Preset shape claims from the captions
const inc = buildTrace([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
assert(inc.steps.every((s) => s.deque.length <= 1), "increasing: deque stays at size 1");
assert.strictEqual(inc.sizes[9].heap, 10, "increasing: heap keeps all 10 entries");
const dec = buildTrace([10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 4);
assert(dec.steps.filter((s) => s.phase === "output").every((s) => s.deque.length === 4), "decreasing: deque holds the whole window");
const eq = buildTrace([4, 4, 4, 4, 4, 4, 4, 4, 4], 3);
assert(!eq.steps.some((s) => s.phase === "pop"), "all equal: ties are never popped from the back");

// Input validation
assert.deepStrictEqual(parseInput("1, 3 -1,-3  5", "2"), { nums: [1, 3, -1, -3, 5], k: 2 });
assert(parseInput("", "1").error);
assert(parseInput("1 2 x", "1").error);
assert(parseInput("1.5 2", "1").error);
assert(parseInput("1 2 3", "4").error);
assert(parseInput("1 2 3", "0").error);
assert(parseInput("1 2 3", "two").error);
assert(parseInput("1 2 300", "1").error);
assert(parseInput(Array(17).fill(1).join(" "), "1").error);

console.log("OK: " + cases + " (array, k) cases, " + withTies + " random arrays with ties, k=1 and k=n in every random case");
