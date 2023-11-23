"use-strict"

/* ********************************************
                     Robot
*********************************************** */
class Robot {
    constructor(
        characterElement, 
        characterIcon, 
        characterWidth, 
        characterHeight, 
        boardWidth, 
        boardHeight,
    ) {
        this.characterElement = characterElement;
        this.characterIcon = characterIcon;
        this.width = characterWidth;
        this.height = characterHeight;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;

        this.idleState = "../assets/character/Idle-1.png";
        this.isRunning = false;
        this.runAnimationFrame;
        this.runIdx = 0;
        this.direction;
        this.xPosition;

        this.laserObject;
        this.isLaserActive;
        this.laserHeight;
        this.laserTiles = [];

        this.runImages = this._getRunImages();
        this._runAnimation = this._runAnimation.bind(this);
        this._laserAnimation = this._laserAnimation.bind(this);
    }

    _getRunImages() {
        const runImages = [];
        for (let i = 0; i < 8; i++) {
            const image = new Image();
            image.src = `../assets/character/Run-${i+1}.png`;
            runImages.push(image);
        }
        return runImages;
    }


    /* 
        Cycle through runImages array to animate running.
        Move the character with a step of 2px when running
    */
    _runAnimation() {
        this.characterIcon.src = this.runImages[this.runIdx].src;
        
        this.xPosition = parseInt(this.characterElement.style.left);   // Current xPosition
        const step = 2;

        // Update the xPosition depending on if moving left or right
        (this.direction === "left") 
            ? this.xPosition = this.xPosition - step 
            : this.xPosition = this.xPosition + step;

        // Set xPosition limits to be the edges of the game board
        if ((this.xPosition + this.width) >= this.boardWidth) {
            this.xPosition = this.boardWidth - this.width;
        } else if (this.xPosition <= 0) {
            this.xPosition = 0;
        }

        this.characterElement.style.left = `${this.xPosition}px`;

        // Update the run image index and reset back to 0
        this.runIdx = (this.runIdx + 1) % this.runImages.length;

        // Rerun the animation frame because it only runs once
        this.runAnimationFrame = requestAnimationFrame(() => this._runAnimation());
    }

    // Run method
    run(direction) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.direction = direction;

            (this.direction === "left") 
                ? this.characterElement.classList.add("flip-character") 
                : this.characterElement.classList.remove("flip-character");

            this.runAnimationFrame = requestAnimationFrame(() => this._runAnimation());
        }
    }

    _laserAnimation() {
        const step = 4;
        this.laserObject.height += step;
        this.laserObject.laserElement.style.height = `${this.laserObject.height}px`;

        const laserOffset = this.boardHeight - this.laserObject.height;
        this.laserObject.laserElement.style.top = `${laserOffset}px`
        
        if (this.laserObject.height === this.boardHeight) {
            this.laserAnimationFrame = cancelAnimationFrame(this.laserAnimationFrame);
            this.isLaserActive = false;

            // Remove laser element from DOM
            this.laserObject.laserElement.remove();
            // Delete laserObject property
            delete this.laserObject;
            this.laserObject = null;
        } else {
            this.laserAnimationFrame = requestAnimationFrame(() => this._laserAnimation());
        }
    }

    shoot(laser) {
        if (!this.isLaserActive) {
            this.isLaserActive = true;
            this.laserObject = laser;
            this.laserAnimationFrame = requestAnimationFrame(() => this._laserAnimation());
        }
    }
    
    // Stop running method
    stopRunning() {
        this.runAnimationFrame = cancelAnimationFrame(this.runAnimationFrame);
        this.isRunning = false;
        this.characterIcon.src = this.idleState;
    }
}


class Laser {
    constructor(
        laserElement
    ) {
        this.laserElement = laserElement;
        this.height = 0;
    }
}

/* ********************************************
                     Robot
*********************************************** */


/* ********************************************
                    Ball 
*********************************************** */
const gravity = 0.05;  // Gravity constant
class Ball {
    constructor(
        ballElement, 
        width, 
        height, 
        xPosition, 
        yPosition, 
        xVelocity, 
        yVelocity, 
        bounceHeight,
        boardWidth,
        boardHeight,
    ) {
        this.ballElement = ballElement;  // ball DOM element
        this.width = width;   // ball width
        this.height = height;  // ball height
        this.xPosition = xPosition;  // Horizontal position
        this.yPosition = yPosition;   // Vertical position
        this.xVelocity = xVelocity;  // Horizontal velocity
        this.yVelocity = yVelocity;  // Vertical velocity
        this.bounceHeight = bounceHeight;  // Bounce height of balls in pixels
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;

        this._onPositionChange;

        this.bounce = this.bounce.bind(this);
    }

