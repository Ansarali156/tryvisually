/**
 * Explicit Trace Examples Registry
 *
 * Provides educational algorithm and programming examples for TRY VISUALLY.
 * Examples are NEVER loaded automatically; they are loaded only when the user
 * explicitly selects one from the [Examples] menu.
 */

import { SupportedLanguage } from "@/core/sandbox/multi-compiler";

export interface TraceExample {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly language: SupportedLanguage;
  readonly code: string;
}

export const TRACE_EXAMPLES: readonly TraceExample[] = [
  // 0. Dynamic Recursion & Memoization (recursive_fib.py)
  {
    id: "recursive-fib",
    title: "recursive_fib.py (Dynamic Call Tree)",
    category: "Recursion & Trees",
    description: "Fibonacci recursion with call tree traversal and memoization cache hits",
    language: "python",
    code: `# Dynamic Visual Execution Trace Engine
def fibonacci(n, memo={}):
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

# Driver invocation
target_number = 5
result = fibonacci(target_number)
print(f"Fibonacci({target_number}) = {result}")
`,
  },
  // 1. Hello World
  {
    id: "py-hello",
    title: "Hello World",
    category: "Basics",
    description: "Basic standard output execution",
    language: "python",
    code: `print("Hello, World!")
print("Welcome to TRY VISUALLY!")
`,
  },

  // 2. Variables & Arithmetic
  {
    id: "py-variables",
    title: "Variables & Arithmetic",
    category: "Basics",
    description: "Variable mutation, arithmetic operations, and expression evaluation",
    language: "python",
    code: `x = 15
y = 7

sum_val = x + y
diff_val = x - y
prod_val = x * y
quotient = x // y
remainder = x % y

print("x =", x, "y =", y)
print("Sum:", sum_val)
print("Product:", prod_val)
print("Quotient:", quotient, "Remainder:", remainder)
`,
  },

  // 3. Conditions (If / Else)
  {
    id: "py-conditions",
    title: "Conditions (If / Else)",
    category: "Control Flow",
    description: "Conditional branches and comparison expressions",
    language: "python",
    code: `score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print("Score:", score, "-> Grade:", grade)
`,
  },

  // 4. Loops (While & For)
  {
    id: "py-loops",
    title: "Loops (While & For)",
    category: "Control Flow",
    description: "Iteration through loops and accumulation",
    language: "python",
    code: `total = 0

for i in range(1, 6):
    total += i
    print("i =", i, "-> Accumulated total:", total)

print("Final Sum 1 to 5:", total)
`,
  },

  // 5. Array / List Operations
  {
    id: "py-arrays",
    title: "Array / List Operations",
    category: "Data Structures",
    description: "List indexing, traversal, and mutation",
    language: "python",
    code: `numbers = [4, 12, 7, 19, 3]
max_val = numbers[0]

for x in numbers:
    if x > max_val:
        max_val = x
    print("Checked", x, "Current Max:", max_val)

print("Maximum element is:", max_val)
`,
  },

  // 6. Functions & Parameters
  {
    id: "py-functions",
    title: "Functions & Parameters",
    category: "Functions",
    description: "Function definition, parameters passing, and return values",
    language: "python",
    code: `def calculate_area(width, height):
    area = width * height
    return area

w = 8
h = 5
result = calculate_area(w, h)
print("Area of rectangle (8 x 5):", result)
`,
  },

  // 7. Recursion (Factorial & Call Stack)
  {
    id: "py-recursion-factorial",
    title: "Recursion (Factorial)",
    category: "Recursion",
    description: "Recursive function calls, base case, and call stack visualization",
    language: "python",
    code: `def factorial(n):
    if n <= 1:
        return 1
    sub = factorial(n - 1)
    return n * sub

ans = factorial(4)
print("4! =", ans)
`,
  },

  // 8. Binary Search
  {
    id: "py-binary-search",
    title: "Binary Search",
    category: "Algorithms",
    description: "Two-pointer search bound halving on a sorted array",
    language: "python",
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        print("Checking mid index", mid, "value", arr[mid])

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1

items = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
result = binary_search(items, target)
print("Target", target, "found at index:", result)
`,
  },

  // 9. Bubble Sort
  {
    id: "py-bubble-sort",
    title: "Bubble Sort",
    category: "Algorithms",
    description: "Adjacent comparison and swapping algorithm",
    language: "python",
    code: `arr = [64, 34, 25, 12, 22]
n = len(arr)

for i in range(n):
    for j in range(0, n - i - 1):
        if arr[j] > arr[j + 1]:
            temp = arr[j]
            arr[j] = arr[j + 1]
            arr[j + 1] = temp
            print("Swapped:", arr)

print("Sorted array:", arr)
`,
  },
];
