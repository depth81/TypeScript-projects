import Game from "./engine/Game";
import ImageUtils from "./engine/ImageUtils";
import { GameData } from "./engine/Types";
import GameMap from "./GameMap";
import Player from "./Player";

class BombermanGame extends Game{
    
    private map: GameMap
    private player: Player
    
    protected async setup(gameData: GameData){
        
        this.addEntity(new GameMap())
        this.addEntity(new Player())

    }

}

export default BombermanGame