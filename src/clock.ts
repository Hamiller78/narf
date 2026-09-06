export class GameClock {
  private startedAt = 0;
  private startSeconds = 0;
  private displayedSecond = -1;

  public constructor(private readonly now: () => number) {}

  public set(time: string): void {
    const parts = time.split(":").map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
      throw new Error(`Invalid clock time: ${time}`);
    }
    const [hour = 0, minute = 0, second = 0] = parts;
    this.startSeconds = hour * 3600 + minute * 60 + second;
    this.startedAt = this.now();
    this.displayedSecond = -1;
  }

  public current(): string {
    const elapsed = Math.floor((this.now() - this.startedAt) / 1000);
    const seconds = (this.startSeconds + elapsed) % 86400;
    const hour = Math.floor(seconds / 3600);
    const minute = Math.floor((seconds % 3600) / 60);
    return `${twoDigits(hour)}:${twoDigits(minute)}:${twoDigits(seconds % 60)}`;
  }

  public takeUpdate(): string | undefined {
    const second = Math.floor((this.now() - this.startedAt) / 1000);
    if (second === this.displayedSecond) {
      return undefined;
    }
    this.displayedSecond = second;
    return this.current();
  }
}

export function twoDigits(value: number): string {
  return Math.floor(value).toString().padStart(2, "0");
}
