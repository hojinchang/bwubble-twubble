"use-strict";

/* ********************************************
                    Timer
*********************************************** */
class Timer {
    constructor(
        timerElement
    ) {
        this.timerElement = timerElement;
        this.maxWidth = this.timerElement.clientWidth
        this.width = this.maxWidth;
        this.stopped = false;
        this.animationFrame;
        this._onTimerEnd = null;  // This callback function is triggered once the timer runs out. The callback function is used to reset the game once the timer runs out
        this._onTimerAddPoints = null;
        this._onTimerAddPointsEnd = null;
    }

    // Starts the timer animation
    start(lastFrameTime) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;
        const step = 20*deltaTime;

        this.width -= step;
        this.timerElement.style.width = `${this.width}px`;

        if (this.stopped) return;
        if (this.width <= 0) {
            if (this._onTimerEnd) {
                this.timerElement.style.display = "none";  // For some reason, the red from the timer still shows when this.width <= 0, so hide it when time runs out
                this._onTimerEnd();
            }

            return;
        }

        this.animationFrame = requestAnimationFrame(() => {this.start(lastFrameTime)});
    }

    addTimerPoints(lastFrameTime) {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;
        const step = 500*deltaTime;

        this.width -= step;
        this.timerElement.style.width = `${this.width}px`;

        if (this._onTimerAddPoints) this._onTimerAddPoints();
    
        
        if (this.width <= 0) {
            this.timerElement.style.display = "none";
            this.stop();

            if (this._onTimerAddPointsEnd) this._onTimerAddPointsEnd();

            return;
        }   

        this.animationFrame = requestAnimationFrame(() => {this.addTimerPoints(lastFrameTime)});
    }

    // Stop the timer
    stop() {
        this.animationFrame = null;
        this.stopped = true;
    }

    // Reset the timer
    reset() {
        this.timerElement.style.display = "block";   // Show the red timer
        this.timerElement.style.width = "100%";   // Reset the timer width to be as long as its container
        this.width = this.timerElement.clientWidth;   // Reset width property
        this.stopped = false;
    }
} 

/* ********************************************
                    Timer
*********************************************** */