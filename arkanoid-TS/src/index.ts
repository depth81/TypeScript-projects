import { CanvasView } from "./view/CanvasView";
import { Ball } from "./sprites/Ball";
import { Brick } from "./sprites/Brick";
import { Paddle } from "./sprites/Paddle";
import { Collision } from "./Collision";
//Images
import PADDLE_IMAGE from './images/paddle.png';
import BALL_IMAGE from './images/ball.png';
//Level and colors
import{
    PADDLE_SPEED,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_STARTX,
    BALL_SPEED,
    BALL_SIZE,
    BALL_STARTX,
    BALL_STARTY
} from './setup';
//Helpers
import {createBricks} from './helpers';

let gameOver = false;
let score = 0;

function setGameOver(view:CanvasView){
    view.drawInfo('Game Over!');
    gameOver= false;
}

function setGameWin(view:CanvasView){
    view.drawInfo('Game Won!');
    gameOver=false;
}

function gameLoop(
    View:CanvasView,
    bricks:Brick[],
    paddle:Paddle,
    ball:Ball,
    collision:Collision
){
    view.clear();
    view.drawBricks(bricks);
    view.drawSprite(paddle);
    view.drawSprite(ball);

    //Move the ball
    ball.moveBall();
    
    //Move paddle and check so it won't exit the playfield
    if(
        (paddle.isMovingLeft && paddle.pos.x > 0) ||
        (paddle.isMovingRight && paddle.pos.x < view.canvas.width - paddle.width)  
    ){
        paddle.movePaddle(); 
    };

    collision.checkBallCollision(ball,paddle,view);
    const collidingBrick = collision.isCollidingBricks(ball,bricks);

    if(collidingBrick){
        score += 1;
        view.drawScore(score);
    };

    //Game Over when the ball leaves the playfield
    if(ball.pos.y > view.canvas.height) gameOver = true;
    //if game is won, set gameOver and display win
    if(bricks.length === 0) return setGameWin(view);
    //Return if game is over and don't run the requestAnimationFrame
    if(gameOver) return setGameOver(view);

    requestAnimationFrame(()=>gameLoop(view,bricks,paddle,ball,collision));
}

function startGame(view:CanvasView){
    //Reset displays
    score = 0;
    view.drawInfo('');
    view.drawScore(0);
    //Create the collision instance
    const collision = new Collision();
    //Create all the bricks
    const bricks = createBricks();
    //Create a ball
    const ball = new Ball(
        BALL_SPEED,
        BALL_SIZE,
        {x:BALL_STARTX,y:BALL_STARTY},
        BALL_IMAGE
    );
    //Create paddle
    const paddle = new Paddle(
        PADDLE_SPEED,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        {
            x:PADDLE_STARTX,
            y:view.canvas.height - PADDLE_HEIGHT - 5
        },
        PADDLE_IMAGE
    );
    gameLoop(view,bricks,paddle,ball,collision);
}

//Create a new view
const view = new CanvasView('#playField');
view.initStartButton(startGame);