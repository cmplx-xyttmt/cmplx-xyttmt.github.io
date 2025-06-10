+++ 
author = "Isaac Owomugisha" 
title="Domino Covering XOR (ABC 407 D)" 
date="2025-06-10" 
description="An interesting problem with a solution that uses bitwise operations"
+++

In this article, let's take a look at [***Problem D: Domino Covering XOR***](https://atcoder.jp/contests/abc407/tasks/abc407_d) from AtCoder Beginner Contest 407. 
When I first attempted this problem, I wasn't able to solve it on my own. My initial approach led me down a rabbit hole: 
attempting to maximize the XOR by strategically choosing which numbers to exclude, bit by bit, from most significant to least. 
This quickly proved difficult to implement, as removing a single number (by covering it with a domino) necessarily meant covering an adjacent one as well. 
After wrestling with the complexities of this idea, I decided it was too convoluted and turned to [the editorial](https://atcoder.jp/contests/abc407/editorial/13113) for guidance.

The solution from the editorial involves first evaluating all possible domino coverings, and then choosing which one maximizes the XOR value. 
The first time I read it, I didn't fully understand it, especially the implementation. This was largely due to my rustiness with bitmasks and bitwise operations.
A quick refresher from [***Chapter 10: Bit manipulation of Competitive Programmer's Handbook***](https://cses.fi/book/book.pdf) gave me all I needed to understand the approach, and I was able to implement the solution. 

Before we dive into the solution's details, let's briefly review the key bit manipulation concepts essential for understanding this problem:
- You can use an `n-bit` integer to represent a subset of a set of $n$ elements. In this problem, we'll use this technique to represent all possible configurations of cells covered by dominoes.
- Bit shifts: A left bit shift `x << k` effectively multiplies $x$ by $2^k$. Specifically, it shifts the bits of $x$ to the left by $k$ positions, filling the vacated rightmost bits with zeros. Therefore, `1 << k` results in a number with only the `k-th bit` set to one (0-indexed).
- You can check if a bit of a given number is 1 by combining the left shift and the bitwise `AND` operation( `&`). if `x & (1 << k) > 0`, then the `kth bit` of `x` is one.
- You can 'turn on' (set to 1) the `k-th` bit of a number `x` by combining a left shift and the bitwise `OR` operation (`|`). For example, `x | (1 << k)` sets the `k-th` bit of x to 1, regardless of its previous state. This operation is crucial for updating our domino covering representation.

With these fundamentals in mind, the solution can be broken down into 2 main phases:
- **Phase 1: Generating All Coverings**. We generate a set of all unique ways to place dominoes on the grid. Each unique covering is represented by an integer bitmask, where each bit corresponds to a cell in the grid. A 1 at a cell's bit position indicates it's covered by a domino.
This generation proceeds cell by cell. For each cell (i,j) and every existing partial covering in our set, we consider two options for extending it:
  - If the current cell is already covered by a domino in the current bitmask (i.e., its corresponding bit is 1), we simply move on. No new domino placement starts here from this cell.
  - If the cell is uncovered, we explore placing a new domino:
    - Horizontal Domino: If the cell to its right is within bounds and also uncovered, we form a new covering by placing a horizontal domino that covers both the current cell and the cell to its right.
    - Vertical Domino: Similarly, if the cell below it is within bounds and also uncovered, we form a new covering by placing a vertical domino that covers both the current cell and the cell below it. Each of these newly formed complete or partial coverings is added to our set of possibilities.
- **Phase 2: Evaluating and Maximizing XOR**. Once all possible domino coverings have been generated, we iterate through each valid covering. For each covering, we calculate the bitwise XOR sum of the values in all the uncovered cells. The maximum XOR value found across all coverings is our final answer.

Below is my implementation. You can also [check it out on github](https://github.com/cmplx-xyttmt/competitive-programming/blob/main/python/src/atcoder/abc407/D.py). You can also check out [the editorial implementation in C++](https://atcoder.jp/contests/abc407/editorial/13113):
```python
h, w = read_ints()  
grid = []  
for line in range(h):  
    grid.append(read_ints())  
covering_options = set()  
covering_options.add(0)  
for i in range(h):  
    for j in range(w):  
        temp = set()  
        temp.update(covering_options)  
        curr_cell = i * w + j  
        for option in covering_options:  
            if not ((1 << curr_cell) & option):  
                right_cell = i * w + j + 1  
                down_cell = (i + 1) * w + j  
                if j + 1 < w and not ((1 << right_cell) & option):  
                    new_option = option | (1 << curr_cell)  
                    new_option |= (1 << right_cell)  
                    temp.add(new_option)  
                if i + 1 < h and not ((1 << down_cell) & option):  
                    new_option = option | (1 << curr_cell)  
                    new_option |= (1 << down_cell)  
                    temp.add(new_option)  
        covering_options = temp  
best = 0  
for option in covering_options:  
    xor = 0  
    for i in range(h):  
        for j in range(w):  
            cell = i * w + j  
            if not ((1 << cell) & option):  
                xor ^= grid[i][j]  
    best = max(xor, best)  
  
print(best)
```
