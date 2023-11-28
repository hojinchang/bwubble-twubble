"use-strict";

/* ********************************************
                Game Controller
*********************************************** */
class GameController {
    constructor(devmode = false) {
        this.devmode = devmode;

        this.elements = {};
        this._getElements();

        this.ballImages = this._getBallImages();

        // Create new robot instance
        this.robotObject;
        this.laserObject;
        this.gameBoard = this.elements.gameBoard;
        this.keyDownHandler;
        this.keyUpHandler;

        this.levelWin = false;
        this.ballsKilled = 0;
        this.ballsRequired;

        this.currentLevel = 0;
        this.levels = [
            // {   
            //     level: 1,
            //     ballSrc: this.ballImages[0],
            //     ballsRequired: this._determineBallsRequired(3),
            //     balls: [
            //         {
            //             ballSize: ballSizes.ball3,
            //             id: 3,
            //             xPosition: 450,
            //             yPosition: 200,
            //             xVelocity: 150,
            //             yVelocity: 0,
            //         },
            //     ],
            // },
            {   
                level: 1,
                ballSrc: this.ballImages[0],
                ballsRequired: this._determineBallsRequired(1),
                balls: [
                    {
                        ballSize: ballSizes.ball1,
                        id: 1,
                        xPosition: 450,
                        yPosition: 200,
                        xVelocity: 150,
                        yVelocity: 0,
                    },
                ],
            },
            {
                level: 2,
                ballSrc: this.ballImages[1],
                ballsRequired: 
                    this._determineBallsRequired(3) 
                    + this._determineBallsRequired(3),
                balls: [
                    {
                        ballSize: ballSizes.ball3,
                        id: 3,
                        xPosition: 200,
                        yPosition: 200,
                        xVelocity: 150,
                        yVelocity: 0,
                    },
                    {
                        ballSize: ballSizes.ball3,
                        id: 3,
                        xPosition: 800,
                        yPosition: 200,
                        xVelocity: -150,
                        yVelocity: 0,
                    },
                ],
            }
        ];

        // this.playLevel(this.currentLevel);
        // this.playLevel(1);

        this._setUpGame();
        if (this.devmode) this._devmode();
    }

    // Collect the required DOM elements
    _getElements() {
        this.elements.gameContainer = document.querySelector(".game-container");
        this.elements.introScreen = document.querySelector(".intro-screen");
        this.elements.startGameBtn = document.querySelector(".start-game-btn");
        this.elements.instructionsBtn = document.querySelector(".instructions-btn");
        this.elements.instructionsModal = document.querySelector(".instructions-modal");
        this.elements.creditsBtn = document.querySelector(".credits-btn");
        this.elements.creditsModal = document.querySelector(".credits-modal")
        this.elements.gameBoard = document.querySelector(".game-board");
        this.elements.countdownContainer = document.querySelector(".countdown-container");
        this.elements.countdownText = document.querySelectorAll(".countdown-container div");
        this.elements.levelWinModal = document.querySelector(".level-win-modal");
        this.elements.nextLevelBtn = document.querySelector(".next-level-btn");
        this.elements.returnMainBtn = document.querySelector(".return-menu-btn");
        this.elements.character = document.querySelector(".character-container");
        this.elements.characterIcon = document.querySelector(".character-icon");

        this.elements.modalCloseBtn = document.querySelectorAll(".modal-close-button");
        this.elements.introModalBackdrop = document.createElement("div");
        this.elements.introModalBackdrop.classList.add("modal-backdrop", "intro-modal-backdrop");
        this.elements.levelWinModalBackdrop = document.createElement("div");
        this.elements.levelWinModalBackdrop.classList.add("modal-backdrop", "level-win-modal-backdrop");
    }

