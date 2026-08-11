---
author: "Isaac Owomugisha"
title: "Learning Cryptography with an AI Guide: Cryptopals Set 1"
date: "2026-08-10"
draft: false
description: "My experience working through the first set of Cryptopals to learn cryptography, with Claude Code as an interactive learning guide — critiquing my code and helping me build visualizations for the ideas that are easier seen than explained."
tags: [ "cryptography", "learning", "ai", "cryptopals", "python" ]
math: true
---

Over the past few months, I've been building and shipping features using AI agents and noticed that my ability to
"hand-write" code has dramatically declined. While using agents to code is quite productive, it risks making you lazy
and complacent. One of my favorite parts of programming and building software in general is solving the little or
big puzzles that come up and going through the process of thinking through a problem and implementing the solution in
some detail. However, with AI coding agents like Claude Code, the answer is usually just a prompt away: "why isn't this
working", "change this to that", and most of the time, I found myself not even checking the code or trying to understand
how it worked, and what the fix was.

I enjoy the process of learning new things, and solving problems; so this state of affairs led me to see if I could find
more
fulfillment from using agents as learning guides. Not just for production codebases, but for new skills or subjects or
concepts I want to learn. The idea was to use the AI to "teach me, and tell me when I'm wrong" rather than "write this
for me."

