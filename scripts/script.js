"use-strict"

/* ********************************************
              Character Movement 
*********************************************** */
// const character = document.querySelector(".character-container");
// const characterIcon = document.querySelector(".character-icon");
// const characterHitbox = document.querySelector(".character-hitbox");
// const gameBoard = document.querySelector(".game-board");


// const characterWidth = character.clientWidth;
// const characterHeight = character.clientHeight;
// const boardWidth = gameBoard.clientWidth;
// const boardHeight = gameBoard.clientHeight;


// const runImages = [];
// function initGame() {
//     function _placeCharacter() {
//         const xPosition = (boardWidth / 2) - (characterWidth / 2);
//         const yPosition = boardHeight - characterHeight;

//         character.style.left = `${xPosition}px`;
//         character.style.top = `${yPosition}px`;
//     }

//     function _getRunImages() {
//         for (let i = 0; i < 8; i++) {
//             const image = new Image();
//             image.src = `../assets/character/Run-${i+1}.png`;
//             runImages.push(image);
//         }
//     }

//     _placeCharacter();
//     _getRunImages();
// }



class Robot {
    constructor(characterWidth, 
                characterHeight, 
                character, 
                characterIcon, 
                boardWidth, 
                boardHeight) {

        this.width = characterWidth;
        this.height = characterHeight;
        this.character = character;
        this.characterIcon = characterIcon;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;

        this.idleState = "../assets/character/Idle-1.png";
        this.isRunning = false;
        this.animationFrame;
        this.runIdx = 0;
        this.direction;

        this.runImages = [];
        this._getRunImages();
        this._runAnimation = this._runAnimation.bind(this);
    }

    _getRunImages() {
        for (let i = 0; i < 8; i++) {
            const image = new Image();
            image.src = `../assets/character/Run-${i+1}.png`;
            this.runImages.push(image);
        }
    }


    /* 
        Cycle through runImages array to animate running.
        Move the character with a step of 2px when running
    */
    _runAnimation() {
        this.characterIcon.src = this.runImages[this.runIdx].src;
        
        let xPosition = parseInt(this.character.style.left);   // Current xPosition
        const step = 2;

        // Update the xPosition depending on if moving left or right
        (this.direction === "left") ? xPosition = xPosition - step :
                                      xPosition = xPosition + step;

        // Set xPosition limits to be the edges of the game board
        if ((xPosition + this.width) >= this.boardWidth) {
            xPosition = this.boardWidth - this.width;
        } else if (xPosition <= 0) {
            xPosition = 0;
        }

        this.character.style.left = `${xPosition}px`;

        // Update the run image index and reset back to 0
        this.runIdx = (this.runIdx + 1) % this.runImages.length;

        // Rerun the animation frame because it only runs once
        this.animationFrame = requestAnimationFrame(() => this._runAnimation());
    }

    // Run method
    run(direction) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.direction = direction;

            (this.direction === "left") ? this.character.classList.add("flip-character") : 
                                          this.character.classList.remove("flip-character");

            this.animationFrame = requestAnimationFrame(() => this._runAnimation());
        }
    }

    // Stop running method
    stopRunning() {
        cancelAnimationFrame(this.animationFrame);
        this.isRunning = false;
        this.characterIcon.src = this.idleState;
    }
}

// const idleImagePath = "../assets/character/Idle-1.png";
// const robot = new Robot(idleImagePath, characterWidth, characterHeight);

// document.addEventListener("keydown", (e) => {
//     if (e.key === "ArrowRight") {
//         robot.run("right");
//     } else if (e.key === "ArrowLeft") {
//         robot.run("left");
//     }
// })

// document.addEventListener("keyup", (e) => {
//     if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
//         robot.stopRunning();
//     }
// })

/* ********************************************
              Character Movement 
*********************************************** */


/* ********************************************
                Ball Movement 
*********************************************** */
const gravity = 0.05;  // Gravity constant
class Ball {
    constructor(src, width, height) {
        this.src = src;
        this.width = width;
        this.height = height;
        this.xPosition = 0;  // Horizontal position
        this.yPosition = 100;   // Vertical position
        this.xVelocity = 1;  // Horizontal velocity
        this.yVelocity = 0;  // Vertical velocity
        this.bounceHeight = 350;  // Bounce height of balls in pixels

        this.ball = this._createBall();
        this.bounce = this.bounce.bind(this);
    }

    _createBall() {
        const ball = document.createElement("div");
        ball.classList.add("planet-container");
        const ballIcon = document.createElement("img");

        ballIcon.src = this.src;
        ballIcon.style.width = `${this.width}px`;
        ballIcon.style.height = `${this.height}px`;
        ball.appendChild(ballIcon);

        gameBoard.appendChild(ball);
        return ball;
    }

