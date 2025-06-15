---
author: "Isaac Owomugisha" 
title: "Security 2 (ABC 407 C)"
description: "My solution approach to a cool atcoder problem about a unique pass-code device with 2 distinct operations. The solution is complemented by an interactive visualization that brings the device and its mechanics to life."
date: 2025-06-15
draft: false
tags: ["algorithms", "visualization", "atcoder"]
---

Following up on my last post, we're diving into another challenge from Atcoder's Beginner Contest 407: Problem C, titled "Security 2". 
This problem was more approachable than Problem D, and I've even included an interactive visualization to help you explore its mechanics.

We'll discuss the problem, play with the mechanics and I'll describe my solution approach.

## [The Problem](https://atcoder.jp/contests/abc407/tasks/abc407_c)
You can find the [full problem description here](https://atcoder.jp/contests/abc407/tasks/abc407_c). But here's the gist of it.

There is a special pass-code input device. The device consists of a screen displaying one string, and two buttons.

Let `T` be the string shown on the screen. Initially, `T` is the empty string. Pressing a button changes `T` as follows:

- Pressing **button A** appends `0` to the end of `T`.
- Pressing **button B** increments every digit in `T` by one (modulo 10): digits `0` through `8` become the next larger digit, and `9` wraps around to `0`.

For example, if `T` is `1984` and button A is pressed, `T` becomes `19840`; if button B is then pressed, `T` becomes `20951`.

You are given a target string `S`. Starting from an empty string, press the buttons zero or more times until tt coincides with `S`. Find the minimum number of button presses required.

## Interactive Visualization

Before diving into the solution, I highly recommend interacting with the device yourself to get a feel for its behavior. You can:
1. Press Button A to append a 0
2. Press Button B to increment all digits (mod 10)
3. Try to see if you can reach the target string in the minimum number of steps. 

{{< atcoder-device >}}

## Solution
My initial intuition for this problem leaned towards a greedy strategy: for each target digit, first press `A` to create a new slot, then press `B` a number of times equal to that digit's value, and simply repeat for the entire string.
However, as you might have noticed from the interactive visualization, the critical challenge lies in how each press of button B affects all existing digits in the string. 
This interdependency means a simple greedy approach won't work. 

Instead, we need a strategy that ensures previous digits align correctly by the time we finalize the current one, especially when forming the last digit of our target string.

Let's take 2 examples:

1. Consider the example target string `"32"`:
   - We can press `A` to get `"0"`. Then `B` to get `"1"`. That's 2 operations. We can stop for now, because we know 2 button presses are coming up for the last digit.
   - Press `A` again to get `"10"`. Then press `B` 2 times to get the target `"32"`. That's 3 operations.
   - So, there are 5 total operations.
2. Consider the target string `"12"`. This is a little more complicated because you before adding the second digit, you have to unintuitively go up to `"9"` for the first digit (remember, the digits wrap around.)
   - Press `A`, then `B` 9 times to get to `"9"`. That's 10 operations.
   - Press `A` to get `"90"`, then `B` 2 times to get to `"12"`. That's 3 operations.
   - So, there are a total of 13 operations.

This reveals the core insight: to correctly determine the presses for a given digit, we must account for all subsequent `B` presses that will affect it. 
Since the total number of `B` presses affects previous numbers, we can start from the last digit, and keep track of how many `B` presses we have performed so far.
Keeping track of these presses is a bit tricky though, and importantly, must be tracked modulo 10. Here's an outline of my solution:
- Keep track of the total number of `B` presses (which I call `total_b_presses` in the code).
- Start from the last digit.
- For each digit `d`, calculate which number will need to be in that position, such that when the `B` button is pressed `total_b_presses` times, the result is `d`. Let's call this number `local_presses`, because it will be the number of times `B` is pressed. 
For the last digit, `local_presses` is simply equal to `d`. For other digits, we can can calculate `local_presses = (10 + d - total_b_presses) % 10`. We add 10 to avoid negative numbers when calculating the modulo. Note that `total_b_presses` will also be calculated mod 10.

Below is the python code, which is surprisingly short. You can find the full solution (with the input and output functions) [on Github](https://github.com/cmplx-xyttmt/competitive-programming/blob/main/python/src/atcoder/abc407/C.py).
```python
S = read_line()
total_b_presses = 0
moves = 0
for digit in reversed(S):
    local_presses = (10 + int(digit) - total_b_presses) % 10
    moves += 1 + local_presses
    total_b_presses = (total_b_presses + local_presses) % 10

print(moves)
```

You can also checkout [the official editorial on AtCoder](https://atcoder.jp/contests/abc407/editorial/13114).