    // Ball position tracking code from chatGPT. 
    // set up a callback function to track the x/y position of the ball in the GameController class
    set onPositionChangeCallback(callbackFunction) {
        this._onPositionChange = callbackFunction;
    }

    bounce() {
        // Ball Drop
        this.yVelocity += gravity;  // a = dy/dt  =>  dy = a*dt  =>  dy_f - dy_i = a*dt  =>  dy_f = a*dt + dy_i  =>  where dt = each animation frame
        this.yPosition += this.yVelocity;  // v = dx/dt  =>  dx = v*dt  =>  dx_f - dx_i = v*dt  =>  dx_f = v*dt + dx_i  =>  where dt = each animation frame
        this.xPosition += this.xVelocity;
        
        // Bounce
        if (this.yPosition > (this.boardHeight - this.height)) {
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
        if (this.xPosition > (this.boardWidth - this.width) || this.xPosition < 0) {
            this.xVelocity *= -1;
        }
    
        this.ballElement.style.top = `${this.yPosition}px`;
        this.ballElement.style.left = `${this.xPosition}px`;

        if (this._onPositionChange) {
            this._onPositionChange({ xPosition: this.xPosition, yPosition: 600 - this.yPosition });
        }
    
        requestAnimationFrame(this.bounce);
    }

    delete() {
        this.ballElement.remove();  // Remove ball element from DOM
        delete this;  // Delete instance of ball class

    }
}

const ballSizes = {
    ball1: {
        width: 20,
        height: 20,
        bounceHeight: 115,
        num: 1,
    },
    ball2: {
        width: 32,
        height: 32,
        bounceHeight: 175,
        num: 2,
    },
    ball3: {
        width: 60,
        height: 60,
        bounceHeight: 250,
        num: 3,
    },
    ball4: {
        width: 90,
        height: 90,
        bounceHeight: 300,
        num: 4,
    },
    ball5: {
        width: 115,
        height: 115,
        bounceHeight: 350,
        num: 5,
    }
}
/* ********************************************
                    Ball 
*********************************************** */



class GameController {
    constructor(devmode = false) {
        this.devmode = devmode;

        this.elements = {};
        this._getElements();

        this.ballImages = this._getBallImages();

        this.robotObject;
        this.xRobotPosition;
        this.laserObject;
        this.characterWidth = this.elements.character.clientWidth;
        this.characterHeight = this.elements.character.clientHeight;
        this.boardWidth = this.elements.gameBoard.clientWidth;
        this.boardHeight = this.elements.gameBoard.clientHeight;

        if (this.devmode) this._devmode();

        this.currentLevel = 0;
        this.levels = [
            {   
                ballSrc: this.ballImages[0],
                balls: [
                    {
                        ballSize: ballSizes.ball3,
                        xPosition: 500,
                        yPosition: 200,
                        xVelocity: 1,
                        yVelocity: 0,
                    },
                    {
                        ballSize: ballSizes.ball3,
                        xPosition: 100,
                        yPosition: 100,
                        xVelocity: -1,
                        yVelocity: 0,
                    },
                ],
            },
            {
                ballSrc: this.ballImages[1],
                ballWidth: 100,
                ballHeight: 100,
                xPosition: 650,
                yPosition: 150,
                xVelocity: -1,
                yVelocity: 0,
                bounceHeight: 350,
            }
        ];

        this.playLevel(this.currentLevel);
        // this.playLevel(1);
    }

    // Collect the required DOM elements
    _getElements() {
        this.elements.introScreen = document.querySelector(".intro-screen");
        this.elements.startGameBtn = document.querySelector(".start-game-btn");
        this.elements.gameBoard = document.querySelector(".game-board");
        this.elements.character = document.querySelector(".character-container");
        this.elements.characterIcon = document.querySelector(".character-icon");
    }

