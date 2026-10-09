---
author: "Isaac Owomugisha"
title: "Monotonic deques and stacks: Part 1"
date: "2026-10-09"
draft: true
description: "Exploring the monotonic deque by solving Sliding Window Maximum from LeetCode. We step through the algorithm and look at a real-world example."
tags: [ "algorithms", "data-structures", "leetcode", "visualization" ]
---

It's a cold night, and a weather station logs the temperature once an hour. Its display shows the latest reading and,
next to it, the warmest reading of the last three hours. Here's the night so far, in °C:

```text
hour      0   1   2   3   4   5   6   7
reading   1   3  -1  -3   5   3   6   7
```

At hour 4, a 5 comes in, and the last three hours read -1, -3, 5. Look at the -1 and the -3. Can either of them be the
warmest reading in any later three-hour window?

No. The 5 is warmer than both of them, and it arrived after them, so it stays in the window longer than they do. Every
later window that still holds the -1 also holds the 5. The -1 can never win, so the station can forget it right now.


## The problem

Take away the weather station and you have
[Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) (LeetCode 239). You get an array
`nums` and a window size `k`. Slide the window from left to right, one step at a time, and report the largest number in
each window. The problem's own example is the night above:

```text
nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

window                        max
[1  3  -1] -3  5  3  6  7     3
 1 [3  -1  -3] 5  3  6  7     3
 1  3 [-1  -3  5] 3  6  7     5
 1  3  -1 [-3  5  3] 6  7     5
 1  3  -1  -3 [5  3  6] 7     6
 1  3  -1  -3  5 [3  6  7]    7
```

The obvious answer scans each window, which is O(nk). For three hours that's fine. For the warmest reading of the last
week, logged every minute, each step rescans 10,080 readings. LeetCode allows `n` up to 10^5 with `k` as big as `n`, and
there O(nk) is too slow.

## The heap version, and why it wastes work

My first solution used a max-heap. Push each number as it arrives, and the top of the heap is
the max. The trouble is removing the number that leaves the window: a heap can't delete from the middle cheaply.

So don't delete it until it reaches the top. This trick is called lazy deletion. A number at the top that's no longer in the window is stale, so pop it and look again.

My first version kept a counter next to the heap to know which values were still in the window, and the two had to stay
in step on every add and every remove. The cleaner form pushes `(-value, index)` pairs (the minus sign turns Python's
min-heap into a max-heap). Then "stale" is just "the index at the top has left the window", and the counter goes away:

```python
import heapq

def max_sliding_window(nums, k):
    heap, out = [], []
    for i, num in enumerate(nums):
        heapq.heappush(heap, (-num, i))
        if i >= k - 1:
            while heap[0][1] <= i - k:   # the top left the window
                heapq.heappop(heap)
            out.append(-heap[0][0])
    return out
```

It's accepted. But what does it cost? Stale entries only leave when they surface, and on some inputs they never
surface. Feed it an increasing array: each new number goes straight to the top, and every old number sits underneath it
forever. The heap grows to `n` entries, not `k`, and each push costs O(log n). That's O(n log n) time and O(n) space.
Can we find an O(n) solution?

## The question that unlocked it

I couldn't get past "keep the max in a heap". The question that got me unstuck was this one:

> When a new number enters the window, what's true of the numbers already there that are smaller than it?

The new number outlives all of them. Any window that still holds one of those smaller numbers also holds the new one,
which is bigger. So they can never be the max of any later window. The heap keeps them around anyway, and that's the
wasted work.

## A candidate beaten by a newer, better one can never win

So drop them. Keep a deque of indices, and when `nums[i]` arrives:

1. If the index at the front has left the window, pop it from the front.
2. While the number at the back is smaller than `nums[i]`, pop it from the back. It's been beaten.
3. Push `i` onto the back.
4. Once the first window is full, the front is the answer.

```python
from collections import deque

def max_sliding_window(nums, k):
    dq, out = deque(), []   # indices, values non-increasing front to back
    for i, num in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()             # the front left the window
        while dq and num > nums[dq[-1]]:
            dq.pop()                 # beaten by a newer, bigger number
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out
```

Why is the front the max? Step 2 means nothing in the deque is ever smaller than something behind it. The values read
non-increasing from front to back, so the biggest one is at the front. That sorted order is where the name monotonic
deque comes from.

Why does step 1 only ever need to look at the front? The deque holds indices in the order they arrived, so the oldest
one is at the front. The only index that can leave the window at step `i` is `i - k`, and if it's still in the deque,
it's the oldest one there.

Notice what the deque doesn't do. It never sorts anything, and it never searches. It only drops numbers from the two
ends.

## Step through it

The widget below runs the deque on any array you give it, one rule at a time. Start with the problem example and step
to index 4, where the 5 arrives. Three things happen in that one index. The 3 has left the window, so it goes from the
front. Then the 5 beats the -3 at the back, and after that the -1. Watch the bars that turn hollow: those are the numbers
that have been beaten and can never win.

Then try the presets. Each one makes the deque behave differently, and the caption under the buttons says how. On
Increasing, tick "Show the heap version beside it" to see the stale entries from the heap section pile up.

{{< monotonic-deque >}}

One thing the widget doesn't show is why the pop in step 2 is strict (`>`, not `>=`). With indices in the deque, either
works. My first deque stored values, and it dropped the front when the front equalled `nums[i - k]`. That check is only
safe with a strict pop. With `>=`, a newer equal number takes the old one's place, and the check drops it too early. On
`[4, 4, 1]` with `k = 2`, that version reports 1 for the last window instead of 4. Storing indices means you don't need
the argument at all.

## Why it's O(n)

Index 4 did three pops in one step. Doesn't that make the loop O(nk) in the worst case?

