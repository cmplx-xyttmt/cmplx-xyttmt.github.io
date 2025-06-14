---
author: "Isaac Owomugisha" 
title: "Security 2 (ABC 407 C)"
description: "A deceptively simple atcoder problem with a cool visulization."
date: 2025-06-14
draft: false
tags: ["algorithms", "interactive", "atcoder"]
---

## The Problem

At the entrance of AtCoder Inc., there is a special pass-code input device. The device consists of a screen displaying one string, and two buttons.

Let tt be the string shown on the screen. Initially, tt is the empty string. Pressing a button changes tt as follows:

- Pressing **button A** appends `0` to the end of tt.
- Pressing **button B** replaces every digit in tt with the next digit: for digits `0` through `8` the next digit is the one whose value is larger by 1; the next digit after `9` is `0`.

For example, if tt is `1984` and button A is pressed, tt becomes `19840`; if button B is then pressed, tt becomes `20951`.

You are given a string SS. Starting from the empty string, press the buttons zero or more times until tt coincides with SS. Find the minimum number of button presses required.

## Interactive Visualization

Try out the device yourself! You can:
1. Press Button A to append a 0
2. Press Button B to increment all digits
3. Enter a target string and find the minimum number of steps required

{{< abc407c-security-device >}}
