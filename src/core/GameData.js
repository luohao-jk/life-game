export default class GameData {
    constructor() {
        this.aliveCellsMap = new Map();
        //上次迭代时，状态发生过变化的点
        this.lastIterationChangedCells = [];
        //用户放置活细胞，先缓存起来，在迭代完全完成后再放置。
        this.humanSetStateCacheArray = [];
        this.selectedShape = null;
        this.mousePosition = {
            x: 0,
            y: 0,
        };
        this.options = {
            lookAt: {
                x: 0,
                y: 0,
            },
            cellSize: 0,
            pause: false,
            iterateTimesPreSeconds: 10, //每秒迭代次数
        };
    }

    hasAliveCell(x, y) {
        let key = x * 100000000 + y;
        return this.aliveCellsMap.get(key) != null;
    }
}