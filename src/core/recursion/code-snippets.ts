/**
 * Multi-language Code Snippets for Recursion
 */

export const RECURSION_SNIPPETS: Record<string, Record<string, string>> = {
  factorial: {
    typescript: `function factorial(n: number): number {
  if (n <= 1) {
    return 1; // Base case
  }
  return n * factorial(n - 1); // Recursive step
}`,
    python: `def factorial(n):
    if n <= 1:
        return 1  # Base case
    return n * factorial(n - 1)  # Recursive step`,
    java: `int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`,
    cpp: `int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`,
  },
  fibonacci: {
    typescript: `function fibonacci(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    python: `def fibonacci(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    java: `int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
    cpp: `int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  },
  hanoi: {
    typescript: `function hanoi(n: number, from: string, to: string, aux: string) {
  if (n === 1) {
    moveDisk(1, from, to);
    return;
  }
  hanoi(n - 1, from, aux, to);
  moveDisk(n, from, to);
  hanoi(n - 1, aux, to, from);
}`,
    python: `def hanoi(n, from_rod, to_rod, aux_rod):
    if n == 1:
        move_disk(1, from_rod, to_rod)
        return
    hanoi(n - 1, from_rod, aux_rod, to_rod)
    move_disk(n, from_rod, to_rod)
    hanoi(n - 1, aux_rod, to_rod, from_rod)`,
    java: `void hanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        System.out.println("Move disk 1 from " + from + " to " + to);
        return;
    }
    hanoi(n - 1, from, aux, to);
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n - 1, aux, to, from);
}`,
    cpp: `void hanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        cout << "Move disk 1 from " << from << " to " << to << "\\n";
        return;
    }
    hanoi(n - 1, from, aux, to);
    cout << "Move disk " << n << " from " << from << " to " << to << "\\n";
    hanoi(n - 1, aux, to, from);
}`,
  },
};