    bounce() {
        // Ball Drop
        this.yVelocity += gravity;  // a = dy/dt  =>  dy = a*dt  =>  dy_f - dy_i = a*dt  =>  dy_f = a*dt + dy_i  =>  where dt = each animation frame
        this.yPosition += this.yVelocity;  // v = dx/dt  =>  dx = v*dt  =>  dx_f - dx_i = v*dt  =>  dx_f = v*dt + dx_i  =>  where dt = each animation frame
        this.xPosition += this.xVelocity;
        
        // Bounce
        if (this.yPosition > (boardHeight - this.height)) {
            /*  To bring a ball back to a specified height, we must calculate the velocity required to
                bounce the ball back to the height. Assuming elastic collision with no losses, the velocity 
                down = velocity up. Thus, the final velocity of a ball as its dropped from a specified height 
                is equal to the inital velocity of a ball as it collides with the floor and bounces back up.
    
                vf^2 = vi^2 + 2ad    // Assume that the ball is dropped with an initial velocity of 0
                vf^2 = 2ad
                vf = sqrt(2ad)
            */
            this.yVelocity = -Math.sqrt(2 * gravity * this.bounceHeight);  // Negative sign because in this context, down is positive and up is negative
        }
        
        // Switch bounce direction if it hits the side walls
        if (this.xPosition > (boardWidth - this.width) || this.xPosition < 0) {
            this.xVelocity *= -1;
        }
    
        this.ball.style.top = `${this.yPosition}px`;
        this.ball.style.left = `${this.xPosition}px`;
    
        requestAnimationFrame(this.bounce);
    }

    delete() {
        gameBoard.removeChild(this.ball);
    }
}




class GameController {
    constructor(devmode = false) {
        this.devmode = devmode;

        this.elements = {};
        this._getElements();

        this.ballImages = [];
        this._getBallImages();

        this.characterWidth = this.elements.character.clientWidth;
        this.characterHeight = this.elements.character.clientHeight;
        this.boardWidth = this.elements.gameBoard.clientWidth;
        this.boardHeight = this.elements.gameBoard.clientHeight;
        this._placeCharacter(this.boardWidth, this.boardHeight, this.characterWidth, this.characterHeight);
    
        this.robot = new Robot(this.characterWidth, this.characterHeight, this.elements.character, this.elements.characterIcon, this.boardWidth, this.boardHeight);

        this._setUpEventListeners();


        if (this.devmode) this._devmode();
    }

    _getElements() {
        this.elements.introScreen = document.querySelector(".intro-screen");
        this.elements.startGameBtn = document.querySelector(".start-game-btn");
        this.elements.gameBoard = document.querySelector(".game-board");
        this.elements.character = document.querySelector(".character-container");
        this.elements.characterIcon = document.querySelector(".character-icon");
    }

    _setUpEventListeners() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                this.robot.run("right");
            } else if (e.key === "ArrowLeft") {
                this.robot.run("left");
            }
        })

        document.addEventListener("keyup", (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.robot.stopRunning();
            }
        })

        
        if (!this.devmode) {
            this.elements.startGameBtn.addEventListener("click", () => {this._startGame()});
            this.elements.introScreen.addEventListener("transitionend", () => {this._startGame(true)});
        }
        
    }

    _getBallImages() {
        for (let i = 0; i < 10; i++) {
            const image = new Image();
            image.src = `../assets/planets/planet0${i}.png`;

            this.ballImages.push(image);
        }
    }

    _startGame(displayGameBoard = false) {
        if (!displayGameBoard) {
            this.elements.introScreen.classList.add("fade-out");
        } else {
            console.log("YESSIR")
            this.elements.introScreen.classList.add("hide");
            this.elements.gameBoard.classList.add("fade-in");
        }
    }

    _placeCharacter(boardWidth, boardHeight, characterWidth, characterHeight) {
        const xPosition = (boardWidth / 2) - (characterWidth / 2);
        const yPosition = boardHeight - characterHeight;

        this.elements.character.style.left = `${xPosition}px`;
        this.elements.character.style.top = `${yPosition}px`;
    }


    _devmode() {
        console.log("Dev Mode")
        this.elements.introScreen.classList.add("hide");
        this.elements.gameBoard.style.opacity = 100;
        this.elements.gameBoard.style.transition = null;
    }

    
}


// const idleImagePath = "../assets/character/Idle-1.png";
// const robot = new Robot(idleImagePath, characterWidth, characterHeight);

// document.addEventListener("keydown", (e) => {
//     if (e.key === "ArrowRight") {
//         robot.run("right");
//     } else if (e.key === "ArrowLeft") {
//         robot.run("left");
//     }
// })

// document.addEventListener("keyup", (e) => {
//     if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
//         robot.stopRunning();
//     }
// })

const game = new GameController(true);
// const game = new GameController(false);
