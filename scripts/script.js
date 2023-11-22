"use-strict"

/* ********************************************
                     Robot
*********************************************** */
class Robot {
    constructor(
                character, 
                characterIcon, 
                characterWidth, 
                characterHeight, 
                boardWidth, 
                boardHeight,
        ) {

        this.character = character;
        this.characterIcon = characterIcon;
        this.width = characterWidth;
        this.height = characterHeight;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;

        this.idleState = "../assets/character/Idle-1.png";
        this.isRunning = false;
        this.animationFrame;
        this.runIdx = 0;
        this.direction;
        this.xPosition = parseInt(this.character.style.left);

        this.runImages = this._getRunImages();
        this._runAnimation = this._runAnimation.bind(this);
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
        
        this.xPosition = parseInt(this.character.style.left);   // Current xPosition
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

        console.log(this.xPosition)
        // this.xPosition = xPosition;
        this.character.style.left = `${this.xPosition}px`;

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
/* ********************************************
                     Robot
*********************************************** */


/* ********************************************
                    Ball 
*********************************************** */
const gravity = 0.05;  // Gravity constant
class Ball {
    constructor(
        ball, 
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

        this.ball = ball;  // ball DOM element
        this.width = width;   // ball width
        this.height = height;  // ball height
        this.xPosition = xPosition;  // Horizontal position
        this.yPosition = yPosition;   // Vertical position
        this.xVelocity = xVelocity;  // Horizontal velocity
        this.yVelocity = yVelocity;  // Vertical velocity
        this.bounceHeight = bounceHeight;  // Bounce height of balls in pixels
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;

        this.bounce = this.bounce.bind(this);
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
    
        this.ball.style.top = `${this.yPosition}px`;
        this.ball.style.left = `${this.xPosition}px`;
    
        requestAnimationFrame(this.bounce);
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

        this.characterWidth = this.elements.character.clientWidth;
        this.characterHeight = this.elements.character.clientHeight;
        this.boardWidth = this.elements.gameBoard.clientWidth;
        this.boardHeight = this.elements.gameBoard.clientHeight;

        if (this.devmode) this._devmode();

        this.currentLevel = 0;
        this.levels = [
            {
                ballSrc: this.ballImages[0],
                ballWidth: 75,
                ballHeight: 75,
                xPosition: 500,
                yPosition: 100,
                xVelocity: 1,
                yVelocity: 0,
                bounceHeight: 350,
            },
            {
                ballSrc: this.ballImages[1],
                ballWidth: 100,
                ballHeight: 100,
                xPosition: 650,
                yPosition: 150,
                xVelocity: -1,
                yVelocity: 0,
                bounceHeight: 450,
            }
        ];

        this._initLevel(this.currentLevel);
        // this._initLevel(1);
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
                this.robotObject.run("right");
            } else if (e.key === "ArrowLeft") {
                this.robotObject.run("left");
            }
        })

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

    _getBallImages() {
        const ballImages = [];
        for (let i = 0; i < 10; i++) {
            const image = new Image();
            image.src = `../assets/planets/planet0${i}.png`;

            ballImages.push(image);
        }
        return ballImages;
    }

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

    _startGame(displayGameBoard = false) {
        if (!displayGameBoard) {
            this.elements.introScreen.classList.add("fade-out");
        } else {
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

    _initLevel(level) {
        const { 
            ballSrc, 
            ballWidth, 
            ballHeight, 
            xPosition, 
            yPosition, 
            xVelocity, 
            yVelocity, 
            bounceHeight 
        } = this.levels[level];

        this._placeCharacter(this.boardWidth, this.boardHeight, this.characterWidth, this.characterHeight);

        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.characterWidth, this.characterHeight, this.boardWidth, this.boardHeight);
        this._setUpEventListeners();

        this.ballElem = this._createBallElement(ballSrc, ballWidth, ballHeight, xPosition, yPosition);
        this.ballObject = new Ball(this.ballElem, ballWidth, ballHeight, xPosition, yPosition, xVelocity, yVelocity, bounceHeight, this.boardWidth, this.boardHeight);
        this.ballObject.bounce();
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
