<template>
    <div style="display: inline-block; text-align: center">
        <div ref="panel" @click="select">
        </div>
        <span style="color: deepskyblue; cursor: pointer" @click="rotate">旋转</span>
    </div>
</template>

<script>
    export default {
        name: "LifePanel",
        props: {
            name: String,
            matrix: Array,
            width: {
                type: Number,
                default: 100,
            },
            height: {
                type: Number,
                default: 100,
            },
        },
        data() {
            return {
                canvas: null
            }
        },
        mounted() {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.$refs.panel.appendChild(this.canvas);
            this.draw();
        },

        methods: {
            rotate() {
                let yLen = this.matrix.length;

                let newMatrix = [];
                for (let y = 0; y < this.matrix.length; y++) {
                    for (let x = 0; x < this.matrix[y].length; x++) {
                        if (newMatrix[x] == null) {
                            newMatrix[x] = [];
                        }
                        newMatrix[x][yLen - y - 1] = this.matrix[y][x];
                    }
                }
                this.matrix.splice(0, this.matrix.length);
                for (let i = 0; i < newMatrix.length; i++) {
                    this.matrix[i] = newMatrix[i];
                }
                this.draw();
            },
            draw() {
                let ctx = this.canvas.getContext("2d");
                let matrixWidthLen = 0;
                let matrixHeightLen = this.matrix.length;
                for (const line of this.matrix) {
                    matrixWidthLen = Math.max(line.length, matrixWidthLen);
                }

                //下面+2的目标是使四周至少有一个格子宽度的padding
                let cellSize = Math.floor(Math.min(this.width / (matrixWidthLen + 2), this.height / (matrixHeightLen + 2)));

                let widthCellNum = Math.floor(this.width / cellSize);
                let heightCellNum = Math.floor(this.height / cellSize);
                let leftPadding = Math.floor((widthCellNum - matrixWidthLen) / 2);
                let topPadding = Math.floor((heightCellNum - matrixHeightLen) / 2);

                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = "#FFF";
                let drawSize = Math.max(1, cellSize - 1);
                for (let i = 0; i < this.matrix.length; i++) {
                    for (let j = 0; j < this.matrix[i].length; j++) {
                        if (this.matrix[i][j] === 0) {
                            continue;
                        }
                        ctx.fillRect((leftPadding + j) * cellSize, (topPadding + i) * cellSize, drawSize, drawSize);
                    }
                }
            },
            select() {
                this.$emit("click", this.matrix);
            }
        }
    }
</script>
