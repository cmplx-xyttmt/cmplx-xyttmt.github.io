---
author: "Isaac Owomugisha"
title: "Threat Models vs Attacks: Cryptopals Challenge 11"
date: "2026-10-12"
draft: false
description: "I misread a Cryptopals challenge because I never asked what the attacker is allowed to do. How an AI tutor got me past it and what an attack model is."
tags: [ "cryptography", "learning", "ai", "cryptopals" ]
---

In [my first post about Cryptopals]({{< relref "6_cryptopals_ai_tutor.md" >}}), I wrote
about working through Set 1 of the challenges with Claude as a tutor and code critic
instead of a code generator. I've kept going the same way. Since then I've done the first
three challenges of Set 2. Challenge 9 is PKCS#7 padding, and Challenge 10 is CBC mode,
built by hand on top of AES in ECB mode. Challenge 11 is the subject of this post. (My solutions and the full journal are
[on GitHub](https://github.com/cmplx-xyttmt/cryptopals).)

I won't write a post for every challenge. I'll write about the ones I found most
interesting, or that taught me something I didn't expect, or when something changes in
how I use AI as a critic.

Challenge 11 asks you to write "a function that encrypts data under an unknown key",
picking ECB or CBC at random each time, and then to detect which mode it used. Cryptopals
calls a function like this an *oracle*. You can call it and see what comes back, but you
can't see inside it.

I read "data" as data someone hands you. All of Set 1 had worked that way. Here's a
ciphertext, go break it. So my first question to Claude was whether I could assume the
plaintext was random. If it was, my Challenge 8 detector was useless, because it relies on
repeated blocks, and random plaintext doesn't repeat.

Claude pointed out that the oracle takes *your* argument. You choose what goes in.

I hadn't seen that, and I don't think I would have from the challenge text alone. I still
think the text is unclear on this point. But the bigger reason I missed it is that I don't
know security well enough to ask "what can the attacker do?" without being prompted. I was
looking for a cleverer detector when the answer was that I was allowed to choose the
input.

This post is about that question. It's a narrow post. I'm eleven challenges into
cryptography, and this is one idea I picked up from one confusing challenge. It is not a
guide to threat modelling, which is a much bigger topic in security than the part I've
met.

## Threat model and attack are two different things

I had been using these words loosely. They mean different things:

- **A threat model** describes the situation. Who holds the key? Who picks the plaintext?
  Who gets to see the ciphertext? How many times can you ask? You write it down before
  you attack anything.
- **An attack** is a procedure that gets you something you shouldn't be able to get. It
  only means something relative to a threat model. "AES is broken" says nothing. "ECB
  shows which blocks are equal, to anyone who can see the ciphertexts" is a claim you can
  check.

Cryptographers have names for the common cases. These are called **attack models**, and
the two I've met so far are *ciphertext-only* (you see ciphertext and nothing else) and
*chosen-plaintext* (you choose inputs and see what comes out). There are more, and I
haven't reached them yet.

Every attack in Set 1 was ciphertext-only. Someone hands you a ciphertext and you work on
it. (The other challenges in the set are building blocks, like hex decoding and XOR, or
give you the key outright.) Four attacks like that gave me a habit, and I applied it to
Challenge 11 without checking. Challenge 11 is the first one that changes the attack model, and it doesn't say
so.

## The same cipher, two attack models

I asked Claude to build a page where you can switch between attack models and watch what
changes. Pick an attack model at the top. The panel below encrypts the text box with
AES-128, once in ECB and once in CBC.

{{< threat-models >}}

In the two ciphertext-only models the input box is locked and filled with ordinary
English. ECB shows no repeated blocks, so there's nothing to detect, even though ECB is
just as weak as it was in Challenge 8. Switch to chosen plaintext and the box unlocks.
Press "Fill with repeated text" and the ECB side shows repeats while CBC doesn't. Nothing
about the cipher changed. What changed is what I'm allowed to do.

## Where you'd meet this

A chosen-plaintext attack needs two things. You choose part of the input, *and* you see
the ciphertext that comes out. Plenty of real systems give you one of those, and the
question is where the other one comes from. Here are four cases.

- **An encrypted session cookie.** You pick a username, and the server encrypts
  `user=<your name>&role=guest` and gives it back to you as a cookie. You get both halves
  without doing anything unusual.
- **A job on a message queue.** The email address you typed gets encrypted into a job
  payload. You chose part of the plaintext, but the ciphertext sits on a queue you can't
  read. One half isn't enough.
- **A file you upload.** You control the plaintext byte for byte. Whether you see the
  ciphertext depends on the service, for example whether its storage bucket is public.
- **An encrypted database column.** You wrote the note, and the ciphertext sits in a table
  you can't query. Then a backup leaks months later, and you have the second half.

The last one changed how I think about attack models. The two halves don't have to
arrive together.

## Solving it

Once I knew I chose the input, the solve was short. It was short partly because Claude's
answer to my first question had already told me most of what I needed. I also went through
the four questions at the end of this post, but only in my head.

Here's the detector after Claude's critique (the [full solution](https://github.com/cmplx-xyttmt/cryptopals/tree/main/python/set2/11_ecb_cbc_detection)
is on GitHub):

```python
def detect_mode(oracle: Callable[[bytes], bytes]) -> str:
    ciphertext = oracle(b"repeat" * 200)
    return "ECB" if has_repeated_block(ciphertext) else "CBC"
```

[`has_repeated_block`](https://github.com/cmplx-xyttmt/cryptopals/blob/main/python/cryptolib/__init__.py)
is the function I wrote for
[Challenge 8](https://github.com/cmplx-xyttmt/cryptopals/tree/main/python/set1/08_detect_aes_ecb), the one I'd decided was
useless when I thought the plaintext would be random. It turned out to be the whole
detection step. Feed the oracle something repetitive, and if ECB is in use, the repeated
plaintext blocks come out as repeated ciphertext blocks. CBC mixes each block with the
one before it, so they don't.

The critique turned up three things I want to keep.

**How much input do you need?** I'd sent 1200 bytes without thinking about it. Claude
asked for the minimum. The oracle adds 5 to 10 random bytes before my input, and I need
two whole 16-byte blocks made only of my bytes. So my bytes have to reach position 48.
I got 43 from a mental calculation, and Claude sharpened the reasoning. Only the prefix
matters, and the *shortest* prefix is the worst case. With 5 random bytes in front, 43
bytes of mine take me exactly to 48. There's [a test for it](https://github.com/cmplx-xyttmt/cryptopals/blob/main/python/set2/11_ecb_cbc_detection/test_challenge11.py) now, and it sends `b"A" * 43`.

The bytes in that test are all the same, and that part is needed too. `"repeat"` is 6 bytes
long, so its pattern only lines up with the 16-byte blocks every 48 bytes, and two
neighbouring blocks never match. The detector still works with 1200 bytes of it, because
blocks three apart do match. With only 43 bytes of `"repeat"`, there's no repeat to find.

**The detector shouldn't be able to see the answer.** To check my detector, I had the
oracle return the mode it picked along with the ciphertext. My `detect_mode` called the
oracle, got both, and passed the true mode back out for the check. So the function doing
the attack was holding the answer the whole time. Now `detect_mode` takes the oracle as a
function from bytes to bytes. It gets ciphertext and nothing else, which is the attack
model, written into the type signature. The test harness wraps the oracle to record the true mode on the side.

**Keys came from `random`.** My oracle generated keys with Python's `random` module,
seeded with `random.seed(1)`, so every run produced the same "random" keys. For this
challenge it made no difference, since detecting the mode doesn't depend on the key.
The code now uses `secrets`, which is what the Python docs say to use for keys. I'll
admit I don't fully understand why yet. My first reaction was that no random number
generator is perfect anyway, so what's the difference? That's a question for a later
post.

## The habit I'm trying to keep

Before I write any code for a challenge, I want to answer four questions in the
challenge's notes:

1. Who holds the key?
2. Who chooses the plaintext?
3. What do I get to see?
4. How many times can I ask?

If I can't answer all four from the text, that's what I work out first. For Challenge 11
I only did it in my head, so I'm not there yet. It's a small habit, and it's the part of
this challenge I expect to use well past Cryptopals.
