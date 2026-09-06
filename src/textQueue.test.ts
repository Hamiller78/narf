import { describe, expect, it } from "vitest";
import { CHAT_ROWS, CHAT_SCROLL_ROWS, TEXT_COLUMNS } from "./constants";
import { TextQueue } from "./textQueue";

describe("TextQueue", () => {
  it("wraps and pads text", () => {
    const queue = new TextQueue();
    queue.add("X".repeat(TEXT_COLUMNS) + "TAIL");
    expect(queue.usedLines()).toBe(2);
    expect(queue.lines()[0]).toBe("X".repeat(TEXT_COLUMNS));
    expect(queue.lines()[1]?.slice(0, 4)).toBe("TAIL");
  });

  it("scrolls by five rows when full", () => {
    const queue = new TextQueue();
    for (let index = 0; index < CHAT_ROWS; index += 1) {
      queue.add(String.fromCharCode(65 + index));
    }
    queue.add("NEW");
    expect(queue.usedLines()).toBe(CHAT_ROWS - CHAT_SCROLL_ROWS + 1);
    expect(queue.lines()[0]?.trim()).toBe(String.fromCharCode(65 + CHAT_SCROLL_ROWS));
    expect(queue.lines()[queue.usedLines() - 1]?.trim()).toBe("NEW");
  });
});