Cryptography is a subject I always told myself I would like to learn, but never had the time to do so. So, I decided
that
this would be a great testing ground. I also like learning through small self-contained "challenges" and the
[Cryptopals challenges](https://cryptopals.com/) turned out to be the perfect testing ground for this learning
experiment.

So, this post is about this experiment and is as much about *how I learn with AI* (or at least how I'm iterating on that
process) as it is about cryptography.

## The rules of the experiment

Before writing a line of code, I set up the repo with a few deliberate constraints — rules
for how the AI was allowed to help:

- **Tutor, not solver.** Claude wasn't allowed to hand me working solutions to challenges I
  hadn't attempted. It could orient me, explain the concept, ask a leading question, or drop
  a graded hint — but the actual "aha" had to be mine. Once I had an attempt, *then* it
  switched into rigorous-reviewer mode: I would ask it to critique my code, and write extra tests to validate my
  solution.
- **Two versions of each challenge:** My initial idea was to have 2 versions: one using the language's standard library
  or third-party libraries (`base64`, `hashlib`, a real AES library), and one where I re-implemented the interesting primitive
  by hand (e.g. my own Base64 encoder). In practice I didn't always do both: some primitives (like single-byte XOR) are already "from scratch" with nothing left to reimplement, and others (like AES) you *shouldn't* hand-roll, so the from-scratch version only appeared when it actually taught me something.
- **A running journal.** I noted down most of the process of solving the challenges (with help from Claude, based on
  the prompts I was giving it): wrong turns, bugs, critiques, and suggested improvements got written down; not just the
  polished final answer. (This post is built from that journal.)
- **Interactive artifacts.** When something was easier *seen than
  said*, we'd build a small self-contained web page to play with it.

What follows are the highlights of the experiment. You can find the repo
on [GitHub](https://github.com/cmplx-xyttmt/cryptopals) with the full journal.

## Bytes vs Hex vs Strings

Challenge 1 is just "convert hex to base64," and I solved it in about four lines. But my
function returned something that printed as `b'SSdt...'`, and I didn't know what the `b`
meant (I'd seen it before in Python programs I've worked with in the past, but never paid much attention to it, since
I mostly worked with strings).

I had a wrong mental model I didn't know I had: I thought raw bytes *were* hex. The critique
unpicked it in one exchange — **bytes are numbers** (0–255); hex is just one of many ways to
*write* those numbers down. `bytes.fromhex("49")` doesn't "store hex," it produces the number
`0x49` = `73`. Text (`str`) and bytes are genuinely different worlds, and crypto lives
entirely in the bytes world because you can do *math* — like XOR — on numbers, not on letters.

I asked Claude to build an artifact to clarify the difference between these: type any text and watch it cross the border
into bytes, hex, and base64, with the per-character encoding laid out. Emojis are where it gets fun — one emoji is one
character but four bytes.

{{< bytes-vs-strings >}}

## Three versions of one tiny function

The from-scratch Base64 encoder is where "do it by hand" got interesting. Base64 doesn't line
up with bytes: you take **three 8-bit bytes (24 bits)** and re-slice them into **four 6-bit
groups**, then turn each 6-bit number (0–63) into a character. My first version worked, but it
was ~80 lines across two helpers. One of them existed just to build a dictionary mapping every
6-bit value to its character:

```python
def build_index():
    uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    lowercase = "abcdefghijklmnopqrstuvwxyz"
    numbers = "0123456789"

    b64_char_index = dict()
    for value in range(26):
        b64_char_index[value] = uppercase[value]
    for value in range(26, 52):
        b64_char_index[value] = lowercase[value - 26]
    for value in range(52, 62):
        b64_char_index[value] = numbers[value - 52]
    b64_char_index[62] = "+"
    b64_char_index[63] = "/"
    return b64_char_index
```

...and a second helper did the actual bit-slicing into a list of 6-bit integers before mapping
them through that dictionary.

I ran it past **Gemini**, which nudged me toward something much tighter, and then **Claude**
explained *why* it was tighter. The insight is lovely: **a string is already a map from index
to character.** `"ABC…+/"[i]` does exactly what my `build_index()` dictionary did, because the
indices `0…63` *are* the keys. So the whole helper collapses into a single line —

```python
ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
```

— and the encoder becomes one function that maps each 6-bit group straight through `ALPHABET`
as it goes:

```python
def convert_hex_to_base64(hex_string: str) -> str:
    raw_bytes = bytes.fromhex(hex_string)
    b64_chars = []
    length = len(raw_bytes)

    # Full 3-byte groups
    for i in range(0, length - 2, 3):
        chunk = (raw_bytes[i] << 16) | (raw_bytes[i + 1] << 8) | raw_bytes[i + 2]
        b64_chars.extend([
            ALPHABET[(chunk >> 18) & 63], ALPHABET[(chunk >> 12) & 63],
            ALPHABET[(chunk >> 6) & 63], ALPHABET[chunk & 63],
        ])

    # Leftover 1 or 2 bytes: pad with zero bits on the right, then add '='
    remainder = length % 3
    if remainder == 2:
        j = length - 2
        chunk = ((raw_bytes[j] << 8) | raw_bytes[j + 1]) << 2   # 16 -> 18 bits
        b64_chars.extend([
            ALPHABET[(chunk >> 12) & 63], ALPHABET[(chunk >> 6) & 63],
            ALPHABET[chunk & 63], "=",
        ])
    elif remainder == 1:
        chunk = raw_bytes[length - 1] << 4                       # 8 -> 12 bits
        b64_chars.extend([ALPHABET[(chunk >> 6) & 63], ALPHABET[chunk & 63], "=="])
    return "".join(b64_chars)
```

Claude also pointed out that the *original* re-sliced the
input on every loop (`raw_bytes = raw_bytes[3:]`), quietly copying the rest of the buffer each
time and turning an $O(n)$ job into $O(n^2)$. Indexing into the buffer instead — the
`range(0, length - 2, 3)` above — keeps it linear.

Then, for fun, Claude showed a **third** approach that makes the awkward "leftover 1 or 2
bytes" branches *disappear*: pad the input up to a multiple of 3 with zero bytes, run one clean
loop, then replace the trailing characters with `=` — one for each byte you padded:

```python
def convert_hex_to_base64(hex_string: str) -> str:
    raw = bytes.fromhex(hex_string)
    pad = (-len(raw)) % 3                  # 0, 1, or 2 zero-bytes to add
    raw = raw + b"\x00" * pad
    out = []
    for i in range(0, len(raw), 3):
        chunk = (raw[i] << 16) | (raw[i + 1] << 8) | raw[i + 2]
        for shift in (18, 12, 6, 0):
            out.append(ALPHABET[(chunk >> shift) & 63])
    if pad:                                # the padding bytes become '=' chars
        out[-pad:] = "=" * pad
    return "".join(out)
```

For each version, I understood the problem a little better: my version made the mechanics painfully explicit, Gemini's 
showed me the string-is-a-lookup-table trick, and Claude's showed a "normalise the input so the special case vanishes" 
pattern. A very different experience from "the agent wrote it, and it passed."

## The scorer that worked for the wrong reason

Challenge 3 is where things get interesting: decrypt a message that's been XOR'd with a single
secret byte — no key — by brute-forcing all 256 possibilities and *scoring* each candidate for
how English-like it looks.

My scorer worked; it found the answer ("Cooking MC's like a pound of bacon"). But it was built
on a shaky idea: I compared each character's raw *count* to its *rank* in an English-frequency
table — two quantities that aren't even the same kind of thing.

```python
position_diff = abs(counts[char] - positions[char])   # a count vs a rank (!)
score += len(character_order) - position_diff
```

Rather than just tell me it was wrong, Claude had me write a **test that failed for the right
reason** — one encoding a property the scorer *should* have: repeating a text shouldn't change
how English-like it is.

```python
def test_invariant_to_repetition():
    text = "the quick brown fox jumps over the lazy dog"
    assert english_score(text) == pytest.approx(english_score(text * 3))
```

On my count-based scorer that number jumped from **383 to 429** when I doubled the text — red,
and for exactly the right reason. The fix was to score by *frequency* (using English
letter-frequency stats), length-normalised: the score stops depending on length, and the test
goes green. (The full scorer and its tests live in
[`cryptolib`](https://github.com/cmplx-xyttmt/cryptopals/tree/main/python/cryptolib).)

## Breaking Vigenère by seeing it

Challenge 6 asks you to break repeating-key XOR when you know *nothing*, not even the key's length. It's
the hardest in the set, and it's where the "build an artifact" idea worked best.

The solution hinges on the fact that you can *guess the key length* by measuring the
average [Hamming distance](https://en.wikipedia.org/wiki/Hamming_distance) (number of differing bits) between chunks of the ciphertext, and the true key length 
produces the smallest normalised distance. I could implement it, but I didn't fully understand why bit-similarity 
could reveal a key length.

Rather than just explain it, I asked Claude to build me a visualization: encrypt some text with a key of my
choosing, sweep the candidate key lengths, and *watch* the Hamming distance dip at the true length.
Then a couple of small experiments it suggested — comparing English-XOR-English against
random-XOR-random — enabled me to derive the reason **myself**:

```
c1 ⊕ c2 = (p1 ⊕ k) ⊕ (p2 ⊕ k)
        = p1 ⊕ p2 ⊕ (k ⊕ k)
        = p1 ⊕ p2            (because k ⊕ k = 0)
```

At the right key length, two ciphertext bytes in the same position share the same key byte,
so XOR-ing them *cancels the key* and leaves you comparing two English letters — which, since
English letters cluster in a narrow range, differ in very few bits. At the wrong length, the
key doesn't cancel and you get noise. This example reveals why I like this approach: not being
*told* the answer, but being handed the right thing to look at, think about, and figure out on my own.

The artifact grew into a full breaker — set a key length, watch the ciphertext transpose into
columns, solve each column, and see the plaintext appear. Play with it:

{{< vigenere-keysize >}}

## Where it broke down (and the guardrail we added)

It wasn't all smooth. During Challenge 5, Claude got enthusiastic and, while explaining a
design choice, gave away most of the *next* challenge's attack — including a realization I'd
specifically wanted to reach myself. That's the failure mode of an eager tutor: too helpful.

I flagged it, and we turned the correction into a durable rule (written into the project's
config and the AI's memory): **never mention or set up future challenges; let me discover the
insights.** 

So, when using AI to *learn* rather than to *finish* — you have to actively defend the space where the struggle, and 
therefore the learning, happens. Worth knowing the tool will over-help unless you tell it not to.

## Knowing what you *don't* need to learn

Challenges 7 and 8 introduce AES, and my first instinct was to go study the cipher's internals
— S-boxes, key schedules, the works. The most useful early advice I got was essentially
"don't." For these challenges AES is a black box you hand to a library; the actual concept is
**ECB mode** — the dead-simple rule of "encrypt each 16-byte block independently." Calibrating
*how deep to go* is its own skill, and a good tutor saves you from drowning in a rabbit hole
that isn't the point.

That black-box view was enough to solve both challenges. Challenge 8 — detect which ciphertext
used ECB — has a lovely twist: you can do it **without ever decrypting anything**. Because ECB
turns identical plaintext blocks into identical ciphertext blocks, you just look for a repeated
16-byte block. (And a repeat essentially can't happen by chance: a block has $2^{128}$ possible
values, so you'd need on the order of $2^{64}$ blocks before a random collision.)

The classic way to *see* why this matters is the "ECB penguin": encrypt an image in ECB and
its outline survives, because uniform regions are identical blocks that encrypt identically. A
proper mode turns it to static. So of course we built one:

{{< ecb-penguin >}}

## What I learned about learning with AI

Set 1 is eight challenges; the cryptography I picked up (XOR, frequency analysis, breaking
Vigenère, ECB's fatal determinism) is genuinely satisfying. I'll continue with the other sets using this same approach.
A few take-aways from the experiment so far:
- **Critique beats generation, for learning.** The value wasn't in code being written for me;
  it was in a rigorous second pair of eyes on code *I* wrote — catching "right answer, wrong
  reason," hardcoded examples, and subtle bugs, and explaining the *why* each time.
- **A second model is a cheap sanity check.** Running the same solution past both Claude and
  Gemini surfaced different things: Gemini nudged my Base64 encoder tighter, and Claude then
  explained *why* it was tighter and caught a complexity bug neither of us had flagged. Two
  critics disagree in useful ways.
- **Interactive artifacts turn "trust me" into "see for yourself."** Three times, an idea I
  couldn't picture became obvious the moment I could play with it. Being able to spin those up
  on demand is, honestly, a new superpower for self-teaching.
- **You have to defend the struggle.** The AI's default is to be maximally helpful, which for
  *learning* is a bug. Explicit rules — no spoilers, critique-only-after-attempt — are what
  kept it a tutor instead of a ghostwriter.
- **A journal makes it real.** Writing down the wrong turns, in the moment, is what let me turn
  a pile of solved challenges into something I understand — and into this post.


I came out of Set 1 actually understanding XOR, frequency analysis, and why ECB leaks, and I had fun getting there. Set 2 is next; the [code and the full journal are on GitHub](https://github.com/cmplx-xyttmt/cryptopals), wrong turns and all.
