"use-strict";

/* ********************************************
                Game UI
*********************************************** */
class GameUI {
    constructor() {
        this.elements = {};
        this._getElements();
        this.boardHeight = this.elements.gameBoard.clientHeight;
        this.ballImages = this._getBallImages();
    }

    // Collect the required DOM elements
    _getElements() {
        this.elements.gameContainer = document.querySelector(".game-container");
        this.elements.introScreen = document.querySelector(".intro-screen");
        this.elements.startGameBtn = document.querySelector(".start-game-btn");
        this.elements.buttons = document.querySelectorAll(".select-btn");

        this.elements.previousTrackBtn = document.querySelector(".previous-audio-btn");
        this.elements.nextTrackBtn = document.querySelector(".next-audio-btn");
        this.elements.audioTracks = document.querySelectorAll(".audio-mode");

        this.elements.instructionsBtn = document.querySelector(".instructions-btn");
        this.elements.instructionsModal = document.querySelector(".instructions-modal");
        this.elements.instructionsEasterEgg = document.querySelector(".shoot-instructions img");

        this.elements.creditsBtn = document.querySelector(".credits-btn");
        this.elements.creditsModal = document.querySelector(".credits-modal")

        this.elements.gameBoard = document.querySelector(".game-board");
        this.elements.countdownContainer = document.querySelector(".countdown-container");
        this.elements.countdownText = document.querySelectorAll(".countdown-container div");
        this.elements.loseReasonContainer = document.querySelector(".lose-reason-container");

        this.elements.gameLoseModal = document.querySelector(".game-lose-modal");
        this.elements.gameWinModal = document.querySelector(".game-win-modal");
        this.elements.outputScore = document.querySelectorAll(".output-score");
        this.elements.outputKillCount = document.querySelectorAll(".output-kill-count");


        this.elements.levelWinModal = document.querySelector(".level-win-modal");
        this.elements.currentLevelSpan = document.querySelector(".current-level");
        this.elements.nextLevelBtn = document.querySelector(".next-level-btn");
        this.elements.returnMainBtn = document.querySelectorAll(".return-menu-btn");

        this.elements.character = document.querySelector(".character-container");
        this.elements.characterHitbox = document.querySelector(".character-hitbox");
        this.elements.characterIcon = document.querySelector(".character-icon");

        this.elements.scoreBoard = document.querySelector(".score-board");
        this.elements.levelText = document.querySelector(".level-text");
        this.elements.lifeHearts = document.querySelectorAll(".heart-icon");
        this.elements.scoreText = document.querySelector(".score-text");
        this.elements.timer = document.querySelector(".timer");

        this.elements.modalCloseBtn = document.querySelectorAll(".modal-close-button");
        this.elements.introModalBackdrop = document.createElement("div");
        this.elements.introModalBackdrop.classList.add("modal-backdrop", "intro-modal-backdrop");
        this.elements.inGameModalBackdrop = document.createElement("div");
        this.elements.inGameModalBackdrop.classList.add("modal-backdrop", "level-win-modal-backdrop");
    }

    // Load ball images into image object
    _getBallImages() {
        const ballImages = [];
        for (let i = 0; i < 10; i++) {
            const image = new Image();
            // image.src = `../assets/planets/planet0${i}.png`;
            image.src = `./assets/planets/planet0${i}.png`;

            ballImages.push(image);
        }
        return ballImages;
    }
    

    // Show level win modal
    _displayInGameModal(modal) {
        modal.style.display = "block"
        modal.style.opacity = 1;
        this.elements.inGameModalBackdrop.style.display = "block";
        this.elements.gameContainer.insertBefore(this.elements.inGameModalBackdrop, this.elements.gameBoard);
    }

    // Close level win modal
    _closeInGameModal(modal) {
        modal.style.display = "none"
        modal.style.opacity = 0;
        this.elements.inGameModalBackdrop.style.display = "none";
        this.elements.gameContainer.removeChild(this.elements.inGameModalBackdrop);
    }

    // Place robot character on the bottom and center of the screen
    _placeCharacter(gameBoardElement, characterElement, robotObject) {
        const xInitPosition = (gameBoardElement.clientWidth / 2) - (characterElement.clientWidth / 2);
        const yInitPosition = gameBoardElement.clientHeight - characterElement.clientHeight;

        this.elements.character.style.left = `${xInitPosition}px`;
        this.elements.character.style.top = `${yInitPosition}px`;
        robotObject.xPosition = xInitPosition;
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
    _createLaserElement(robotObject) {
        const laser = document.createElement("div");
        laser.classList.add("laser");
        laser.style.height = "0px";  // Laser's initial height
        laser.style.width = "8px"  // Laser's width
        
        const xLaserPosition = robotObject.xPosition + robotObject.width/2 - parseInt(laser.style.width)/2;  // Center laser on robot
        const yLaserPosition = this.elements.gameBoard.clientHeight - robotObject.height/2; // Place laser starting from the middle of character
        
        laser.style.left = `${xLaserPosition}px`;
        laser.style.top = `${yLaserPosition}px`;

        this.elements.gameBoard.appendChild(laser);

        return laser;
    }

    // Level countdown method
    _countdown(i) {
        let delay;
        (i === 0) ? delay = 0 : delay = 1000;
        if (i < this.elements.countdownText.length + 1) {  // Countdown from 3 to 0
            setTimeout(() => {
                if (i !== 0) {
                    this.elements.countdownText[i - 1].classList.remove("activate");   // Remove class
                    this.elements.countdownText[i - 1].classList.add("deactivate");   //  Slide number out of view
                }

                // break out of loop
                if (i === this.elements.countdownText.length) {
                    return
                }
               
                this.elements.countdownText[i].classList.add("activate");   // Slide number into view
                this._countdown(i + 1);
            }, delay);
        }
    }

    // Update hearts based on # of lives
    _updateLifeHearts(robotObject) {
        const lives = robotObject.lives;
        for (let i = 0; i < 3; i++) {
            if (i < lives) {
                this.elements.lifeHearts[i].src = "./assets/scoreboard/heart.png";
            } else {
                this.elements.lifeHearts[i].src = "./assets/scoreboard/heart-black.png";
            }
        }
    }

    // Display stats at the end of the game
    _setOutputStats(currentScore, totalBallsKilled) {
        this.elements.outputScore.forEach(element => element.innerText = currentScore);
        this.elements.outputKillCount.forEach(element => element.innerText =totalBallsKilled);
    }

}
