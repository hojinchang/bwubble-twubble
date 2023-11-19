"use-strict"

/* ********************************************
              Character Movement 
*********************************************** */
const character = document.querySelector(".character-container");
const characterIcon = document.querySelector(".character-icon");
const characterHitbox = document.querySelector(".character-hitbox");
const gameBoard = document.querySelector(".game-board");


const characterWidth = character.clientWidth;
const characterHeight = character.clientHeight;
const boardWidth = gameBoard.clientWidth;
const boardHeight = gameBoard.clientHeight;


const runImages = [];
function initGame() {
    function _placeCharacter() {
        const xPosition = (boardWidth / 2) - (characterWidth / 2);
        const yPosition = boardHeight - characterHeight;

        character.style.left = `${xPosition}px`;
        character.style.top = `${yPosition}px`;
    }

    function _getRunImages() {
        for (let i = 0; i < 8; i++) {
            const image = new Image();
            image.src = `../assets/character/Run-${i+1}.png`;
            runImages.push(image);
        }
    }

    _placeCharacter();
    _getRunImages();
}



class Robot {
    constructor(idleImgPath, characterWidth, characterHeight) {
        this.idleState = idleImgPath;
        this.isRunning = false;
        this.runInterval;
        this.runIdx = 0;
        this.direction;

        this.width = characterWidth;
        this.height = characterHeight;

        this._runAnimation = this._runAnimation.bind(this);
    }

    /* 
        Cycle through runImages array to animate running.
        Move the character with a step of 2px when running
    */
    _runAnimation() {
        characterIcon.src = runImages[this.runIdx].src;
        
        let xPosition = parseInt(character.style.left);   // Current xPosition
        const step = 2;

        // Update the xPosition depending on if moving left or right
        (this.direction === "left") ? xPosition = xPosition - step :
                                      xPosition = xPosition + step;

        // Set xPosition limits to be the edges of the game board
        if ((xPosition + this.width) >= boardWidth) {
            xPosition = boardWidth - this.width;
        } else if (xPosition <= 0) {
            xPosition = 0;
        }

        character.style.left = `${xPosition}px`;

        // Update the run image index and reset back to 0
        this.runIdx = (this.runIdx + 1) % runImages.length;

        // Rerun the animation frame because it only runs once
        this.runInterval = requestAnimationFrame(() => this._runAnimation());
    }

    // Run method
    run(direction) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.direction = direction;

            (this.direction === "left") ? character.classList.add("flip-character") : 
                                          character.classList.remove("flip-character");

            this.runInterval = requestAnimationFrame(() => this._runAnimation());
        }
    }

    // Stop running method
    stopRunning() {
        cancelAnimationFrame(this.runInterval);
        this.isRunning = false;
        characterIcon.src = this.idleState;
    }
}

const idleImagePath = "../assets/character/Idle-1.png";
const robot = new Robot(idleImagePath, characterWidth, characterHeight);

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
        robot.run("right");
    } else if (e.key === "ArrowLeft") {
        robot.run("left");
    }
})

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        robot.stopRunning();
    }
})

/* ********************************************
              Character Movement 
*********************************************** */


/* ********************************************
                Ball Movement 
*********************************************** */
const ball = document.querySelector(".planet-container");
const ballIcon = document.querySelector(".planet-icon");
const ballHitbox = document.querySelector(".planet-hitbox");

const ballWidth = ball.clientWidth;
const ballHeight = ball.clientHeight;

let ballX = ball.offsetLeft;  // Horizontal position
let ballY = ball.offsetTop;   // Vertical position

let balldX = 2;  // Horizontal velocity
let balldY = 0;  // Vertical velocity
const gravity = 0.05;  // Gravity constant

const bounceHeight = 200;  // Bounce height of balls in pixels

function bounceBall() {
    // Ball Drop
    balldY += gravity;  // a = dy/dt  =>  dy = a*dt  =>  dy_f - dy_i = a*dt  =>  dy_f = a*dt + dy_i
    ballY += balldY;  // v = dx/dt  =>  dx = v*dt  =>  dx_f - dx_i = v*dt  =>  dx_f = v*dt + dx_i
    ballX += balldX

    // Bounce
    if (ballY > (boardHeight - ballHeight)) {
        /*  To bring a ball back to a specified height, we must calculate the velocity required to
            bounce the ball back to the height. Assuming elastic collision with no losses, the velocity 
            down = velocity up. Thus, the final velocity of a ball as its dropped from a specified height 
            is equal to the inital velocity of a ball as it collides with the floor and bounces back up.

            vf^2 = vi^2 + 2ad    // Assume that the ball is dropped with an initial velocity of 0
            vf^2 = 2ad
            vf = sqrt(2ad)
        */

        balldY = -Math.sqrt(2 * gravity * bounceHeight);  // Negative sign because in this context, down is positive and up is negative
    }

    if (ballX > (boardWidth - ballWidth) || ballX < 0) {
        balldX *= -1;
    }

    ball.style.top = `${ballY}px`;
    ball.style.left = `${ballX}px`;

    requestAnimationFrame(bounceBall);

}

bounceBall();
// setInterval(bounceBall, 20);
























initGame();