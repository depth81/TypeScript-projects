function loadImageFromUrl(url) {
    return new Promise((resolve)=>{
        const img = new Image();
        img.src = url;
        img.onload = ()=>{
            resolve(img);
        };
        img.src = url;
    });
}
async function run() {
    const canvasEl = document.getElementById("game-canvas");
    if (canvasEl == null) {
        console.log("Couldn't find the canvas elment");
        return;
    }
    const context = canvasEl.getContext("2d");
    const img = await loadImageFromUrl("http://localhost:4000/static/bg.png");
    drawMap(context, img, canvasEl.width, canvasEl.height);
}
function drawMap(context, tileImage, width, height) {
    const tileSize = 64;
    const tileCountX = Math.ceil(width / tileSize);
    const tileCountY = Math.ceil(height / tileSize);
    for(let y = 0; y < tileCountY; y++)for(let x = 0; x < tileCountX; x++)context.drawImage(tileImage, x * tileSize, y * tileSize, tileSize, tileSize);
}
run();

//# sourceMappingURL=index.b98414df.js.map
