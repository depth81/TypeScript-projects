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
    context.drawImage(img, 100, 100, 128, 128);
}
run();

//# sourceMappingURL=index.b98414df.js.map
