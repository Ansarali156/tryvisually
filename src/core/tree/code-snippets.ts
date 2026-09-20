/**
 * Tree & BST Multi-Language Code Snippets
 *
 * Provides educational source code implementations across Python, JavaScript,
 * TypeScript, Java, and C++ for BST and Binary Tree operations.
 * Line numbers are 1-indexed for synchronization with ExecutionStep line mappings.
 */

import type { SourceCode, SupportedLanguage } from "@/core/synchronization/types";
import { parseSourceCode } from "@/core/synchronization/utils/source-code";
import type { TreeOperationType } from "./types";

const BST_INSERT_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def insert(node, val):
    if not node:
        return TreeNode(val)
    if val == node.val:
        return node  # duplicates rejected
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node`,
  javascript: `function insert(node, val) {
  if (!node) {
    return new TreeNode(val);
  }
  if (val === node.val) {
    return node; // duplicates rejected
  }
  if (val < node.val) {
    node.left = insert(node.left, val);
  } else {
    node.right = insert(node.right, val);
  }
  return node;
}`,
  typescript: `function insert(node: TreeNode | null, val: number): TreeNode {
  if (!node) {
    return new TreeNode(val);
  }
  if (val === node.val) {
    return node; // duplicates rejected
  }
  if (val < node.val) {
    node.left = insert(node.left, val);
  } else {
    node.right = insert(node.right, val);
  }
  return node;
}`,
  java: `TreeNode insert(TreeNode node, int val) {
    if (node == null) {
        return new TreeNode(val);
    }
    if (val == node.val) {
        return node; // duplicates rejected
    }
    if (val < node.val) {
        node.left = insert(node.left, val);
    } else {
        node.right = insert(node.right, val);
    }
    return node;
}`,
  cpp: `TreeNode* insert(TreeNode* node, int val) {
    if (!node) {
        return new TreeNode(val);
    }
    if (val == node->val) {
        return node; // duplicates rejected
    }
    if (val < node->val) {
        node->left = insert(node->left, val);
    } else {
        node->right = insert(node->right, val);
    }
    return node;
}`,
};

const BST_SEARCH_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def search(node, target):
    if not node:
        return None  # not found
    if target == node.val:
        return node  # found!
    if target < node.val:
        return search(node.left, target)
    return search(node.right, target)`,
  javascript: `function search(node, target) {
  if (!node) {
    return null; // not found
  }
  if (target === node.val) {
    return node; // found!
  }
  if (target < node.val) {
    return search(node.left, target);
  }
  return search(node.right, target);
}`,
  typescript: `function search(node: TreeNode | null, target: number): TreeNode | null {
  if (!node) {
    return null; // not found
  }
  if (target === node.val) {
    return node; // found!
  }
  if (target < node.val) {
    return search(node.left, target);
  }
  return search(node.right, target);
}`,
  java: `TreeNode search(TreeNode node, int target) {
    if (node == null) {
        return null; // not found
    }
    if (target == node.val) {
        return node; // found!
    }
    if (target < node.val) {
        return search(node.left, target);
    }
    return search(node.right, target);
}`,
  cpp: `TreeNode* search(TreeNode* node, int target) {
    if (!node) {
        return nullptr; // not found
    }
    if (target == node->val) {
        return node; // found!
    }
    if (target < node->val) {
        return search(node->left, target);
    }
    return search(node->right, target);
}`,
};

const BST_DELETE_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def delete_node(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        # Case 1 & 2: 0 or 1 child
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        # Case 3: 2 children -> replace with inorder successor
        succ = find_min(root.right)
        root.val = succ.val
        root.right = delete_node(root.right, succ.val)
    return root`,
  javascript: `function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // Case 1 & 2: 0 or 1 child
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    // Case 3: 2 children -> inorder successor
    const succ = findMin(root.right);
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
  typescript: `function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (!root) return null;
  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // Case 1 & 2: 0 or 1 child
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    // Case 3: 2 children -> inorder successor
    const succ = findMin(root.right);
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
  java: `TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        TreeNode succ = findMin(root.right);
        root.val = succ.val;
        root.right = deleteNode(root.right, succ.val);
    }
    return root;
}`,
  cpp: `TreeNode* deleteNode(TreeNode* root, int key) {
    if (!root) return nullptr;
    if (key < root->val) {
        root->left = deleteNode(root->left, key);
    } else if (key > root->val) {
        root->right = deleteNode(root->right, key);
    } else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        TreeNode* succ = findMin(root->right);
        root->val = succ->val;
        root->right = deleteNode(root->right, succ->val);
    }
    return root;
}`,
};

const BST_MIN_MAX_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def find_extreme(node, direction):
    if not node:
        return None
    current = node
    while getattr(current, direction):
        current = getattr(current, direction)
    return current.val`,
  javascript: `function findExtreme(node, direction) {
  if (!node) return null;
  let current = node;
  while (current[direction]) {
    current = current[direction];
  }
  return current.val;
}`,
  typescript: `function findExtreme(node: TreeNode | null, direction: 'left' | 'right'): number | null {
  if (!node) return null;
  let current = node;
  while (current[direction]) {
    current = current[direction]!;
  }
  return current.val;
}`,
  java: `int findExtreme(TreeNode node, boolean isMin) {
    if (node == null) return -1;
    TreeNode current = node;
    while ((isMin ? current.left : current.right) != null) {
        current = isMin ? current.left : current.right;
    }
    return current.val;
}`,
  cpp: `int findExtreme(TreeNode* node, bool isMin) {
    if (!node) return -1;
    TreeNode* current = node;
    while (isMin ? current->left : current->right) {
        current = isMin ? current->left : current->right;
    }
    return current->val;
}`,
};

