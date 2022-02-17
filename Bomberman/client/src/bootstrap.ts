import BombermanGame from './BombermanGame'

async function bootstrap(){
    const canvasEl = document.getElementById("game-canvas") as HTMLCanvasElement | undefined
    if (canvasEl == null){
        console.log("Couldn't find the canvas elment")
        return
    }
    
    const context = canvasEl.getContext("2d")

    canvasEl.focus()

    const game = new BombermanGame(canvasEl)
    game.run()

}

bootstrap()