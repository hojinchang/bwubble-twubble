"use-strict";

/* ********************************************
                    Timer
*********************************************** */
class Timer {
    constructor(
        timerElement
    ) {
        this.timerElement = timerElement;
        this.width = this.timerElement.clientWidth;
        this.stopped = false;
        this.animationFrame;
        this._onTimerEnd = null;  // This callback function is triggered once the timer runs out. The callback function is used to reset the game once the timer runs out
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
                this._onTimerEnd();
            }

            return;
        }

        this.animationFrame = requestAnimationFrame(() => {this.start(lastFrameTime)});
    }

    // Stop the timer
    stop() {
        this.animationFrame = null;
        this.stopped = true;
    }

    // Reset the timer
    reset() {
        this.timerElement.style.width = "100%";
        this.width = this.timerElement.clientWidth;
        this.stopped = false;
    }
} 

/* ********************************************
                    Timer
*********************************************** */