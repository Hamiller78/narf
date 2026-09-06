import "./style.css";
import { Game } from "./game";
import { BrowserInput } from "./input";
import { Terminal } from "./terminal";

const canvas = document.querySelector<HTMLCanvasElement>("#terminal");
if (!canvas) {
  throw new Error("Terminal canvas not found.");
}

await document.fonts.load('22px "Departure Mono"');

const game = new Game();
const input = new BrowserInput();
const terminal = new Terminal(canvas);

function frame(): void {
  game.update(input.read());
  terminal.draw(game);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
