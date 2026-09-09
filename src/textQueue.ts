import { CHAT_ROWS, CHAT_SCROLL_ROWS, TEXT_COLUMNS } from "./constants";

const blankLine = " ".repeat(TEXT_COLUMNS);

type TypingMessage = {
  text: string;
  firstRow: number;
  startedAt: number;
  delayMs: number;
};

export class TextQueue {
  private readonly buffer = Array.from({ length: CHAT_ROWS }, () => blankLine);
  private length = 0;
  private messages: TypingMessage[] = [];

  public constructor(private readonly now: () => number = () => performance.now()) {}

  /** Reserve rows immediately; reveal one character per delayMs (zero prints instantly). */
  public add(text: string, delayMs = 0): void {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
      throw new RangeError("Text delay must be a finite, non-negative number of milliseconds");
    }
    const message = { text, firstRow: this.length, startedAt: this.now(), delayMs };
    this.messages.push(message);
    const rows = Math.max(1, Math.ceil(text.length / TEXT_COLUMNS));
    for (let row = 0; row < rows; row += 1) {
      if (this.length >= CHAT_ROWS) {
        this.scroll();
      }
      this.buffer[this.length] = blankLine;
      this.length += 1;
    }
    this.update();
  }

  public update(): void {
    const now = this.now();
    this.messages = this.messages.filter((message) => {
      const visible = message.delayMs === 0 ? message.text.length : Math.min(message.text.length, Math.max(0, Math.floor((now - message.startedAt) / message.delayMs)));
      const rows = Math.max(1, Math.ceil(message.text.length / TEXT_COLUMNS));
      for (let offset = Math.max(0, -message.firstRow); offset < rows; offset += 1) {
        const row = message.firstRow + offset;
        const start = offset * TEXT_COLUMNS;
        this.buffer[row] = message.text.slice(start, Math.max(start, Math.min(start + TEXT_COLUMNS, visible))).padEnd(TEXT_COLUMNS);
      }
      return visible < message.text.length && message.firstRow + rows > 0;
    });
  }

  public clear(): void {
    this.messages = [];
    this.buffer.fill(blankLine);
    this.length = 0;
  }

  public lines(): readonly string[] {
    return this.buffer;
  }

  public usedLines(): number {
    return this.length;
  }

  private scroll(): void {
    this.buffer.copyWithin(0, CHAT_SCROLL_ROWS);
    this.buffer.fill(blankLine, CHAT_ROWS - CHAT_SCROLL_ROWS);
    this.length = CHAT_ROWS - CHAT_SCROLL_ROWS;
    for (const message of this.messages) {
      message.firstRow -= CHAT_SCROLL_ROWS;
    }
  }
}
