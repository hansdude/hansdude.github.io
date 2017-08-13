module Goban {
  export interface Point {
    x: number;
    y: number;
  }

  export enum Player { White, Black }

  export interface Stone {
    point: Point;
    player: Player;
  }

  export interface Settings {
    lines: number;
    moveListener: (Point) => void;
    canvas: HTMLCanvasElement;
  }

  export class Canvas {
    private state : Array<Stone> = [];
    private boardPainter : BoardPainter;
    private coordinates : Coordinates;

    constructor(private settings : Settings) {
      this.coordinates = new Coordinates(this.settings.lines);

      this.attachClickEvent();

      this.boardPainter =
          new BoardPainter(this.coordinates, this.settings.canvas.getContext("2d"));

      this.resize();
    }

    setStones(value : Array<Stone>) {
      this.state = value;
      this.boardPainter.drawBoard(this.state);
    }

    resize() {
      this.coordinates.size =
          Math.min(this.settings.canvas.width, this.settings.canvas.height);
      this.boardPainter.drawBoard(this.state);
    }

    private attachClickEvent() {
      this.settings.canvas.addEventListener("click", event => {
        if (event.button === 0) {
          const {x, y} =
              this.coordinates.fromRaw({x: event.offsetX, y: event.offsetY});
          if (0 <= x && x < this.settings.lines
              && 0 <= y && y < this.settings.lines) {
            this.settings.moveListener({x, y});
          }
        }
      });
    }
  }

  class Coordinates {
    size: number;

    constructor(public lines : number) {}

    increment() {
      return this.size / (this.lines + 1);
    }

    toRaw({x, y}) {
      return {
        x: (x + 1) * this.increment(),
        y: (y + 1) * this.increment(),
      };
    }

    fromRaw({x, y}) {
      return {
        x: this.fromRawScalar(x),
        y: this.fromRawScalar(y),
      };
    }

    private fromRawScalar(scalar) {
      const result = Math.round((scalar - this.increment()) / this.increment());
      // Get rid of negative zeros (oh javascript).
      return result ? result : 0;
    }
  }

  class BoardPainter {
    private settings = {
      backgroundColor: "#e9c372",
      lineColor: "black",
      lineWidth: 2,
      blackColor: "black",
      whiteColor: "white",
      starRadius: 5,
    };

    constructor(
        public coordinates : Coordinates,
        private context : CanvasRenderingContext2D) {}

    public drawBoard(stones : Array<Stone>) {
      this.drawBackground();
      this.drawLines();
      this.drawStars();
      stones.forEach(stone => this.drawStone(stone));
    }

    private drawBackground() {
      this.context.fillStyle = this.settings.backgroundColor;
      this.context.fillRect(0, 0, this.coordinates.size, this.coordinates.size);
    }

    private drawLines() {
      const lastLine = this.coordinates.lines - 1;

      // Draw the vertical lines.
      for (let x = 0; x < this.coordinates.lines; x++) {
        this.drawLine({x, y: 0}, {x, y: lastLine});
      }

      // Draw the horizontal lines.
      for (let y = 0; y < this.coordinates.lines; y++) {
        this.drawLine({x: 0, y}, {x: lastLine, y});
      }
    }

    private drawLine(start, end) {
      const rawStart = this.coordinates.toRaw(start);
      const rawEnd = this.coordinates.toRaw(end);
      this.context.lineCap = "round";
      this.context.lineWidth = this.settings.lineWidth;
      this.context.strokeStyle = this.settings.lineColor;
      this.context.beginPath();
      this.context.moveTo(rawStart.x, rawStart.y);
      this.context.lineTo(rawEnd.x, rawEnd.y);
      this.context.stroke();
    }

    private drawStars() {
      switch (this.coordinates.lines) {
        case 9:
          {
            let positions = [2, 6];
            positions.forEach(x => {
              positions.forEach(y => {
                this.drawStar({x, y});
              });
            });
            this.drawStar({x: 4, y: 4});
            break;
          }
        case 13:
          {
            let positions = [3, 6, 9];
            positions.forEach(x => {
              positions.forEach(y => {
                this.drawStar({x, y});
              });
            });
            break;
          }
        case 19:
          {
            let positions = [3, 9, 15];
            positions.forEach(x => {
              positions.forEach(y => {
                this.drawStar({x, y});
              });
            });
            break;
          }
      }
    }

    private drawStar(point : Point) {
      const rawPoint = this.coordinates.toRaw(point);
      this.context.fillStyle = this.settings.lineColor;
      this.context.strokeStyle = this.settings.lineColor;
      this.context.beginPath();
      this.context.ellipse(
          rawPoint.x,
          rawPoint.y,
          this.settings.starRadius /* radiusX */,
          this.settings.starRadius /* radiusY */,
          2 * Math.PI /* rotation */,
          0 /* startAngle */,
          2 * Math.PI /* endAngle */);
      this.context.fill();
    }

    private drawStone(stone : Stone) {
      const rawPoint = this.coordinates.toRaw(stone.point);
      this.context.lineWidth = this.settings.lineWidth;
      this.context.strokeStyle = this.settings.lineColor;
      this.context.fillStyle = this.toColor(stone.player);
      this.context.beginPath();
      this.context.ellipse(
          rawPoint.x,
          rawPoint.y,
          this.coordinates.increment() * .4 /* radiusX */,
          this.coordinates.increment() * .4 /* radiusY */,
          2 * Math.PI /* rotation */,
          0 /* startAngle */,
          2 * Math.PI /* endAngle */);
      this.context.stroke();
      this.context.fill();
    }

    private toColor(player : Player) {
      switch(player) {
        case Player.White:
          return this.settings.whiteColor;
        case Player.Black:
          return this.settings.blackColor;
      }
    }
  }
}
