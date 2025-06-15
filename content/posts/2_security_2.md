---
author: "Isaac Owomugisha" 
title: "Security 2 (ABC 407 C)"
description: "My solution approach to a cool atcoder problem about a unique pass-code device with 2 distinct operations. The solution is complemented by an interactive visualization that brings the device and its mechanics to life."
date: 2025-06-14
draft: false
tags: ["algorithms", "visualization", "atcoder"]
---

In this article, we look at another problem from Atcoder's Beginner Contest 407: Problem C, titled "Security 2". 
This problem was easier than problem D (discussed in my [previous post](/posts/1_domino_covering)), and I've also included an interactive visualization for the device in the problem.

We'll discuss the problem, play with the mechanics and I'll describe my solution approach.

## [The Problem](https://atcoder.jp/contests/abc407/tasks/abc407_c)
You can find the [full problem description here](https://atcoder.jp/contests/abc407/tasks/abc407_c). But here's the gist of it.

here is a special pass-code input device. The device consists of a screen displaying one string, and two buttons.

Let tt be the string shown on the screen. Initially, tt is the empty string. Pressing a button changes tt as follows:

- Pressing **button A** appends `0` to the end of tt.
- Pressing **button B** replaces every digit in tt with the next digit: for digits `0` through `8` the next digit is the one whose value is larger by 1; the next digit after `9` is `0`.

For example, if tt is `1984` and button A is pressed, tt becomes `19840`; if button B is then pressed, tt becomes `20951`.

You are given a target string SS. Starting from an empty string, press the buttons zero or more times until tt coincides with SS. Find the minimum number of button presses required.

## Interactive Visualization

Try out the device yourself! You can:
1. Press Button A to append a 0
2. Press Button B to increment all digits (mod 10)
3. Try to see if you can reach the target string in the minimum number of steps. 

{{< atcoder-device >}}


