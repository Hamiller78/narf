import { CHAT_FIRST_ROW, DECISION_FIRST_ROW, TEXT_COLUMNS, TEXT_ROWS } from "./constants";
import { decisionOptions } from "./decision";
import type { Game } from "./game";

type Color = "white" | "yellow" | "red";

interface Cell {
  readonly character: string;
  readonly color: Color;
}

export class Terminal {
  private readonly context: CanvasRenderingContext2D;
  private previous: Cell[] = [];

  public constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas rendering is unavailable.");
    }
    this.context = context;
    this.context.textBaseline = "middle";
  }

  public draw(game: Game): void {
    const screen = createScreen();
    if (game.phase !== "running") {
      writeCentered(screen, 4, "Nuclear Attack");
      writeCentered(screen, 6, "Reaction Failsafe");
      writeCentered(screen, 8, "(N.A.R.F.)");
      write(screen, 11, 0, "Connecting to NORAD...");
      write(screen, 12, 0, "User: RONALD REAGAN");
    } else {
      drawMainScreen(screen, game);
    }
    this.paint(screen);
  }

  private paint(screen: Cell[]): void {
    const cellWidth = this.canvas.width / TEXT_COLUMNS;
    const cellHeight = this.canvas.height / TEXT_ROWS;
    this.context.font = `${Math.floor(cellHeight * 0.72)}px "Courier New", monospace`;
    for (let index = 0; index < screen.length; index += 1) {
      const cell = screen[index];
      const old = this.previous[index];
      if (!cell || (old && old.character === cell.character && old.color === cell.color)) {
        continue;
      }
      const column = index % TEXT_COLUMNS;
      const row = Math.floor(index / TEXT_COLUMNS);
      this.context.fillStyle = "#3333aa";
      this.context.fillRect(column * cellWidth, row * cellHeight, cellWidth + 1, cellHeight + 1);
      this.context.fillStyle = palette[cell.color];
      this.context.fillText(cell.character, column * cellWidth + 2, row * cellHeight + cellHeight / 2 + 1);
    }
    this.previous = screen;
  }
}

function drawMainScreen(screen: Cell[], game: Game): void {
  write(screen, 0, 0, `ICBMS:   ${game.icbms}`);
  write(screen, 1, 0, `SUBS:    ${game.submarines}`);
  write(screen, 2, 0, `BOMBERS: ${game.bombers}`);
  write(screen, 0, TEXT_COLUMNS - 12, `DEFCON:   ${game.defcon}`);
  const countdown = game.secondsUntilReportedImpact();
  write(screen, 1, TEXT_COLUMNS - 12, countdown === undefined ? "RED:  --:--" : `RED:  ${formatCountdown(countdown)}`, "red");
  write(screen, 2, TEXT_COLUMNS - 12, "BLUE: --:--");
  write(screen, 3, 0, "-".repeat(TEXT_COLUMNS));
  writeCentered(screen, 3, ` ${game.currentTime} `);

  game.chat.lines().forEach((line, index) => write(screen, CHAT_FIRST_ROW + index, 0, line));
  if (game.decision.active) {
    decisionOptions.forEach((option, index) => {
      const marker = index === game.decision.selectedOption ? "*" : " ";
      write(screen, DECISION_FIRST_ROW + index, 0, `${marker} ${option}`);
    });
  }
  write(screen, TEXT_ROWS - 2, 0, "***", "yellow");
  write(screen, TEXT_ROWS - 2, TEXT_COLUMNS - 3, "***", "yellow");
}

function createScreen(): Cell[] {
  return Array.from({ length: TEXT_COLUMNS * TEXT_ROWS }, () => ({ character: " ", color: "white" }));
}

function write(screen: Cell[], row: number, column: number, text: string, color: Color = "white"): void {
  for (let offset = 0; offset < text.length && column + offset < TEXT_COLUMNS; offset += 1) {
    const character = text[offset];
    if (character !== undefined && row >= 0 && row < TEXT_ROWS && column + offset >= 0) {
      screen[row * TEXT_COLUMNS + column + offset] = { character, color };
    }
  }
}

function writeCentered(screen: Cell[], row: number, text: string): void {
  write(screen, row, Math.floor((TEXT_COLUMNS - text.length) / 2), text);
}

function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

const palette: Record<Color, string> = {
  white: "#f3f3f3",
  yellow: "#e6e66a",
  red: "#ff6b6b"
};
