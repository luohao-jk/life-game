<template>
    <div id="screen">
        <el-dialog :visible="visible" @close="visible = false" title="控制面板(按M打开/隐藏)">
            <el-tabs >
                <el-tab-pane label="稳定器">
                    <life-panel @click="select" v-for="(shape, index) in stabilizeShapes" :matrix="shape" :key="'stabilizeShape' + index" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="震荡器">
                    <life-panel @click="select" v-for="(shape, index) in concussiveShapes" :matrix="shape" :key="'concussiveShape' + index" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="飞行器">
                    <life-panel @click="select" v-for="(shape, index) in aeroShapes" :matrix="shape" :key="'concussiveShape' + index" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="复杂图形">
                    <life-panel @click="select" v-for="(shape, index) in complexShapes" :matrix="shape" :key="'concussiveShape' + index" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="自定义图形">
                    <life-panel @click="select" @delete="deleteCustomShape(index)" v-for="(shape, index) in customShapes"
                                :matrix="shape" :key="'customShape' + index"
                                style="margin-right: 5px" deletable/>
                    <div style="margin-top: 10px; text-align: center">
                        <el-button type="primary" @click="saveCurrentState">记录</el-button>
                        <el-button type="primary" @click="exportShape">导出</el-button>
                        <el-button type="primary" @click="importShape">导入</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="帮助">
                    使用WASD来向上左下右移动视野，使用+-来放大缩小视野，M打开预置图形菜单
                </el-tab-pane>
            </el-tabs>
        </el-dialog>

        <el-dialog :visible="outputVisible" @close="outputVisible = false" title="导出">
            <span v-if="outputText != null">
                {{outputText.substr(0, 2000)}}
                <p v-if="outputText.length > 2000">
                    数据过长，仅展示前两2000个字符
                </p>
                <el-button type="primary" style="display: block" @click="saveOutputTextToFile">保存到文件</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import GameData from "./core/GameData";
    import GameScreen from "./core/GameScreen";
    import GameController from "./core/GameController";
    import LifePanel from "./life/LifePanel";
    import complexShapes from "./life/complexShapes";
    import concussiveShapes from "./life/concussiveShapes";
    import aeroShapes from "./life/aeroShapes";
    import stabilizeShapes from "./life/stabilizeShapes";
    import pako from 'pako';
    import {Base64} from 'js-base64';

    export default {
        name: "MainPage",
        components: {LifePanel},
        data() {
            return {
                visible: true,
                complexShapes: complexShapes,
                concussiveShapes: concussiveShapes,
                aeroShapes: aeroShapes,
                stabilizeShapes: stabilizeShapes,
                customShapes: [],
                outputVisible: false,
                outputText: null,
            }
        },
        mounted() {
            let gameData = new GameData();
            this.gameData = gameData;
            let gameScreen = new GameScreen(window.innerWidth, window.innerHeight, gameData);
            let gameController = new GameController(gameData, gameScreen);
            gameController.initDefaultListener();
            document.getElementById("screen").appendChild(gameScreen.getCanvas());
            gameScreen.start();
            gameController.start();
            document.onkeypress = (event) => {
                if (event.key === "M" || event.key === 'm') {
                    this.visible = !this.visible;
                }
            };
            this.loadCustomShapes();
        },
        methods: {
            loadCustomShapes() {
                for (let i = 0; i < localStorage.length; i++) {
                    let key = localStorage.key(i);
                    if (key.startsWith("customShape")) {
                        this.customShapes.push(JSON.parse(localStorage.getItem(key)));
                    }
                }
            },

            deleteCustomShape(index) {
                this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    localStorage.removeItem(localStorage.key(index));
                    this.customShapes.splice(index, 1);
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                }).catch(() => {
                });
            },

            select(matrix) {
                this.$message.success("按住shift可重复放置");
                this.gameData.selectedShape = matrix;
                this.visible = false;
            },

            saveCurrentState() {
                let data = this.gameData.aliveCellsMap;
                if (data.size === 0) {
                    this.$message.error("当前无活细胞，无法记录");
                    return;
                }
                let minX;
                let maxX;
                let minY;
                let maxY;
                let first = true;
                for (const [, cell] of data) {
                    if (first) {
                        minX = cell.x;
                        maxX = cell.x;
                        minY = cell.y;
                        maxY = cell.y;
                        first = false;
                        continue;
                    }

                    minX = Math.min(minX, cell.x);
                    maxX = Math.max(maxX, cell.x);
                    minY = Math.min(minY, cell.y);
                    maxY = Math.max(maxY, cell.y);
                }

                let matrix = [];
                for (let yIndex = 0; yIndex < maxY - minY + 1; yIndex++) {
                    matrix[yIndex] = [];
                    for (let xIndex = 0; xIndex < maxX - minX + 1; xIndex++) {
                        let key = (xIndex + minX) * 100000000 + (yIndex + minY);
                        if (data.has(key)) {
                            matrix[yIndex][xIndex] = 1;
                        } else {
                            matrix[yIndex][xIndex] = 0;
                        }
                    }
                }
                this.customShapes.push(matrix);
                localStorage.setItem("customShape" + Date.now(), JSON.stringify(matrix));
            },

            exportShape() {
                let text = "";
                for (const [, cell] of this.gameData.aliveCellsMap) {
                    text += cell.x + "," + cell.y + "|";
                }
                this.outputText = Base64.fromUint8Array(pako.gzip(text));
                this.outputVisible = true;
            },

            saveOutputTextToFile() {
                let downLink = document.createElement('a');
                downLink.download = 'shape' + Date.now() + ".txt";
                let blob = new Blob([this.outputText]);
                downLink.href = URL.createObjectURL(blob);
                document.body.appendChild(downLink);
                downLink.click();
                document.body.removeChild(downLink)
            },

            importShape() {
                this.$prompt('导入', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {
                    this.gameData.options.pause = true;
                    let text = this.uint8ArrayToString(pako.ungzip(Base64.toUint8Array(value)));
                    let cells = text.split("|");
                    let data = new Map();
                    let lastIterationChangedCells = [];
                    for (const cellText of cells) {
                        if (!cellText) {
                            continue;
                        }
                        let xy = cellText.split(",");
                        let x = Number(xy[0]);
                        let y = Number(xy[1]);
                        data.set(x* 100000000 + y, {x, y});
                        lastIterationChangedCells.push({x, y});
                    }
                    this.gameData.aliveCellsMap = data;
                    this.gameData.lastIterationChangedCells = lastIterationChangedCells;
                    this.visible = false;
                    this.$message.success("导入成功，游戏已暂停");
                }).catch(e => {
                    if (e !== false) {
                        this.$message.error("导入失败");
                    }
                }).finally(() => {
                });
            },

            uint8ArrayToString(fileData){
                let dataString = "";
                for (let i = 0; i < fileData.length; i++) {
                    dataString += String.fromCharCode(fileData[i]);
                }

                return dataString
            },

        }
    }
</script>

<style>
    html, body {
        height: 100%;
        margin: 0;
    }
</style>