    _setUpGame() {
        // Helper function which sets the modal and backdrop to show
        const _openIntroModal = (modalType, modal, modalBackdrop, gameContainer) => {
            (modalType === "instructions") ? modal.style.display = "grid": modal.style.display = "flex"
            modalBackdrop.style.display = "block";
            gameContainer.insertBefore(modalBackdrop, this.elements.gameBoard);
        }

        // Helper function which closes the modal and backdrop
        const _closeIntroModal = (e, modalBackdrop, gameContainer) => {
            const modal = e.target.closest(".modal");
            modal.style.display = "none";
            modalBackdrop.style.display = "none";
            gameContainer.removeChild(modalBackdrop);
        }

        // Start game
        this.elements.startGameBtn.addEventListener("click", () => {this._startGame()});

        // Show instructions modal
        this.elements.instructionsBtn.addEventListener("click", () => {
            _openIntroModal("instructions", this.elements.instructionsModal, this.elements.introModalBackdrop, this.elements.gameContainer);
        });

        // Show credits modal
        this.elements.creditsBtn.addEventListener("click", () => {
            _openIntroModal("credits", this.elements.creditsModal, this.elements.introModalBackdrop, this.elements.gameContainer);
        });

        // Close modal
        this.elements.modalCloseBtn.forEach(closeBtn => {
            closeBtn.addEventListener("click", (e) => {
                _closeIntroModal(e, this.elements.introModalBackdrop, this.elements.gameContainer)
            })
        });

        // Next level button for level win modal
        this.elements.nextLevelBtn.addEventListener("click", () => {
            this.currentLevel++;
            this._closeLevelWinModal();
            this._resetLevel();
            this.playLevel(this.currentLevel);
        });

        this.elements.returnMainBtn.addEventListener("click", (e) => {
            this._returnToMain(e)
        });
    }

