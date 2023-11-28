"use-strict"

/* ********************************************
                     Robot
*********************************************** */
class Robot {
    constructor(
        characterElement, 
        characterIcon, 
        gameBoardElement,
    ) {
        this.lives = 1;
        this.characterElement = characterElement;
        this.characterIcon = characterIcon;
        this.gameBoardElement = gameBoardElement;
        this.width = this.characterElement.clientWidth;
        this.height = this.characterElement.clientHeight;
        this.boardWidth = this.gameBoardElement.clientWidth;
        this.boardHeight = this.gameBoardElement.clientHeight;

        this.idleState = "../assets/character/Idle-1.png";
        this.isRunning = false;
        this.runAnimationFrame;
        this.runIdx = 0;
        this.direction;
        this.xPosition;

        this.laserObject;
        this.isLaserActive = false;

        this.runImages = this._getRunImages();
        this._runAnimation = this._runAnimation.bind(this);   // bind this instance to be the robot object, this loses pointer to robot object during animation frame
        this._laserAnimation = this._laserAnimation.bind(this);   // bind this instance to be the robot object, this loses pointer to robot object during animation frame
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
    _runAnimation(lastFrameTime) {
        this.characterIcon.src = this.runImages[this.runIdx].src;
        this.xPosition = parseInt(this.characterElement.style.left);   // Current xPosition
        
        // chatGPT's solution to create frame rate independent animations. Animations differ based on monitor/screen's frame rate (Hz)
        const currentTime = performance.now(); // Get current timestamp
        const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
        lastFrameTime = currentTime;

        const speed = 200;
        const step = Math.ceil(speed * deltaTime);

        // Update the xPosition depending on if moving left or right
        (this.direction === "left") 
            ? this.xPosition -= step   // Move left
            : this.xPosition += step;  // Move right

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
        this.runAnimationFrame = requestAnimationFrame(() => this._runAnimation(lastFrameTime));
    }

    // Run method
    run(direction, lastFrameTime) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.direction = direction;

            (this.direction === "left") 
                ? this.characterElement.classList.add("flip-character") 
                : this.characterElement.classList.remove("flip-character");

            this._runAnimation(lastFrameTime);
        }
    }


    _laserAnimation(yLaserStart, lastFrameTime) {
        // this.isLaserActive is set false in the GameController when a collision between the laser and ball is detected
        // Break out of the laser animation when collision occurs
        if (!this.isLaserActive) return;
        
        // chatGPT's solution to create frame rate independent animations. Animations differ based on monitor/screen's frame rate (Hz)
        const currentTime = performance.now(); // Get current timestamp
        const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
        lastFrameTime = currentTime;

        // Increase the height of the laser object's property and laser DOM element
        const step = Math.ceil(500 * deltaTime);
        this.laserObject.height += step;
        this.laserObject.laserElement.style.height = `${this.laserObject.height}px`;

        /*
            Since the origin is the top left corner of the board, with positive y direction downwards, 
            increasing the height increases the lasers height in the downward direction. The top offset
            is changed to counteract the laser's growth downward.
        */
        const laserOffset = yLaserStart - this.laserObject.height;
        this.laserObject.laserElement.style.top = `${laserOffset}px`
        
        /*
            If the laser's height reaches the top of the screen, stop the laser animation and delete the laser
            from the DOM and its instance.
            Else, continue the laser animation.
        */
        if ((this.laserObject.height + this.height/2) >= this.boardHeight) {    // Since the laser starts from the center of the robot, half of the character height must be added to the laser height to "reach" the top of the gameboard
            cancelAnimationFrame(this.laserAnimationFrame);
            this.isLaserActive = false;

            this.laserObject.delete();   // Delete the laser object and DOM element
            this.laserObject = null;   // Remove laserObject from robot class
        } else {
            this.laserAnimationFrame = requestAnimationFrame(() => this._laserAnimation(yLaserStart, lastFrameTime));
        }
    }

    // Shoot method
    shoot(laserObject, lastFrameTime) {
        // Only shoot if there is no lasers active
        if (!this.isLaserActive) {
            this.isLaserActive = true;
            this.laserObject = laserObject;
 
            const yLaserStart = this.boardHeight - this.height/2;   // Make laser start at middle of character height 
            this._laserAnimation(yLaserStart, lastFrameTime);
        }
    }

    stopLaser() {
        cancelAnimationFrame(this.laserAnimationFrame);
        this.isLaserActive = false;
    }
    
    // Stop running method
    stopRunning() {
        cancelAnimationFrame(this.runAnimationFrame);
        this.isRunning = false;
        this.characterIcon.src = this.idleState;
    }
}
/* ********************************************
                     Robot
*********************************************** */


/* ********************************************
                     Laser
*********************************************** */
class Laser {
    constructor(
        laserElement
    ) {
        this.laserElement = laserElement;
        this.height = 0;
        this.width = parseInt(this.laserElement.style.width);
    }

    delete() {
        this.laserElement.remove();
    }
}
/* ********************************************
                     Laser
*********************************************** */