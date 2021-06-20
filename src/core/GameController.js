
const cellSizeArr = [0.05, 0.08, 0.1, 0.15, 0.2, 0.3, 0.4,
    0.6, 0.8, 1, 1.3, 1.7, 2, 2.5, 3, 4, 5,
    7, 10, 14, 18, 22, 26, 30, 35, 40, 45, 50];

export default class GameController {
    constructor(gameData, gameScreen) {
        this.gameData = gameData;
        this.gameScreen = gameScreen;
        this.cellSizeIndex = 15;
        this.changeCellSize();
        this.reCalculateMap = null; //用于控制在每一轮迭代中，每个点的状态最多被计算一次
    }

    changeCellSize() {
        this.gameData.options.cellSize = cellSizeArr[this.cellSizeIndex];
    }

    start() {
        setInterval(() => this.iteration(), 1000 / this.gameData.options.iterateTimesPreSeconds);
    }

    /**
     * 每次迭代，只需要计算所有活细胞及其周围八个格子的新状态即可
     * 可能存在重复计算，因此使用reCalculateMap记录已经计算过的格子，防止重算
     */
    iteration() {
        if (this.gameData.options.pause) {
            this.putHumanAliveCache();
            return;
        }
        this.reCalculateMap = new Map();
        let lastIterationChangedCells = this.gameData.lastIterationChangedCells;
        let newData = new Map();
        let currentIterationChangedCells = [];
        for (let cell of lastIterationChangedCells) {
            let x = cell.x;
            let y = cell.y;
            this.calculateCell(x - 1, y - 1, newData, currentIterationChangedCells);
            this.calculateCell(x - 1, y, newData, currentIterationChangedCells);
            this.calculateCell(x - 1, y + 1, newData, currentIterationChangedCells);
            this.calculateCell(x , y - 1, newData, currentIterationChangedCells);
            this.calculateCell(x, y, newData, currentIterationChangedCells);
            this.calculateCell(x, y + 1, newData, currentIterationChangedCells);
            this.calculateCell(x + 1, y - 1, newData, currentIterationChangedCells);
            this.calculateCell(x + 1, y, newData, currentIterationChangedCells);
            this.calculateCell(x + 1, y + 1, newData, currentIterationChangedCells);
        }
        for (let [key, value] of this.gameData.aliveCellsMap) {
            if (!this.reCalculateMap.has(key)) {
                newData.set(key, value);
            }
        }
        this.gameData.aliveCellsMap = newData;
        this.gameData.lastIterationChangedCells = currentIterationChangedCells;
        this.putHumanAliveCache();
    }

    calculateCell(x, y, newData, currentIterationChangedCells) {
        let key = x * 100000000 + y;
        if (this.reCalculateMap.has(key)) {
            return;
        }
        this.reCalculateMap.set(key, 1);

        if (this.isAliveInNextTime(x, y)) {
            this.setCell(x , y , newData);
            if (!this.gameData.hasAliveCell(x, y)) {
                currentIterationChangedCells.push({x, y});
            }
        } else {
            if (this.gameData.hasAliveCell(x, y)) {
                currentIterationChangedCells.push({x, y});
            }
        }
    }

    isAliveInNextTime(x, y) {
        let count = 0;
        this.gameData.hasAliveCell(x - 1, y - 1) && count++;
        this.gameData.hasAliveCell(x - 1, y) && count++;
        this.gameData.hasAliveCell(x - 1, y + 1) && count++;
        this.gameData.hasAliveCell(x, y - 1) && count++;
        this.gameData.hasAliveCell(x, y + 1) && count++;
        this.gameData.hasAliveCell(x + 1, y - 1) && count++;
        this.gameData.hasAliveCell(x + 1, y) && count++;
        this.gameData.hasAliveCell(x + 1, y + 1) && count++;

        //活细胞傍边不是2或3个活细胞，则死亡
        if (this.gameData.hasAliveCell(x, y)) {
            return count === 2 || count === 3;
        }

        //死细胞周围有三个活细胞时，则新生
        return count === 3;
    }

