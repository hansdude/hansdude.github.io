var Goban;
(function (Goban) {
    var Player;
    (function (Player) {
        Player[Player["White"] = 0] = "White";
        Player[Player["Black"] = 1] = "Black";
    })(Player = Goban.Player || (Goban.Player = {}));
    var Canvas = (function () {
        function Canvas(settings) {
            this.settings = settings;
            this.state = [];
            this.coordinates = new Coordinates(this.settings.lines);
            this.attachClickEvent();
            this.boardPainter =
                new BoardPainter(this.coordinates, this.settings.canvas.getContext("2d"));
            this.resize();
        }
        Canvas.prototype.setStones = function (value) {
            this.state = value;
            this.boardPainter.drawBoard(this.state);
        };
        Canvas.prototype.resize = function () {
            this.coordinates.size =
                Math.min(this.settings.canvas.width, this.settings.canvas.height);
            this.boardPainter.drawBoard(this.state);
        };
        Canvas.prototype.attachClickEvent = function () {
            var _this = this;
            this.settings.canvas.addEventListener("click", function (event) {
                if (event.button === 0) {
                    var _a = _this.coordinates.fromRaw({ x: event.offsetX, y: event.offsetY }), x = _a.x, y = _a.y;
                    if (0 <= x && x < _this.settings.lines
                        && 0 <= y && y < _this.settings.lines) {
                        _this.settings.moveListener({ x: x, y: y });
                    }
                }
            });
        };
        return Canvas;
    }());
    Goban.Canvas = Canvas;
    var Coordinates = (function () {
        function Coordinates(lines) {
            this.lines = lines;
        }
        Coordinates.prototype.increment = function () {
            return this.size / (this.lines + 1);
        };
        Coordinates.prototype.toRaw = function (_a) {
            var x = _a.x, y = _a.y;
            return {
                x: (x + 1) * this.increment(),
                y: (y + 1) * this.increment()
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
            var result = Math.round((scalar - this.increment()) / this.increment());
            // Get rid of negative zeros (oh javascript).
            return result ? result : 0;
        };
        return Coordinates;
    }());
    var BoardPainter = (function () {
        function BoardPainter(coordinates, context) {
            this.coordinates = coordinates;
            this.context = context;
            this.settings = {
                backgroundColor: "#e9c372",
                lineColor: "black",
                lineWidth: 2,
                blackColor: "black",
                whiteColor: "white",
                starRadius: 5
            };
        }
        BoardPainter.prototype.drawBoard = function (stones) {
            var _this = this;
            this.drawBackground();
            this.drawLines();
            this.drawStars();
            stones.forEach(function (stone) { return _this.drawStone(stone); });
        };
        BoardPainter.prototype.drawBackground = function () {
            this.context.fillStyle = this.settings.backgroundColor;
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
            this.context.lineCap = "round";
            this.context.lineWidth = this.settings.lineWidth;
            this.context.strokeStyle = this.settings.lineColor;
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
            this.context.fillStyle = this.settings.lineColor;
            this.context.strokeStyle = this.settings.lineColor;
            this.context.beginPath();
            this.context.ellipse(rawPoint.x, rawPoint.y, this.settings.starRadius /* radiusX */, this.settings.starRadius /* radiusY */, 2 * Math.PI /* rotation */, 0 /* startAngle */, 2 * Math.PI /* endAngle */);
            this.context.fill();
        };
        BoardPainter.prototype.drawStone = function (stone) {
            var rawPoint = this.coordinates.toRaw(stone.point);
            this.context.lineWidth = this.settings.lineWidth;
            this.context.strokeStyle = this.settings.lineColor;
            this.context.fillStyle = this.toColor(stone.player);
            this.context.beginPath();
            this.context.ellipse(rawPoint.x, rawPoint.y, this.coordinates.increment() * .4 /* radiusX */, this.coordinates.increment() * .4 /* radiusY */, 2 * Math.PI /* rotation */, 0 /* startAngle */, 2 * Math.PI /* endAngle */);
            this.context.stroke();
            this.context.fill();
        };
        BoardPainter.prototype.toColor = function (player) {
            switch (player) {
                case Player.White:
                    return this.settings.whiteColor;
                case Player.Black:
                    return this.settings.blackColor;
            }
        };
        return BoardPainter;
    }());
})(Goban || (Goban = {}));
