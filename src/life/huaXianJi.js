export default function (dirction = "right") {
    let data = []
    if (dirction === "down") {
        data.push({x: 0, y: 0});
        data.push({x: 0, y: 1});
        data.push({x: 0, y: 2});
        data.push({x: 1, y: 2});
        data.push({x: 2, y: 1});
    } else if (dirction === "top") {
        data.push({x: 0, y: 0});
        data.push({x: 0, y: 1});
        data.push({x: 0, y: 2});
        data.push({x: -1, y: 0});
        data.push({x: -2, y: 1});
    } else if (dirction === "left") {
        data.push({x: 0, y: 0});
        data.push({x: 1, y: 0});
        data.push({x: 2, y: 0});
        data.push({x: 0, y: 1});
        data.push({x: 1, y: 2});
    } if (dirction === "right") {
        data.push({x: 0, y: 0});
        data.push({x: 1, y: 0});
        data.push({x: 2, y: 0});
        data.push({x: 2, y: -1});
        data.push({x: 1, y: -2});
    }
    return data;
}