    setCell(x, y, map){
        map.set(x * 100000000 + y, {x, y});
    }

    putHumanAliveCache() {
        for (let {x, y} of this.gameData.humanSetStateCacheArray) {
            let key = x * 100000000 + y;
            if (this.gameData.aliveCellsMap.get(key) != null) {
                this.gameData.aliveCellsMap.delete(key);
            } else {
                this.setCell(x, y, this.gameData.aliveCellsMap);
            }
            this.gameData.lastIterationChangedCells.push({x, y});
        }
        this.gameData.humanSetStateCacheArray.splice(0, this.gameData.humanSetStateCacheArray.length);
    }

    initDefaultListener() {
        window.document.body.addEventListener("keypress", (event) => {
            let lookAt = this.gameData.options.lookAt;
            let cellSize = this.gameData.options.cellSize;
            if (event.key === '+' || event.key === '=') {
                this.cellSizeIndex += this.cellSizeIndex === cellSizeArr.length - 1 ? 0 : 1;
                this.changeCellSize();
            } else if (event.key === '-' || event.key === '_') {
                this.cellSizeIndex -= this.cellSizeIndex === 0 ? 0 : 1;
                this.changeCellSize();
            } else if (event.key === 'W' || event.key === 'w') {
                lookAt.y -= Math.max(1, Math.floor(30 / cellSize));
            } else if (event.key === 'A' || event.key === 'a') {
                lookAt.x -= Math.max(1, Math.floor(30 / cellSize));
            } else if (event.key === 'S' || event.key === 's') {
                lookAt.y += Math.max(1, Math.floor(30 / cellSize));
            } else if (event.key === 'D' || event.key === 'd') {
                lookAt.x += Math.max(1, Math.floor(30 / cellSize));
            } else if (event.key === 'P' || event.key === 'p') {
                this.gameData.options.pause = !this.gameData.options.pause;
            }
        });

        this.gameScreen.getCanvas().addEventListener("mouseup", (event) => {
            let cellSize = this.gameData.options.cellSize;
            let canvas = this.gameScreen.getCanvas();
            let lookAt = this.gameData.options.lookAt;
            if (event.button !== 0 || cellSize < 1) {
                return;
            }

            let widthCount = canvas.width / cellSize;
            let heightCount = canvas.height / cellSize;
            let x = Math.floor(event.x / cellSize) - Math.floor(widthCount / 2) + lookAt.x;
            let y = Math.floor(event.y / cellSize) - Math.floor(heightCount / 2) + lookAt.y;
            //用户点击之后，不能直接修改细胞状态，因为此时可能正好迭代到一半
            if (this.gameData.selectedShape == null) {
                this.gameData.humanSetStateCacheArray.push({x, y});
            } else {
                //用户选择了图形点击时，放置的是整个图形
                for (let y = 0; y < this.gameData.selectedShape.length; y++) {
                    for (let x = 0; x < this.gameData.selectedShape[y].length; x++) {
                        if (this.gameData.selectedShape[y][x] !== 1) {
                            continue;
                        }
                        let xp = this.gameData.mousePosition.x + x;
                        let yp = this.gameData.mousePosition.y + y;
                        this.gameData.humanSetStateCacheArray.push({x: xp, y: yp});
                    }
                }
                //按住shift键时为重复放置，否则为一次性的
                if (!event.shiftKey) {
                    this.gameData.selectedShape = null;
                }
            }
        });

        this.gameScreen.getCanvas().addEventListener("mousemove", (event) => {
            let cellSize = this.gameData.options.cellSize;
            let canvas = this.gameScreen.getCanvas();
            let lookAt = this.gameData.options.lookAt;
            let widthCount = canvas.width / cellSize;
            let heightCount = canvas.height / cellSize;
            let x = Math.floor(event.x / cellSize) - Math.floor(widthCount / 2) + lookAt.x;
            let y = Math.floor(event.y / cellSize) - Math.floor(heightCount / 2) + lookAt.y;
            this.gameData.mousePosition.x = x;
            this.gameData.mousePosition.y = y;
        })
    }
}