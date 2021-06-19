<template>
    <div id="screen">
        <el-dialog :visible="visible" @close="visible = false" title="控制面板(按M打开/隐藏)">
            <el-tabs >
                <el-tab-pane label="稳定器">
                    <life-panel @click="select" v-for="shape in stabilizeShapes" :matrix="shape" :key="shape" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="震荡器">
                    <life-panel @click="select" v-for="shape in concussiveShapes" :matrix="shape" :key="shape" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="飞行器">
                    <life-panel @click="select" v-for="shape in aeroShapes" :matrix="shape" :key="shape" style="margin-right: 5px"/>
                </el-tab-pane>
                <el-tab-pane label="复杂图形">
                    <life-panel @click="select" v-for="shape in complexShapes" :matrix="shape" :key="shape" style="margin-right: 5px"/>
                </el-tab-pane>
            </el-tabs>

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
            window.document.body.addEventListener("keypress", (event) => {
                if (event.key === "M" || event.key === 'm') {
                    this.visible = !this.visible;
                }
            });
        },
        methods: {
            select(matrix) {
                this.$message.success("按住shift可重复放置");\
                this.gameData.selectedShape = matrix;
                this.visible = false;
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