import { Question } from "../types";

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["array", "hash-map"],
    explanation: "This problem asks you to find two numbers in an array that add up to a target value. The optimal approach uses a hash map to store each number's complement (target - current number) as you iterate. This allows O(1) lookup time, resulting in an O(n) time complexity solution instead of the brute force O(n²) approach.",
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["string", "sliding-window"],
    explanation: "This problem requires finding the longest substring without repeating characters. The sliding window technique works perfectly here: maintain a window with two pointers (left and right), use a hash set to track characters in the current window, and expand/contract the window as needed. When a duplicate is found, move the left pointer until the duplicate is removed.",
  },
  {
    id: 3,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["binary-search", "divide-and-conquer"],
    explanation: "This is a classic binary search problem. The key insight is that we need to partition both arrays such that elements on the left side are less than elements on the right side. Use binary search on the smaller array to find the correct partition point. The median will be the average of max(left partition) and min(right partition) when total length is even, or max(left partition) when odd.",
  },
  {
    id: 4,
    title: "Reverse Linked List",
    difficulty: "Easy",
    tags: ["linked-list", "recursion"],
    explanation: "To reverse a linked list, you can use either an iterative or recursive approach. The iterative method uses three pointers: previous, current, and next. Traverse the list, reversing each link as you go. The recursive approach reverses the rest of the list first, then adjusts the current node's pointer. Both methods have O(n) time complexity.",
  },
  {
    id: 5,
    title: "Container With Most Water",
    difficulty: "Medium",
    tags: ["array", "two-pointers", "greedy"],
    explanation: "This problem uses the two-pointer technique. Start with pointers at both ends of the array. The area is determined by the shorter line and the distance between pointers. Move the pointer pointing to the shorter line inward, as moving the taller line would only decrease the area. Continue until pointers meet, tracking the maximum area found.",
  },
  {
    id: 6,
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["array", "sorting"],
    explanation: "First, sort the intervals by their start time. Then iterate through the sorted intervals, merging overlapping ones. Two intervals overlap if the start of one is less than or equal to the end of the previous. When merging, update the end time to be the maximum of the two intervals' end times.",
  },
];

