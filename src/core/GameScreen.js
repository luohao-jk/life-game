export default class GameScreen {
    constructor(width, height, gameData) {
        let canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        this.canvas = canvas;
        this.gameData = gameData;
    }

    getCanvas() {
        return this.canvas;
    }

    start() {
        this.repaint();
        this.start = () => {
            throw new Error("已经启动过了");
        }
    }

    repaint() {
        let ctx = this.getCanvas().getContext("2d");
        let canvas = this.getCanvas();
        let cellSize = this.gameData.options.cellSize;
        let aliveCellsMap = this.gameData.aliveCellsMap;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        let widthCount = canvas.width / cellSize;
        let heightCount = canvas.height / cellSize;
        let leftLimit = -(Math.floor(widthCount / 2)) + this.gameData.options.lookAt.x;
        let rightLimit = (Math.floor(widthCount / 2)) + this.gameData.options.lookAt.x;
        let topLimit = -(Math.floor(heightCount / 2)) + this.gameData.options.lookAt.y;
        let botLimit = Math.floor(heightCount / 2) + this.gameData.options.lookAt.y;
        let screenLeftX = Math.floor(widthCount / 2) - this.gameData.options.lookAt.x;
        let screenTopY = Math.floor(heightCount / 2) - this.gameData.options.lookAt.y;

        let padding = cellSize <= 3 ? 0 : 1;
        let fillSize = Math.max(0.4, cellSize - padding);

        for (let [, curCell] of aliveCellsMap) {
            if (curCell.x >= leftLimit && curCell.x <= rightLimit && curCell.y >= topLimit && curCell.y <= botLimit) {
                ctx.fillRect((curCell.x + screenLeftX) * cellSize, (curCell.y + screenTopY) * cellSize, fillSize, fillSize);
            }
        }
        ctx.fillStyle = "#FFFF00";
        if (this.gameData.selectedShape != null) {
            for (let y = 0; y < this.gameData.selectedShape.length; y++) {
                for (let x = 0; x < this.gameData.selectedShape[y].length; x++) {
                    if (this.gameData.selectedShape[y][x] !== 1) {
                        continue;
                    }
                    let xp = this.gameData.mousePosition.x + x;
                    let yp = this.gameData.mousePosition.y + y;
                    ctx.fillRect((xp + screenLeftX) * cellSize, (yp + screenTopY) * cellSize, fillSize, fillSize);
                }
            }
        }
        requestAnimationFrame(() => this.repaint());
    }
}