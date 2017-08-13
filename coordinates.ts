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

  export class Coordinates {
    public increment : number;
    private start : number;
    private end : number;

    constructor(
        public lines : number,
        public size : number,
        public starRadius : number) {
      this.increment = this.size / (this.lines + 1);
      this.start = this.increment;
      this.end = this.size - this.increment;
    }

    toRaw({x, y}) {
      return {
        x: x * this.increment + this.start,
        y: y * this.increment + this.start,
      };
    }

    fromRaw({x, y}) {
      return {
        x: this.fromRawScalar(x),
        y: this.fromRawScalar(y),
      };
    }

    private fromRawScalar(scalar) {
      return Math.abs(Math.round((scalar - this.start) / this.increment));
    }
  }

  export class BoardPainter {
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
      this.context.fillStyle = "#e9c372";
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
      //TODO: lineWidth
      this.context.lineWidth = 2;
      this.context.strokeStyle = "black";
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
      this.context.fillStyle = "black";
      this.context.beginPath();
      this.context.ellipse(
          rawPoint.x,
          rawPoint.y,
          this.coordinates.starRadius /* radiusX */,
          this.coordinates.starRadius /* radiusY */,
          2 * Math.PI /* rotation */,
          0 /* startAngle */,
          2 * Math.PI /* endAngle */);
      this.context.fill();
    }

    //TODO: enum color
    private drawStone(stone : Stone) {
      const rawPoint = this.coordinates.toRaw(stone.point);
      //TODO: lineWidth
      this.context.lineWidth = 2;
      this.context.strokeStyle = "black";
      this.context.fillStyle = this.toColor(stone.player);
      this.context.beginPath();
      this.context.ellipse(
          rawPoint.x,
          rawPoint.y,
          this.coordinates.increment * .4 /* radiusX */,
          this.coordinates.increment * .4 /* radiusY */,
          2 * Math.PI /* rotation */,
          0 /* startAngle */,
          2 * Math.PI /* endAngle */);
      this.context.stroke();
      this.context.fill();
    }

    private toColor(player : Player) {
      switch(player) {
        case Player.White:
          return "white";
        case Player.Black:
          return "black";
      }
    }
  }

  export class BoardInput {
    constructor(
        coordinates : Coordinates,
        canvas : HTMLElement) {
      canvas.addEventListener("click", event => {
        if (event.button === 0) {
          const {x, y} = coordinates.fromRaw({x: event.offsetX, y: event.offsetY});
          if (0 <= x && x < coordinates.lines && 0 <= y && y < coordinates.lines) {
            this.stoneClicked({x, y});
          }
        }
      });
    }

    stoneClicked(point : Point) {
      //TODO
      console.log("stone clicked at", point);
    }
  }

  export interface Settings {
    lines: number;
    moveListener: number;
    canvas: HTMLCanvasElement;
  }

  export class Canvas {
    private state : Array<Stone> = [];
    private boardPainter : BoardPainter;

    constructor(settings : Settings) {
      const context = settings.canvas.getContext("2d");
      const coordinates = new Goban.Coordinates(
          settings.lines,
          Math.min(settings.canvas.width, settings.canvas.height),
          5 /* starSize */);
      this.boardPainter = new Goban.BoardPainter(coordinates, context);
      const input = new Goban.BoardInput(coordinates, settings.canvas);
      this.boardPainter.drawBoard(this.state);
    }

    setStones(value : Array<Stone>) {
      this.state = value;
      this.boardPainter.drawBoard(this.state);
      //TODO: redraw on resize
    }
  }
}
