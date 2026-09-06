import type { ControlState } from "./types";

export class BrowserInput {
  private readonly keys = new Set<string>();
  private verticalPulse: -1 | 0 | 1 = 0;
  private firePulse = false;
  private anyPulse = false;

  public constructor(target: Window = window) {
    target.addEventListener("keydown", (event) => {
      if (controlledKeys.has(event.code)) {
        event.preventDefault();
      }
      this.keys.add(event.code);
      this.anyPulse = true;
      if (!event.repeat) {
        if (event.code === "ArrowUp" || event.code === "KeyW") {
          this.verticalPulse = -1;
        } else if (event.code === "ArrowDown" || event.code === "KeyS") {
          this.verticalPulse = 1;
        } else if (event.code === "Space" || event.code === "Enter") {
          this.firePulse = true;
        }
      }
    });
    target.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
    });
    target.addEventListener("blur", () => this.keys.clear());
  }

  public read(): ControlState {
    const gamepad = navigator.getGamepads?.()[0];
    const up = this.keys.has("ArrowUp") || this.keys.has("KeyW") || (gamepad?.axes[1] ?? 0) < -0.45 || gamepad?.buttons[12]?.pressed === true;
    const down = this.keys.has("ArrowDown") || this.keys.has("KeyS") || (gamepad?.axes[1] ?? 0) > 0.45 || gamepad?.buttons[13]?.pressed === true;
    const heldVertical = up === down ? 0 : up ? -1 : 1;
    const state: ControlState = {
      vertical: heldVertical || this.verticalPulse,
      fire: this.firePulse || this.keys.has("Space") || this.keys.has("Enter") || gamepad?.buttons[0]?.pressed === true,
      any: this.anyPulse || this.keys.size > 0 || gamepad?.buttons.some((button) => button.pressed) === true
    };
    this.verticalPulse = 0;
    this.firePulse = false;
    this.anyPulse = false;
    return state;
  }
}

const controlledKeys = new Set(["ArrowUp", "ArrowDown", "Space", "Enter", "KeyW", "KeyS"]);
