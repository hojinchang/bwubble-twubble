"use-strict";

class DankBeatz {
    constructor () {
        this.audioMode = "mute";
        this.easterEggAudio = document.querySelector(".ima-firin-mah-lazer");
        this.chillBackgroundMusic = document.querySelector(".chill-background-music");
        this.hypeBackgroundMusic = document.querySelector(".hype-background-music");
        this.selectAudio = document.querySelector(".select-audio");
        this.chillCountdownAudio = document.querySelector(".chill-countdown-audio");
        this.hypeCountdownAudio = document.querySelector(".hype-countdown-audio");
        this.laserAudio = document.querySelector(".laser-audio");
        this.collisionAudio = document.querySelector(".collision-audio");
        this.timeRewardAudio = document.querySelector(".time-reward-audio");
    }

    // Helper function which only plays the audio if not in mode mode
    _playSound(audioElement, volume) {
        if (this.audioMode !== "mute") {
            audioElement.currentTime = 0;
            audioElement.volume = volume;
            audioElement.play();
        }
    }

    // Easter egg audio sound
    imaFirinMahLazer() {
        this._playSound(this.easterEggAudio, 0.8);
    }

    // Slowly fade in the track and pause the previous one
    _fadeInMusic(track, previousTrack, fadeTime, targetVolume) {
        const _fade = () => {
            let volume = 0;
            const steps = 100;
            const increment = (targetVolume - volume) / steps;
            const interval = fadeTime / steps;

            const fade = setInterval(() => {
                volume += increment;
                track.volume = volume;

                if (volume >= targetVolume) {
                    clearInterval(fade);
                }
            }, interval);
        }

        track.volume = 0;
        track.loop = true;
        track.currentTime = 0;
        track.play();

        previousTrack.pause();
        _fade();
    }

    // Play background music
    playBackgroundMusic() {
        if (this.audioMode !== "mute") {
            if (this.audioMode === "chill-mode") {
                this._fadeInMusic(this.chillBackgroundMusic, this.hypeBackgroundMusic, 5000, 0.35);
            } else if (this.audioMode === "hype-mode") {
                this._fadeInMusic(this.hypeBackgroundMusic, this.chillBackgroundMusic, 3000, 0.1);
            }
        }
    }

    // Mute the audios
    mute() {
        this.chillBackgroundMusic.pause();
        this.hypeBackgroundMusic.pause();
    }

    // Button selection sound
    select() {
        this._playSound(this.selectAudio, 0.5);
    }

    // Level countdown sound
    countdown() {
        if (this.audioMode === "chill-mode") {
            this._playSound(this.chillCountdownAudio, 0.6);
        } else if (this.audioMode === "hype-mode") {
            this._playSound(this.hypeCountdownAudio, 0.6);
        }
    }

    // Laser firing sound
    laser() {
        this._playSound(this.laserAudio, 0.5);
    }

    // Collision sound
    collision() {
        this._playSound(this.collisionAudio, 0.4);
    }

    // Level win sound
    timeReward() {
        this._playSound(this.timeRewardAudio, 0.2);
    }
}