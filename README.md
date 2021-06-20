## 生命游戏 
支持无限地图，无限视距，最多支持50万+活细胞，预置各种飞行器，震荡器等复杂图形

生命游戏规则：
 - 世界由无限宽的网格组成，类似于扫雷的地图
 - 每个格子是一个细胞，有死/活两种状态，死状态用黑色表式，活状态用白色表示
 - 如果一个活细胞周围的8个格子中有2-3个活细胞，则下一刻它还会存活，否则下一刻将死亡
 - 如果一个死细胞周围的8个格子中正好有三个活细胞，则下一刻它会复活

## 运行方式

先确保安装了node, npm, cd到项目根目录下，执行 `npm run serve` 然后打开控制台输出的链接即可，通常是`http://localhost:8080`

编译：`npm run build`

## 实现思路

用一个Map记录当前存活的细胞，每次迭代时，需要计算上一次变更过状态的细胞，及其周围8个细胞的状态即可。

同时，使用一个Map记录在本轮迭代中状态发生过变更的细胞，以便下次迭代使用。

绘图时，需要记录视野中点的坐标，以及每个格子的宽度，然后根据这两个数据可以推算出当前视野的边界，只需要绘制在视野范围内的细胞即可。

同时可以添加事件，修改视野中点的坐标可以移动视野，修改每个格子的宽度，可以放大缩小视野。

默认使用`WASD`来向上左下右移动视野，使用`+-`来放大缩小视野，`M`打开预置图形菜单