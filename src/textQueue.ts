import { CHAT_ROWS, CHAT_SCROLL_ROWS, TEXT_COLUMNS } from "./constants";

const blankLine = " ".repeat(TEXT_COLUMNS);

export class TextQueue {
  private readonly buffer = Array.from({ length: CHAT_ROWS }, () => blankLine);
  private length = 0;

  public add(text: string): void {
    const chunks = text.length === 0 ? [""] : Array.from({ length: Math.ceil(text.length / TEXT_COLUMNS) }, (_, index) => text.slice(index * TEXT_COLUMNS, (index + 1) * TEXT_COLUMNS));
    for (const chunk of chunks) {
      if (this.length >= CHAT_ROWS) {
        this.scroll();
      }
      this.buffer[this.length] = chunk.padEnd(TEXT_COLUMNS).slice(0, TEXT_COLUMNS);
      this.length += 1;
    }
  }

  public clear(): void {
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
  }
}
