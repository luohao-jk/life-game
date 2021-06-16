const cellSizeArr = [0.05, 0.08, 0.1, 0.15, 0.2, 0.3, 0.4,
    0.6, 0.8, 1, 1.3, 1.7, 2, 2.5, 3, 4, 5,
    7, 10, 14, 18, 22, 26, 30, 35, 40, 45, 50];

export default {
    aliveCellsMap: new Map(),
    //用户放置活细胞，先缓存起来，在迭代完全完成后再放置。
    humanSetStateCacheMap: new Map(),
    options: {
        lookAt: {
            x: 0,
            y: 0,
        },
        cellSize: 0,
        pause: false,
    },
}