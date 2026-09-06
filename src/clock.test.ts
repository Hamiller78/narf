import { describe, expect, it } from "vitest";
import { GameClock } from "./clock";

describe("GameClock", () => {
  it("advances and wraps across midnight", () => {
    let now = 1000;
    const clock = new GameClock(() => now);
    clock.set("23:59:59");
    expect(clock.current()).toBe("23:59:59");
    now = 2000;
    expect(clock.current()).toBe("00:00:00");
  });

  it("reports at most one update per second", () => {
    let now = 0;
    const clock = new GameClock(() => now);
    clock.set("11:47:30");
    expect(clock.takeUpdate()).toBe("11:47:30");
    now = 999;
    expect(clock.takeUpdate()).toBeUndefined();
    now = 1000;
    expect(clock.takeUpdate()).toBe("11:47:31");
  });
});
