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

describe("TextQueue typing", () => {
  it("types messages independently and catches up after a slow frame", () => {
    let now = 0;
    const queue = new TextQueue(() => now);
    queue.add("ABCD", 40);
    queue.add("XYZ", 100);
    expect(queue.usedLines()).toBe(2);
    expect(queue.lines()[0]?.trim()).toBe("");
    now = 39;
    queue.update();
    expect(queue.lines()[0]?.trim()).toBe("");
    now = 100;
    queue.update();
    expect(queue.lines()[0]?.trim()).toBe("AB");
    expect(queue.lines()[1]?.trim()).toBe("X");
    now = 400;
    queue.update();
    expect(queue.lines()[0]?.trim()).toBe("ABCD");
    expect(queue.lines()[1]?.trim()).toBe("XYZ");
  });

  it("continues typing across wrapped rows", () => {
    let now = 0;
    const queue = new TextQueue(() => now);
    queue.add("X".repeat(TEXT_COLUMNS) + "TAIL", 10);
    now = (TEXT_COLUMNS + 2) * 10;
    queue.update();
    expect(queue.lines()[0]).toBe("X".repeat(TEXT_COLUMNS));
    expect(queue.lines()[1]?.trim()).toBe("TA");
  });

  it("moves active messages on scroll and discards those scrolled out", () => {
    let now = 0;
    const queue = new TextQueue(() => now);
    for (let index = 0; index < CHAT_ROWS; index += 1) {
      queue.add(`${index} TEXT`, 10);
    }
    queue.add("NEW", 10);
    now = 1000;
    queue.update();
    expect(queue.lines()[0]?.trim()).toBe(`${CHAT_SCROLL_ROWS} TEXT`);
    expect(queue.lines()[queue.usedLines() - 1]?.trim()).toBe("NEW");
    expect(queue.lines()).toHaveLength(CHAT_ROWS);
  });

  it("handles a typing message longer than the screen", () => {
    let now = 0;
    const queue = new TextQueue(() => now);
    queue.add("X".repeat(TEXT_COLUMNS * CHAT_ROWS) + "TAIL", 1);
    now = 10000;
    queue.update();
    expect(queue.lines()[queue.usedLines() - 1]?.trim()).toBe("TAIL");
    expect(queue.lines()).toHaveLength(CHAT_ROWS);
  });

  it("clears unfinished messages and supports immediate and empty messages", () => {
    let now = 0;
    const queue = new TextQueue(() => now);
    queue.add("OLD", 10);
    queue.clear();
    queue.add("NEW", 0);
    queue.add("", 10);
    now = 1000;
    queue.update();
    expect(queue.usedLines()).toBe(2);
    expect(queue.lines()[0]?.trim()).toBe("NEW");
    expect(queue.lines()[1]?.trim()).toBe("");
  });

  it("rejects invalid delays without reserving rows", () => {
    const queue = new TextQueue();
    for (const delay of [-1, NaN, Infinity]) {
      expect(() => queue.add("TEXT", delay)).toThrow(RangeError);
    }
    expect(queue.usedLines()).toBe(0);
  });
});