It doesn't, and the "pushed" and "popped" rows under the bars show why. Every index gets pushed once. After that it can
be popped once, from one end or the other, and then it's gone for good. So across the whole run there are at most `n`
pushes and `n` pops, and the counter under the widget never passes `2n`. One step can do a lot of pops, but only by
spending pops that earlier steps didn't use. (This style of argument is called amortized analysis.)

The deque never holds more than `k` indices, because everything in it is inside the window. So it's O(n) time and O(k)
extra space, against the heap's O(n log n) and O(n).

## In the wild

I'm always curious about where algorithms like this one show up in real code, and AI makes that much easier to go looking
for. If you've called `df.rolling(3).max()` in pandas, you've run this one, and it turns up in more places than I
expected.

**Data libraries.** SciPy's `maximum_filter1d` and Bottleneck's `move_max` both credit Richard Harter, who described it
in 2001 as the ascending minima algorithm
([archived write-up](https://web.archive.org/web/20130615115546/http://richardhartersworld.com/cri/2001/slidingmin.html)).
His version stores the deque in a ring buffer, and next to each value it keeps the index at which that value leaves the
window, instead of the index where it arrived
([SciPy's `ni_filters.c`](https://github.com/scipy/scipy/blob/c71fcecc1bdd07423de43da2588a5af83d95b5f7/scipy/ndimage/src/ni_filters.c#L451),
[Bottleneck's `move_template.c`](https://github.com/pydata/bottleneck/blob/15124a00c6edf2693a02b9db02e9127b37510152/bottleneck/src/move_template.c#L9-L16)).
pandas added a `std::deque` for time-based windows like `rolling('1d')` in
[PR #19549](https://github.com/pandas-dev/pandas/pull/19549) (2018), replacing a loop that rescanned every window.
That PR reports 1.8 s going down to 0.3 s. Polars got the same fix in 2025, and its comments could be captions for the
widget above: "Remove values which are older and worse" and "Remove values which have fallen outside the window start"
([`arg_min_max.rs`](https://github.com/pola-rs/polars/blob/74dd736d655cc3c7a70857d859030d957deba7ac/crates/polars-compute/src/rolling/arg_min_max.rs#L13-L55)).
How Polars got there is the story told below.

**TCP.** Linux's BBR congestion control estimates a connection's bottleneck bandwidth as the maximum delivery rate over
the last 10 round trips (`tcp_bbr.c`). Core TCP tracks the minimum round-trip time over the last 300 seconds. Both use
[`lib/win_minmax.c`](https://github.com/torvalds/linux/blob/6f8319e3e9a44dd537d17f41565a8453c560a581/lib/win_minmax.c),
Kathleen Nichols' windowed filter, and Google's QUIC library has a C++ copy of it
([`windowed_filter.h`](https://github.com/google/quiche/blob/a568f174877b014da2a1cd4441c73d0caeb264b1/quiche/quic/core/congestion_control/windowed_filter.h)).
It isn't the deque, though. It keeps exactly three samples: the best, the second best and the third best. Its header
comment says "Upon getting a new min, we can forget everything earlier", which is the rule this post is about. Keeping
only three samples means the answer is sometimes approximate, and in return every update does a constant amount of work
in a constant amount of memory.

### The Polars example in detail

The Polars story is the one I like best, because it's the idea I had before I found the deque.

In June 2023, [PR #9277](https://github.com/pola-rs/polars/pull/9277) gave Polars a faster `rolling_min`. It
remembers the current minimum and where it is. When the window slides, it compares the new value with the minimum it
remembered. It only looks at the whole window again when the remembered minimum has slid out of it. On random data that
doesn't happen often, and the PR's benchmark ran 1.5 to 2 times faster than the code it replaced.

Five months later, orlp (Orson Peters) opened
[an issue](https://github.com/pola-rs/polars/issues/12714) titled "rolling_min/max has quadratic worst case behavior",
with this input:

```python
bad = [i ^ 1 for i in range(10**6)]      # 1, 0, 3, 2, 5, 4, ...
df = pl.DataFrame({"x": bad})
df.select(pl.col("x").rolling_min(10**5))
```

Why does that input hurt? It's almost increasing, so the smallest value in each window sits near the left edge, where
the oldest values are. It slides out every other step, and every time it does, the code looks through the window again:
up to 100,000 values, about 450,000 times.

Here's that input at a size you can step through: 16 values and a window of 6. It's the same stepper as before, set to a
rolling minimum, so the deque now pops from the back while the new number is *smaller*. The panel beside it runs the 2023
code. Step to index 7, where the remembered minimum leaves the window for the first time, and compare what each one has
to do next.

{{< monotonic-deque mode="polars" >}}

The 2023 code remembers one value. When that value leaves, it knows nothing about the rest of the window, so it has to
look at all of it again. The deque has the answer at its front already, because it kept every value that could still
become the minimum, in order. The value the 2023 code rescans for is already sitting at the deque's front.

On random data, the 2023 code does fewer comparisons than the deque. I counted 2,499 against 3,973 on 2,000 random
values with a window of 500, which may be why it looked fine in its benchmark. It only loses badly when the input puts
the minimum at the old end of the window, over and over. On the issue's input with the same size and window, it's
376,250 comparisons against 2,998.

The fix came in March 2025 ([PR #21770](https://github.com/pola-rs/polars/pull/21770)), and it was written by the same
person who reported the bug. It's the deque from this post.

## Next: monotonic stacks

The deque drops from both ends: from the back when a number is beaten, and from the front when it gets too old. Take away
the window, and nothing ever gets too old. What's left is a stack that only drops from the top.

We shall take a look at the monotonic stack (and its applications) in part 2.
