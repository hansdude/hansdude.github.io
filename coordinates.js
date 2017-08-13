var Goban;
(function (Goban) {
    var Player;
    (function (Player) {
        Player[Player["White"] = 0] = "White";
        Player[Player["Black"] = 1] = "Black";
    })(Player = Goban.Player || (Goban.Player = {}));
    var Coordinates = (function () {
        function Coordinates(lines, size, starRadius) {
            this.lines = lines;
            this.size = size;
            this.starRadius = starRadius;
            this.increment = this.size / (this.lines + 1);
            this.start = this.increment;
            this.end = this.size - this.increment;
        }
        Coordinates.prototype.toRaw = function (_a) {
            var x = _a.x, y = _a.y;
            return {
                x: x * this.increment + this.start,
                y: y * this.increment + this.start
            };
        };
        Coordinates.prototype.fromRaw = function (_a) {
            var x = _a.x, y = _a.y;
            return {
                x: this.fromRawScalar(x),
                y: this.fromRawScalar(y)
            };
        };
        Coordinates.prototype.fromRawScalar = function (scalar) {
            return Math.abs(Math.round((scalar - this.start) / this.increment));
        };
        return Coordinates;
    }());
    Goban.Coordinates = Coordinates;
    var BoardPainter = (function () {
        function BoardPainter(coordinates, context) {
            this.coordinates = coordinates;
            this.context = context;
        }
        BoardPainter.prototype.drawBoard = function (stones) {
            var _this = this;
            this.drawBackground();
            this.drawLines();
            this.drawStars();
            stones.forEach(function (stone) { return _this.drawStone(stone); });
        };
        BoardPainter.prototype.drawBackground = function () {
            this.context.fillStyle = "#e9c372";
            this.context.fillRect(0, 0, this.coordinates.size, this.coordinates.size);
        };
        BoardPainter.prototype.drawLines = function () {
            var lastLine = this.coordinates.lines - 1;
            // Draw the vertical lines.
            for (var x = 0; x < this.coordinates.lines; x++) {
                this.drawLine({ x: x, y: 0 }, { x: x, y: lastLine });
            }
            // Draw the horizontal lines.
            for (var y = 0; y < this.coordinates.lines; y++) {
                this.drawLine({ x: 0, y: y }, { x: lastLine, y: y });
            }
        };
        BoardPainter.prototype.drawLine = function (start, end) {
            var rawStart = this.coordinates.toRaw(start);
            var rawEnd = this.coordinates.toRaw(end);
            //TODO: lineWidth
            this.context.lineWidth = 2;
            this.context.strokeStyle = "black";
            this.context.beginPath();
            this.context.moveTo(rawStart.x, rawStart.y);
            this.context.lineTo(rawEnd.x, rawEnd.y);
            this.context.stroke();
        };
        BoardPainter.prototype.drawStars = function () {
            var _this = this;
            switch (this.coordinates.lines) {
                case 9:
                    {
                        var positions_1 = [2, 6];
                        positions_1.forEach(function (x) {
                            positions_1.forEach(function (y) {
                                _this.drawStar({ x: x, y: y });
                            });
                        });
                        this.drawStar({ x: 4, y: 4 });
                        break;
                    }
                case 13:
                    {
                        var positions_2 = [3, 6, 9];
                        positions_2.forEach(function (x) {
                            positions_2.forEach(function (y) {
                                _this.drawStar({ x: x, y: y });
                            });
                        });
                        break;
                    }
                case 19:
                    {
                        var positions_3 = [3, 9, 15];
                        positions_3.forEach(function (x) {
                            positions_3.forEach(function (y) {
                                _this.drawStar({ x: x, y: y });
                            });
                        });
                        break;
                    }
            }
        };
        BoardPainter.prototype.drawStar = function (point) {
            var rawPoint = this.coordinates.toRaw(point);
            this.context.fillStyle = "black";
            this.context.beginPath();
            this.context.ellipse(rawPoint.x, rawPoint.y, this.coordinates.starRadius /* radiusX */, this.coordinates.starRadius /* radiusY */, 2 * Math.PI /* rotation */, 0 /* startAngle */, 2 * Math.PI /* endAngle */);
            this.context.fill();
        };
        //TODO: enum color
        BoardPainter.prototype.drawStone = function (stone) {
            var rawPoint = this.coordinates.toRaw(stone.point);
            //TODO: lineWidth
            this.context.lineWidth = 2;
            this.context.strokeStyle = "black";
            this.context.fillStyle = this.toColor(stone.player);
            this.context.beginPath();
            this.context.ellipse(rawPoint.x, rawPoint.y, this.coordinates.increment * .4 /* radiusX */, this.coordinates.increment * .4 /* radiusY */, 2 * Math.PI /* rotation */, 0 /* startAngle */, 2 * Math.PI /* endAngle */);
            this.context.stroke();
            this.context.fill();
        };
        BoardPainter.prototype.toColor = function (player) {
            switch (player) {
                case Player.White:
                    return "white";
                case Player.Black:
                    return "black";
            }
        };
        return BoardPainter;
    }());
    Goban.BoardPainter = BoardPainter;
    var BoardInput = (function () {
        function BoardInput(coordinates, canvas) {
            var _this = this;
            canvas.addEventListener("click", function (event) {
                if (event.button === 0) {
                    var _a = coordinates.fromRaw({ x: event.offsetX, y: event.offsetY }), x = _a.x, y = _a.y;
                    if (0 <= x && x < coordinates.lines && 0 <= y && y < coordinates.lines) {
                        _this.stoneClicked({ x: x, y: y });
                    }
                }
            });
        }
        BoardInput.prototype.stoneClicked = function (point) {
            //TODO
            console.log("stone clicked at", point);
        };
        return BoardInput;
    }());
    Goban.BoardInput = BoardInput;
    var Canvas = (function () {
        function Canvas(settings) {
            this.state = [];
            var context = settings.canvas.getContext("2d");
            var coordinates = new Goban.Coordinates(settings.lines, Math.min(settings.canvas.width, settings.canvas.height), 5 /* starSize */);
            this.boardPainter = new Goban.BoardPainter(coordinates, context);
            var input = new Goban.BoardInput(coordinates, settings.canvas);
            this.boardPainter.drawBoard(this.state);
        }
        Canvas.prototype.setStones = function (value) {
            this.state = value;
            this.boardPainter.drawBoard(this.state);
            //TODO: redraw on resize
        };
        return Canvas;
    }());
    Goban.Canvas = Canvas;
})(Goban || (Goban = {}));
