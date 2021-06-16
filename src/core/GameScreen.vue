<template>
  <div id="screen">
  </div>
</template>

<script>
import huaXianJi from "@/life/huaXianJi";
export default {
  name: "GameScreen",
  data() {
    return {
      canvas: null,
      ctx: null,
      cellSizeIndex: 19,
      cellSizeArr: [0.05, 0.08, 0.1, 0.15, 0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.3, 1.7, 2, 2.5, 3, 4, 5, 7, 10, 14, 18, 22, 26, 30, 35, 40, 45, 50],
      cellSize: 7,
      lookAt: {
        x: 0,
        y: 0,
      },
      data: new Map(),
      humanSetAliveCache: [],
      pause: false,
    }
  },
  mounted() {
    this.cellSize = this.cellSizeArr[this.cellSizeIndex];
    this.canvas = document.createElement("canvas");
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.ctx = this.canvas.getContext("2d");
    document.getElementById("screen").appendChild(this.canvas);
    this.initData();
    this.repaint();
    setInterval(() => this.lifeCycle(), 50);
    this.setListener();
  },
  methods: {
    initData() {
      let huaXianJi1 = huaXianJi("down");
      let huaXianJi2 = huaXianJi("top");
      let huaXianJi3 = huaXianJi("right");
      let huaXianJi4 = huaXianJi("left");
      //let tianData = tian();
      let outIndex = 200;
      for (let i = 40; i < outIndex; i+=5) {
        for (let j = -outIndex; j < -40; j+=5) {
          for(let {x, y} of huaXianJi1) {
            this.setCell((x + i), y + j);
          }
        }
      }

      for (let i = -outIndex; i < -40; i+=5) {
        for (let j = 40; j < outIndex; j+=5) {
          for(let {x, y} of huaXianJi2) {
            this.setCell((x + i), y + j);
          }
        }
      }

      for (let i = -outIndex; i < -40; i+=5) {
        for (let j = -outIndex; j < -40; j+=5) {
          for(let {x, y} of huaXianJi3) {
            this.setCell((x + i), y + j);
          }
        }
      }

      for (let i = 40; i < outIndex; i+=5) {
        for (let j = 40; j < outIndex; j+=5) {
          for(let {x, y} of huaXianJi4) {
            this.setCell((x + i), y + j);
          }
        }
      }
    },
    lifeCycle() {
      !this.pause && this.reset();
      this.putHumanAliveCache();
      this.repaint();
    },
    putHumanAliveCache() {
      for (let {x, y} of this.humanSetAliveCache) {
        let key = x * 100000000 + y;
        if (this.data.get(key) != null) {
          this.data.delete(key);
        } else {
          this.setCell(x, y);
        }
      }
      this.humanSetAliveCache.splice(0, this.humanSetAliveCache.length);
    },
    reset() {
      let hasCell = (x, y) => {
        let key = x * 100000000 + y;
        return this.data.get(key) != null;
      };

      let resetMap = new Map();
      let isAliveInNextTime = (x, y) => {
        let key = x * 100000000 + y;
        if (resetMap.has(key)) {
          return;
        }
        resetMap.set(key, 1);
        let count = 0;
        hasCell(x - 1, y - 1) && count++;
        hasCell(x - 1, y) && count++;
        hasCell(x - 1, y + 1) && count++;
        hasCell(x, y - 1) && count++;
        hasCell(x, y + 1) && count++;
        hasCell(x + 1, y - 1) && count++;
        hasCell(x + 1, y) && count++;
        hasCell(x + 1, y + 1) && count++;

        //活细胞傍边不是2或3个活细胞，则死亡
        if (hasCell(x, y)) {
          return count === 2 || count === 3;
        }

        //死细胞周围有三个活细胞时，则新生
        return count === 3;
      }

      let newData = new Map();
      for (let [, {x, y}] of this.data) {
        isAliveInNextTime(x - 1, y - 1) && this.setCell(x - 1, y - 1, newData);
        isAliveInNextTime(x - 1, y) && this.setCell(x - 1, y, newData);
        isAliveInNextTime(x - 1, y + 1) && this.setCell(x - 1, y + 1, newData);
        isAliveInNextTime(x, y - 1) && this.setCell(x, y - 1, newData);
        isAliveInNextTime(x, y) && this.setCell(x, y, newData);
        isAliveInNextTime(x, y + 1) && this.setCell(x, y + 1, newData);
        isAliveInNextTime(x + 1, y - 1) && this.setCell(x + 1, y - 1, newData);
        isAliveInNextTime(x + 1, y) && this.setCell(x + 1, y, newData);
        isAliveInNextTime(x + 1, y + 1) && this.setCell(x + 1, y + 1, newData);
      }
      this.data = newData;
    },
    setCell(x, y, map = this.data) {
      map.set(x * 100000000 + y, {x, y});
    },
    repaint() {
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#FFF";
      let widthCount = this.canvas.width / this.cellSize;
      let heightCount = this.canvas.height / this.cellSize;
      let leftLimit = -(Math.floor(widthCount / 2)) + this.lookAt.x;
      let rightLimit = (Math.floor(widthCount / 2)) + this.lookAt.x;
      let topLimit = -(Math.floor(heightCount / 2)) + this.lookAt.y;
      let botLimit = Math.floor(heightCount / 2) + this.lookAt.y;
      let screenLeftX = Math.floor(widthCount / 2) - this.lookAt.x;
      let screenTopY = Math.floor(heightCount / 2) - this.lookAt.y;

      let padding = this.cellSize <= 3 ? 0 : 1;
      let fillSize = Math.max(0.4, this.cellSize - padding);
      for (let [, curCell] of this.data) {
        if (curCell.x >= leftLimit && curCell.x <= rightLimit && curCell.y >= topLimit && curCell.y <= botLimit) {
          this.ctx.fillRect((curCell.x + screenLeftX) * this.cellSize, (curCell.y + screenTopY) * this.cellSize, fillSize, fillSize);
        }
      }
    },
    setListener() {
      window.document.body.addEventListener("keypress", (event) => {
        if (event.key === '+' || event.key === '=') {
          this.cellSizeIndex += this.cellSizeIndex === this.cellSizeArr.length - 1 ? 0 : 1;
          this.cellSize = this.cellSizeArr[this.cellSizeIndex];
        } else if (event.key === '-' || event.key === '_') {
          this.cellSizeIndex -= this.cellSizeIndex === 0 ? 0 : 1;
          this.cellSize = this.cellSizeArr[this.cellSizeIndex];
        } else if (event.key === 'W' || event.key === 'w') {
          this.lookAt.y -= Math.max(1, Math.floor(30 / this.cellSize));
        } else if (event.key === 'A' || event.key === 'a') {
          this.lookAt.x -= Math.max(1, Math.floor(30 / this.cellSize));
        } else if (event.key === 'S' || event.key === 's') {
          this.lookAt.y += Math.max(1, Math.floor(30 / this.cellSize));
        } else if (event.key === 'D' || event.key === 'd') {
          this.lookAt.x += Math.max(1, Math.floor(30 / this.cellSize));
        } else if (event.key === 'P' || event.key === 'p') {
          this.pause = !this.pause;
        }
      });

      document.getElementById("screen").addEventListener("mouseup", (event) => {
        if (event.button !== 0 || this.cellSize < 1) {
          return;
        }

        let widthCount = this.canvas.width / this.cellSize;
        let heightCount = this.canvas.height / this.cellSize;
        let x = Math.floor(event.x / this.cellSize) - Math.floor(widthCount / 2) + this.lookAt.x;
        let y = Math.floor(event.y / this.cellSize) - Math.floor(heightCount / 2) + this.lookAt.y;
        this.humanSetAliveCache.push({x, y});
      })
    }
  }
}
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
}
</style>