const TRAVERSAL_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def traverse(node, order):
    if not node:
        return
    # Preorder
    if order == "pre": visit(node.val)
    traverse(node.left, order)
    # Inorder
    if order == "in": visit(node.val)
    traverse(node.right, order)
    # Postorder
    if order == "post": visit(node.val)`,
  javascript: `function traverse(node, order) {
  if (!node) return;
  // Preorder
  if (order === "pre") visit(node.val);
  traverse(node.left, order);
  // Inorder
  if (order === "in") visit(node.val);
  traverse(node.right, order);
  // Postorder
  if (order === "post") visit(node.val);
}`,
  typescript: `function traverse(node: TreeNode | null, order: "pre" | "in" | "post"): void {
  if (!node) return;
  if (order === "pre") visit(node.val);
  traverse(node.left, order);
  if (order === "in") visit(node.val);
  traverse(node.right, order);
  if (order === "post") visit(node.val);
}`,
  java: `void traverse(TreeNode node, String order) {
    if (node == null) return;
    if (order.equals("pre")) visit(node.val);
    traverse(node.left, order);
    if (order.equals("in")) visit(node.val);
    traverse(node.right, order);
    if (order.equals("post")) visit(node.val);
}`,
  cpp: `void traverse(TreeNode* node, const string& order) {
    if (!node) return;
    if (order == "pre") visit(node->val);
    traverse(node->left, order);
    if (order == "in") visit(node->val);
    traverse(node->right, order);
    if (order == "post") visit(node->val);
}`,
};

const LEVEL_ORDER_SNIPPETS: Record<SupportedLanguage, string> = {
  python: `def level_order(root):
    if not root:
        return []
    queue, result = [root], []
    while queue:
        node = queue.pop(0)
        result.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return result`,
  javascript: `function levelOrder(root) {
  if (!root) return [];
  const queue = [root];
  const result = [];
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}`,
  typescript: `function levelOrder(root: TreeNode | null): number[] {
  if (!root) return [];
  const queue: TreeNode[] = [root];
  const result: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}`,
  java: `List<Integer> levelOrder(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new LinkedList<>();
    q.add(root);
    while (!q.isEmpty()) {
        TreeNode curr = q.poll();
        res.add(curr.val);
        if (curr.left != null) q.add(curr.left);
        if (curr.right != null) q.add(curr.right);
    }
    return res;
}`,
  cpp: `vector<int> levelOrder(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        res.push_back(curr->val);
        if (curr->left) q.push(curr->left);
        if (curr->right) q.push(curr->right);
    }
    return res;
}`,
};

/**
 * Returns multi-language source code dictionary for a given tree operation.
 */
export function getTreeSourceCodes(operation: TreeOperationType): Record<SupportedLanguage, SourceCode> {
  let dictionary = BST_INSERT_SNIPPETS;

  switch (operation) {
    case "insert":
    case "insert-node":
      dictionary = BST_INSERT_SNIPPETS;
      break;
    case "search":
    case "contains":
      dictionary = BST_SEARCH_SNIPPETS;
      break;
    case "delete":
    case "delete-node":
      dictionary = BST_DELETE_SNIPPETS;
      break;
    case "minimum":
    case "maximum":
    case "successor":
    case "predecessor":
      dictionary = BST_MIN_MAX_SNIPPETS;
      break;
    case "inorder":
    case "preorder":
    case "postorder":
      dictionary = TRAVERSAL_SNIPPETS;
      break;
    case "level-order":
      dictionary = LEVEL_ORDER_SNIPPETS;
      break;
    default:
      dictionary = BST_INSERT_SNIPPETS;
      break;
  }

  return {
    python: parseSourceCode(dictionary.python, "python"),
    javascript: parseSourceCode(dictionary.javascript, "javascript"),
    typescript: parseSourceCode(dictionary.typescript, "typescript"),
    java: parseSourceCode(dictionary.java, "java"),
    cpp: parseSourceCode(dictionary.cpp, "cpp"),
  };
}