    // Game start transition
    _startGame() {
        this.elements.introScreen.classList.add("fade-out");
        this.elements.gameBoard.classList.add("fade-in");
        
        // Create new robot instance
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.elements.gameBoard);
        this.playLevel(this.currentLevel);
    }

    // Reverse the actions from _startGame()
    _returnToMain(e) {
        this.elements.gameBoard.classList.remove("fade-in");
        this.elements.introScreen.classList.remove("fade-out");

        this._closeLevelWinModal();
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

    /*
        This function calculates the required number of balls to be destroyed to complete a level.
        Each ballSize > 1 can split in 2, thus doubling the number of balls to be destroyed. 
    */
    _determineBallsRequired(ballID) {
        let ballsRequired = 0;
        for (let i = ballID; i > 0; i--) {
            ballsRequired += Math.pow(2, i-1);
        }

        return ballsRequired;
    }   

    // Place robot character on the bottom and center of the screen
    _placeCharacter(gameBoardElement, characterElement) {
        const xInitPosition = (gameBoardElement.clientWidth / 2) - (characterElement.clientWidth / 2);
        const yInitPosition = gameBoardElement.clientHeight - characterElement.clientHeight;

        this.elements.character.style.left = `${xInitPosition}px`;
        this.elements.character.style.top = `${yInitPosition}px`;
        this.robotObject.xPosition = xInitPosition;
    }

    // Set up event listeners
    _setUpRobotEventListeners() {
        // Keydown function, robot running and shooting
        this.keyDownHandler = (e) => {
            let lastFrameTime = performance.now();
            if (e.key === "ArrowRight") {
                this.robotObject.run("right", lastFrameTime);
            } else if (e.key === "ArrowLeft") {
                this.robotObject.run("left", lastFrameTime);
            } else if (e.key === " " && !this.robotObject.isLaserActive) {   // shoot
                const laserElement = this._createLaserElement();
                this.laserObject = new Laser(laserElement);
                this.robotObject.shoot(this.laserObject, lastFrameTime);
            }
        }

        // Keyup function, stop robot from running
        this.keyUpHandler = (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                this.robotObject.stopRunning();
                this.robotObject.direction = null;
            }
        }

        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
    }

    // Remove event listeners to stop robot control once level win
    _removeRobotEventListeners() {
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        this.robotObject.stopRunning();
    }

    // Dynamically create ball elements
    _createBallElement(ballImage, ballWidth, ballHeight, xPosition, yPosition) {
        const ball = document.createElement("div");
        ball.classList.add("planet-container");
        const ballIcon = document.createElement("img");

        ballIcon.src = ballImage.src;
        ballIcon.setAttribute("alt", "Ball");
        ballIcon.style.width = `${ballWidth}px`;
        ballIcon.style.height = `${ballHeight}px`;
        ball.appendChild(ballIcon);

        ball.style.left = `${xPosition}px`;
        ball.style.top = `${yPosition}px`;

        this.elements.gameBoard.appendChild(ball);

        return ball;
    }

    // Dynamically create laser element
    _createLaserElement() {
        const laser = document.createElement("div");
        laser.classList.add("laser");
        laser.style.height = "0px";  // Laser's initial height
        laser.style.width = "8px"  // Laser's width
        
        const xLaserPosition = this.robotObject.xPosition + this.robotObject.width/2 - parseInt(laser.style.width)/2;  // Center laser on robot
        const yLaserPosition = this.boardHeight - this.robotObject.height/2; // Place laser starting from the middle of character
        
        laser.style.left = `${xLaserPosition}px`;
        laser.style.top = `${yLaserPosition}px`;

        this.elements.gameBoard.appendChild(laser);

        return laser;
    }

    // Check ball collision
    _checkCollision(ball, objectType) {
        const ballRect = ball.ballElement.getBoundingClientRect();

        let collisionElementRect;
        if (objectType === "laser") {
            collisionElementRect = this.laserObject.laserElement.getBoundingClientRect();
        } else if (objectType === "character") {
            collisionElementRect = this.robotObject.characterElement.getBoundingClientRect();
        }

        // Collision conditions
        if (
            ballRect.right >= collisionElementRect.left &&
            ballRect.left <= collisionElementRect.right &&
            ballRect.top <= collisionElementRect.bottom &&
            ballRect.bottom >= collisionElementRect.top
        ) {
            return true;
        } else {
            return false;
        }
    }

    // Ball to character collision logic helper function
    _ballCharacterCollision(ballObject) {
        const collision = this._checkCollision(ballObject, "character");
        if (collision) {
            ballObject.delete();
            this.robotObject.lives--;
        }
    }

    // Ball to laser collision logic helper function
    _ballLaserCollision(ballObject, ballSrc, robotObject, laserObject) {
        if (robotObject.isLaserActive) {
            const ballLaserCollision = this._checkCollision(ballObject, "laser")
            if (ballLaserCollision) {
                this._splitBalls(ballObject, ballSrc);
                robotObject.isLaserActive = false;
                laserObject.delete();
            }
        }
    }

    /*
        This method controls the splitting behaviour of the balls once collision with laser is detected.
        When a collision is detected, the current ball is deleted and split into 2 smaller balls.
        The decrease in ball size is determined by the ball sizes in the ballSizes array.
     */
    _splitBalls(ball, ballSrc) {
        this.ballsKilled++;  // Update number of balls killed

        const currentBallID = ball.id;
        if (currentBallID === 1) {   // If smallest ball, delete it
            ball.delete();
            return;
        }

        const currentBallWidth = ball.width;
        const currentBallHeight = ball.height;
        const currentBallxPosition = ball.xPosition;
        const currentBallyPosition = ball.yPosition;

        const splitBallID = ball.id - 1;
        const splitBallxPosition = currentBallxPosition + currentBallWidth/2;
        const splitBallyPosition = currentBallyPosition + currentBallHeight/2;
        const splitBallProperties = ballSizes[`ball${splitBallID}`];

        // Create 2 balls, 1 which splits left, 1 which splits right
        for (let i = 0; i < 2; i++) {
            // Create ball element
            const ballElement = this._createBallElement(
                ballSrc, 
                splitBallProperties.width,
                splitBallProperties.height,
                splitBallxPosition,
                splitBallyPosition
            );
            
            const yVelocity = -550;  // Launch balls upwards
            let xVelocity = -150;
            if (i === 1) xVelocity = 150;  // Ensure the balls split in opposite directions
            
            // Create ball object
            const ballObject = new Ball(
                ballElement,
                splitBallID,
                xVelocity,
                yVelocity,
                splitBallProperties.bounceHeight,
                this.gameBoard,
            )

            this._activateBall(ballObject);
        }

        // Delete parent ball after being split in 2
        ball.delete();
    }

    _displayLevelWinModal() {
        this.elements.levelWinModal.style.display = "block"
        this.elements.levelWinModal.style.opacity = 1;
        this.elements.levelWinModalBackdrop.style.display = "block";
        this.elements.gameContainer.insertBefore(this.elements.levelWinModalBackdrop, this.elements.gameBoard);
    }

    _closeLevelWinModal() {
        this.elements.levelWinModal.style.display = "none"
        this.elements.levelWinModal.style.opacity = 0;
        this.elements.levelWinModalBackdrop.style.display = "none";
        this.elements.gameContainer.removeChild(this.elements.levelWinModalBackdrop);
    }

    _checkLevelWin(ballsKilled, ballsRequired) {
        if (ballsKilled === ballsRequired) {
            this.levelWin = true;
            this._removeRobotEventListeners();
            this._displayLevelWinModal();
        }
    }

    // Activate ball movement and set collision detection callback functions
   _activateBall(ballObject) {
        let ballSrc = ballObject.ballElement.querySelector("img");
        // Make ball bounce >:^)
        let lastFrameTime = performance.now();
        ballObject.bounce(lastFrameTime);
        
        // The idea to use callback functions to detect collisions is from ChatGPT
        // Set ball callback functions which detects ball collision
        ballObject.onPositionChangeCallback = () => {
            this._ballCharacterCollision(ballObject, ballSrc);
            this._ballLaserCollision(ballObject, ballSrc, this.robotObject, this.laserObject);
            this._checkLevelWin(this.ballsKilled, this.ballsRequired);
        }
   }

    _countdown(i) {
        let delay;
        (i === 0) ? delay=0 : delay=1000;
        if (i < this.elements.countdownText.length+1) {
            setTimeout(() => {
                if (i !== 0) {
                    this.elements.countdownText[i - 1].classList.remove("activate");
                    this.elements.countdownText[i - 1].classList.add("deactivate");
                }

                if (i === this.elements.countdownText.length) {
                    return
                }
               
                this.elements.countdownText[i].classList.add("activate");
                this._countdown(i + 1);
            }, delay);
        }
    }

    // Initialize the level by creating and placing the robot, and create balls
    _initLevel(ballSrc, balls) {
        this._placeCharacter(this.elements.gameBoard, this.elements.character);

        const ballObjects = []
        // Create initial balls once level starts
        for (let ball of balls) {
            // Create ball DOM element
            const ballElem = this._createBallElement(ballSrc, ball.ballSize.width, ball.ballSize.height, ball.xPosition, ball.yPosition);
            // Create new ball object
            const ballObject = new Ball(ballElem, ball.id, ball.xVelocity, ball.yVelocity, ball.ballSize.bounceHeight, this.elements.gameBoard);
            ballObjects.push(ballObject);
        }

        return ballObjects;
    }

    _resetLevel() {
        this.ballsKilled = 0;  // Reset the ball kill count
        this.ballsRequired = 0;   //
        this.levelWin = false;  // Reset level win flag

        // Remove deactivate class from countdown text
        for (let countdown of this.elements.countdownText) {
            countdown.classList.remove("deactivate");
        }
    }

    

    _resetGame() {
        this._resetLevel();
        this.currentLevel = 0;
        this.robotObject = null;

    }

    // Level method
    playLevel(level) {
        // Collect balls src and array from levels array
        const { 
            ballSrc,
            ballsRequired,
            balls,
        } = this.levels[level];

        this.ballsRequired = ballsRequired;
        console.log(this.ballsRequired)
        const ballObjects = this._initLevel(ballSrc, balls);  // initialize level

        this.elements.countdownContainer.style.display = "flex";
        this._countdown(0);

        setTimeout(() => {
            this.elements.countdownContainer.style.display = "none";
            this._setUpRobotEventListeners();
            for (let ballObject of ballObjects) {
                this._activateBall(ballObject);
            }
        }, 5000);
    }


    _devmode() {
        console.log("Dev Mode")
        this.elements.introScreen.classList.add("hide");
        this.elements.gameBoard.style.opacity = 100;
        this.elements.gameBoard.style.transition = null;
        this.robotObject = new Robot(this.elements.character, this.elements.characterIcon, this.elements.gameBoard);
        this.playLevel(this.currentLevel);
    }

    
}

// const game = new GameController(true);
const game = new GameController();

/* ********************************************
                Game Controller
*********************************************** */