    // Set up event listeners
    _setUpEventListeners() {
        // Robot arrow key controls pt.1
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                this.robotObject.run("right");
            } else if (e.key === "ArrowLeft") {
                this.robotObject.run("left");
            } else if (e.key === " " && !this.robotObject.isLaserActive) {
                const laserElement = this._createLaserElement();
                const laserObject = new Laser(laserElement);
                this.robotObject.shoot(laserObject);
                // laserObject = null;
            }
        })

        // Robot arrow key controls pt.2
        document.addEventListener("keyup", (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.robotObject.stopRunning();
            }
        })


        if (!this.devmode) {
            this.elements.startGameBtn.addEventListener("click", () => {this._startGame()});
            this.elements.introScreen.addEventListener("transitionend", () => {this._startGame(true)});
        }
    }

    // Load ball images into image object
    _getBallImages() {
        const ballImages = [];
        for (let i = 0; i < 10; i++) {
            const image = new Image();
            image.src = `../assets/planets/planet0${i}.png`;

            ballImages.push(image);
        }
        return ballImages;
    }

    // Dynamically create ball elements
    _createBallElement(planet, ballWidth, ballHeight, xPosition, yPosition) {
        const ball = document.createElement("div");
        ball.classList.add("planet-container");
        const ballIcon = document.createElement("img");

        ballIcon.src = planet.src;
        ballIcon.style.width = `${ballWidth}px`;
        ballIcon.style.height = `${ballHeight}px`;
        ball.appendChild(ballIcon);

        ball.style.left = `${xPosition}px`;
        ball.style.top = `${yPosition}px`;

        this.elements.gameBoard.appendChild(ball);

        return ball;
    }

    _createLaserElement() {
        const laser = document.createElement("div");
        laser.classList.add("laser");

        const xLaserPosition = this.robotObject.xPosition + this.robotObject.width/2;
        const yLaserPosition = this.boardHeight - 100;

        laser.style.left = `${xLaserPosition}px`;
        laser.style.top = `${yLaserPosition}px`;
        laser.style.height = "0px";

        this.elements.gameBoard.appendChild(laser);

        return laser;
    }

    // Game start transition
    _startGame(displayGameBoard = false) {
        if (!displayGameBoard) {
            this.elements.introScreen.classList.add("fade-out");
        } else {
            this.elements.introScreen.classList.add("hide");
            this.elements.gameBoard.classList.add("fade-in");
        }
    }

    // Place robot character on the bottom and center of the screen
    _placeCharacter(boardWidth, boardHeight, characterWidth, characterHeight) {
        const xInitPosition = (boardWidth / 2) - (characterWidth / 2);
        const yInitPosition = boardHeight - characterHeight;

        this.elements.character.style.left = `${xInitPosition}px`;
        this.elements.character.style.top = `${yInitPosition}px`;
        this.robotObject.xPosition = xInitPosition;
    }

    // Level method
    playLevel(level) {
        // Collect balls src and array from levels array
        const { 
            ballSrc, 
            balls,
        } = this.levels[level];

        // Create new robot instance
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.characterWidth, this.characterHeight, this.boardWidth, this.boardHeight);
        this._placeCharacter(this.boardWidth, this.boardHeight, this.characterWidth, this.characterHeight);
        this._setUpEventListeners();

        for (let ball of balls) {
            // Create ball DOM element
            const ballElem = this._createBallElement(ballSrc, ball.ballSize.width, ball.ballSize.height, ball.xPosition, ball.yPosition);
            // Create new ball object and make it bounce >:^)
            let ballObject = new Ball(ballElem, ball.ballSize.width, ball.ballSize.height, ball.xPosition,ball. yPosition, ball.xVelocity, ball.yVelocity, ball.ballSize.bounceHeight, this.boardWidth, this.boardHeight);
            ballObject.bounce();

            let currentXPosition, currentYPosition;
            // Ball position tracking code from chatGPT. 
            // set up a callback function to track the x/y position of the ball in the GameController class
            ballObject.onPositionChangeCallback = (position) => {
                currentXPosition = position.xPosition;
                currentYPosition = position.yPosition;

                if (currentXPosition === this.boardWidth / 2) {
                    
                    ballObject.delete();

                }
            }
        }

        
    }


    _devmode() {
        console.log("Dev Mode")
        this.elements.introScreen.classList.add("hide");
        this.elements.gameBoard.style.opacity = 100;
        this.elements.gameBoard.style.transition = null;
    }

    
}

const game = new GameController(true);
// const game = new GameController(false);
