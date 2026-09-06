import { DecisionType, type ControlState, type DecisionResult } from "./types";

export const decisionOptions = ["DO NOTHING", "LAUNCH ONE ICBM", "LAUNCH EVERYTHING"] as const;

export class DecisionController {
  public active = false;
  public type: DecisionType | undefined;
  public selectedOption = 0;
  public result: DecisionResult | undefined;

  private moveReady = true;
  private fireReady = false;

  public constructor(private readonly onSelected: (text: string) => void) {}

  public start(type: DecisionType): void {
    this.cancel();
    this.active = true;
    this.type = type;
    this.selectedOption = 0;
    this.result = undefined;
    this.moveReady = true;
    this.fireReady = false;
  }

  public cancel(): void {
    this.active = false;
    this.type = undefined;
  }

  public update(control: ControlState): void {
    if (!this.active) {
      return;
    }

    if (control.vertical === 0) {
      this.moveReady = true;
    } else if (this.moveReady) {
      this.selectedOption = Math.max(0, Math.min(decisionOptions.length - 1, this.selectedOption + control.vertical));
      this.moveReady = false;
    }

    if (!control.fire) {
      this.fireReady = true;
    } else if (this.fireReady) {
      this.select();
    }
  }

  private select(): void {
    if (!this.active || this.type === undefined) {
      return;
    }
    const option = this.selectedOption;
    this.result = { type: this.type, option };
    this.cancel();
    this.onSelected(`SELECTED: ${decisionOptions[option]}`);
  }
}
