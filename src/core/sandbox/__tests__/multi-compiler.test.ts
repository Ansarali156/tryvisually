import { describe, it, expect } from "vitest";
import {
  compileAndExecute,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../multi-compiler";

describe("Multi-Language Compiler Engine", () => {
  it("provides configurations for all 8 major languages", () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(8);
    const ids = SUPPORTED_LANGUAGES.map((l) => l.id);
    expect(ids).toContain("python");
    expect(ids).toContain("cpp");
    expect(ids).toContain("java");
    expect(ids).toContain("c");
    expect(ids).toContain("javascript");
    expect(ids).toContain("typescript");
    expect(ids).toContain("go");
    expect(ids).toContain("rust");
  });

  it("ensures all languages start completely blank without preloaded code", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.defaultCode).toBe("");
    }
  });

  it("compiles and runs Python 3 code", () => {
    const code = `
sum_val = 0
for i in range(1, 6):
    sum_val += i
print("Final Sum:", sum_val)
`;
    const res = compileAndExecute("python", code);
    expect(res.success).toBe(true);
    expect(res.output.length).toBeGreaterThan(0);
    expect(res.output).toContain("Final Sum: 15");
    expect(res.steps.length).toBeGreaterThan(0);
  });

  it("compiles and runs C++ code", () => {
    const code = `
#include <iostream>
#include <vector>
using namespace std;
int main() {
    vector<int> numbers = {1, 3, 5, 7, 9};
    int sum = 0;
    for (int n : numbers) {
        sum += n;
    }
    cout << "Final Sum: " << sum << endl;
    return 0;
}
`;
    const res = compileAndExecute("cpp", code);
    expect(res.success).toBe(true);
    expect(res.output).toContain("Final Sum: 25");
    expect(res.steps.length).toBeGreaterThan(0);
  });

  it("compiles and runs Java code", () => {
    const code = `
public class Main {
    public static void main(String[] args) {
        int sum = 0;
        int[] arr = {1, 3, 5, 7, 9};
        for (int x : arr) {
            sum += x;
        }
        System.out.println("Final Sum: " + sum);
    }
}
`;
    const res = compileAndExecute("java", code);
    expect(res.success).toBe(true);
    expect(res.output).toContain("Final Sum: 25");
  });

  it("compiles and runs C code", () => {
    const code = `
#include <stdio.h>
int main() {
    int arr[] = {1, 3, 5, 7, 9};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += arr[i];
    }
    printf("Final Sum: %d\\n", sum);
    return 0;
}
`;
    const res = compileAndExecute("c", code);
    expect(res.success).toBe(true);
    expect(res.output).toContain("Final Sum: 25");
  });

  it("compiles and runs Go code", () => {
    const code = `
package main
import "fmt"
func main() {
    nums := []int{1, 3, 5, 7, 9}
    sum := 0
    for _, v := range nums {
        sum += v
    }
    fmt.Printf("Final Sum: %d\\n", sum)
}
`;
    const res = compileAndExecute("go", code);
    expect(res.success).toBe(true);
    expect(res.output).toContain("Final Sum: 25");
  });

  it("compiles and runs Rust code", () => {
    const code = `
fn main() {
    let numbers = vec![1, 3, 5, 7, 9];
    let mut sum = 0;
    for n in numbers {
        sum += n;
    }
    println!("Final Sum: {}", sum);
}
`;
    const res = compileAndExecute("rust", code);
    expect(res.success).toBe(true);
    expect(res.output).toContain("Final Sum: 25");
  });

  it("catches syntax errors in C++", () => {
    const invalidCpp = `int main() {
    int x = 10
    return 0;
}`;
    const res = compileAndExecute("cpp", invalidCpp);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
