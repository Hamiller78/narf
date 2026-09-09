import { TEXT_CHARACTER_DELAY_MS, EXAMPLE_MISSILE_SECONDS, REPORT_DELAY_MAX_SECONDS, REPORT_DELAY_MIN_SECONDS } from "./constants";
import { GameClock } from "./clock";
import { DecisionController } from "./decision";
import { TextQueue } from "./textQueue";
import { DecisionType, WorldEventType, type ControlState, type ReportEvent, type WorldEvent } from "./types";

export type GamePhase = "intro" | "wait-for-release" | "running";

export class Game {
  public readonly chat: TextQueue;
  public readonly decision = new DecisionController((text) => this.chat.add(text, TEXT_CHARACTER_DELAY_MS));
  public readonly clock: GameClock;

  public phase: GamePhase = "intro";
  public icbms = 500;
  public submarines = 50;
  public bombers = 100;
  public defcon = 1;
  public currentTime = "11:47:30";

  public readonly worldEvents: WorldEvent[] = [];
  public readonly reports: ReportEvent[] = [];
  public readonly reportedImpactTimes: number[] = [];

  public constructor(
    private readonly now: () => number = () => performance.now(),
    private readonly random: () => number = Math.random
  ) {
    this.clock = new GameClock(now);
    this.chat = new TextQueue(now);
  }

  public update(control: ControlState): void {
    if (this.phase === "intro") {
      if (control.any) {
        this.phase = "wait-for-release";
      }
      return;
    }
    if (this.phase === "wait-for-release") {
      if (!control.any) {
        this.startGame();
      }
      return;
    }

    this.checkWorldEvents();
    this.checkReports();
    this.decision.update(control);
    this.chat.update();
    this.currentTime = this.clock.takeUpdate() ?? this.currentTime;
  }

  public startGame(): void {
    this.phase = "running";
    this.chat.clear();
    this.clock.set("11:47:30");
    this.currentTime = this.clock.current();
    this.addWorldEvent({
      type: WorldEventType.MissileHitsOurCity,
      time: this.now() + EXAMPLE_MISSILE_SECONDS * 1000,
      text: "WASHINGTON D.C.",
      value: 0
    });
  }

  public addWorldEvent(event: WorldEvent): void {
    insertSorted(this.worldEvents, event, (item) => item.time);
    if (event.type === WorldEventType.MissileHitsOurCity) {
      this.addReport(`INCOMING MISSILE: ${event.text}`, event.time);
    }
  }

  public addReport(text: string, impactTime?: number): boolean {
    const delaySeconds = REPORT_DELAY_MIN_SECONDS + Math.floor(this.random() * (REPORT_DELAY_MAX_SECONDS - REPORT_DELAY_MIN_SECONDS + 1));
    return this.scheduleReport({ time: this.now() + delaySeconds * 1000, text, ...(impactTime === undefined ? {} : { impactTime }) });
  }

  public scheduleReport(report: ReportEvent): boolean {
    if (this.reports.length >= 20) {
      return false;
    }
    insertSorted(this.reports, report, (item) => item.time);
    return true;
  }

  public secondsUntilReportedImpact(): number | undefined {
    this.removeExpiredReportedImpacts();
    const impact = this.reportedImpactTimes[0];
    return impact === undefined ? undefined : Math.max(0, Math.floor((impact - this.now()) / 1000));
  }

  private checkWorldEvents(): void {
    while ((this.worldEvents[0]?.time ?? Number.POSITIVE_INFINITY) <= this.now()) {
      const event = this.worldEvents.shift();
      if (event?.type === WorldEventType.MissileHitsOurCity) {
        this.addReport(`MISSILE HIT: ${event.text}`);
      }
    }
  }

  private checkReports(): void {
    while ((this.reports[0]?.time ?? Number.POSITIVE_INFINITY) <= this.now()) {
      const report = this.reports.shift();
      if (!report) {
        return;
      }
      this.decision.cancel();
      this.chat.add(report.text, TEXT_CHARACTER_DELAY_MS);
      if (report.impactTime !== undefined && report.impactTime > this.now()) {
        insertSorted(this.reportedImpactTimes, report.impactTime, (item) => item);
        this.chat.add("ADVISOR: SELECT OUR RESPONSE", TEXT_CHARACTER_DELAY_MS);
        this.decision.start(DecisionType.IncomingMissile);
      }
    }
  }

  private removeExpiredReportedImpacts(): void {
    while ((this.reportedImpactTimes[0] ?? Number.POSITIVE_INFINITY) <= this.now()) {
      this.reportedImpactTimes.shift();
    }
  }
}

function insertSorted<T>(items: T[], item: T, key: (value: T) => number): void {
  const index = items.findIndex((existing) => key(item) < key(existing));
  items.splice(index < 0 ? items.length : index, 0, item);
}
