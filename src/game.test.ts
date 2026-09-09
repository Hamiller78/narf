import { describe, expect, it } from "vitest";
import { DecisionType, WorldEventType, type ControlState } from "./types";
import { Game } from "./game";

const idle: ControlState = { vertical: 0, fire: false, any: false };

describe("Game", () => {
  it("schedules incoming reports after 20 to 60 seconds", () => {
    let now = 1000;
    const early = new Game(() => now, () => 0);
    early.addReport("EARLY");
    expect(early.reports[0]?.time).toBe(21000);

    const late = new Game(() => now, () => 0.999999);
    late.addReport("LATE");
    expect(late.reports[0]?.time).toBe(61000);
  });

  it("shows a countdown only after the incoming missile is reported", () => {
    let now = 0;
    const game = new Game(() => now, () => 0);
    game.startGame();
    expect(game.secondsUntilReportedImpact()).toBeUndefined();
    now = 20000;
    game.update(idle);
    expect(game.secondsUntilReportedImpact()).toBe(40);
    expect(game.decision.active).toBe(true);
    expect(game.chat.lines()[0]?.trim()).toBe("");
    now += 2000;
    game.update(idle);
    expect(game.chat.lines()[1]?.trim()).toBe("ADVISOR: SELECT OUR RESPONSE");
    expect(game.chat.lines()[0]?.trim()).toBe("INCOMING MISSILE: WASHINGTON D.C.");
  });

  it("resolves a missile into a delayed impact report", () => {
    let now = 0;
    const game = new Game(() => now, () => 0);
    game.phase = "running";
    game.addWorldEvent({ type: WorldEventType.MissileHitsOurCity, time: 1000, text: "CITY", value: 0 });
    now = 1000;
    game.update(idle);
    expect(game.worldEvents).toHaveLength(0);
    expect(game.reports.some((report) => report.text === "MISSILE HIT: CITY")).toBe(true);
  });

  it("cancels an old decision when a new report arrives", () => {
    let now = 0;
    const game = new Game(() => now);
    game.phase = "running";
    game.decision.start(DecisionType.IncomingMissile);
    game.scheduleReport({ time: 100, text: "NEW REPORT" });
    now = 100;
    game.update(idle);
    expect(game.decision.active).toBe(false);
    now += 1000;
    game.update(idle);
    expect(game.chat.lines()[0]?.trim()).toBe("NEW REPORT");
  });

  it("moves and selects a decision with latched controls", () => {
    let now = 0;
    const game = new Game(() => now);
    game.decision.start(DecisionType.IncomingMissile);
    game.decision.update(idle);
    game.decision.update({ vertical: 1, fire: false, any: true });
    game.decision.update({ vertical: 1, fire: false, any: true });
    expect(game.decision.selectedOption).toBe(1);
    game.decision.update(idle);
    game.decision.update({ vertical: 0, fire: true, any: true });
    expect(game.decision.active).toBe(false);
    now = 2000;
    game.chat.update();
    expect(game.chat.lines()[0]?.trim()).toBe("SELECTED: LAUNCH ONE ICBM");
  });
});
