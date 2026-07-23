+++
title = 'Design System Demo (draft)'
date = 2026-07-23T09:00:00+03:00
draft = true
description = 'A scratch page to preview the 2brain-inspired reskin: reading type, gel cards, callouts, and the interactive solution shortcode.'
tags = ['meta', 'design']
math = true
+++

This is a throwaway page to preview the redesign. Delete it before publishing.

## Reading type

The body now sets in a warm serif for an editorial feel, on a soft cream
gradient. Headings are forest green. Here's some `inline code`, a [link](/),
and a blockquote:

> Understand the user's problems, goals, and perspective deeply.

A fenced code block:

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

And some math, since `math = true`: $\; e^{i\pi} + 1 = 0$.

## Interactive shortcode

Below the fold is a collapsible solution card — the signature "gel" surface
with a gradient button. Click it:

{{< solution title="Closed form" button="Reveal solution" >}}
The $n$-th Fibonacci number has a closed form (Binet's formula):

$$F_n = \frac{\varphi^n - \psi^n}{\sqrt{5}}, \quad \varphi = \frac{1+\sqrt5}{2}.$$

So you *can* skip the loop — at the cost of floating-point precision.
{{< /solution >}}

## Callouts

Callouts are shortcodes (raw HTML in markdown is stripped by Hugo), with a
meaning-colored accent bar:

{{< callout title="Note" >}}
The default callout uses the emerald accent.
{{< /callout >}}

{{< callout type="amber" title="Heads up" >}}
The amber variant signals caution.
{{< /callout >}}

## Gel card

{{< gelcard title="Grouped content" >}}
A frosted glass container for grouping notes or wrapping a small demo.
{{< /gelcard >}}
