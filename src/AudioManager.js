export class AudioManager {
    constructor() {
        this.sfx = {};
        this.music = null;
        this.isMuted = false;
        
        // Music: Fast-paced synthwave
        this.musicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder synth-like
    }

    playMusic() {
        if (this.music) return;
        this.music = new Audio(this.musicUrl);
        this.music.loop = true;
        this.music.volume = 0.3;
        this.music.play().catch(() => {
            console.log('Audio playback requires user interaction.');
            // Try again on first click
            window.addEventListener('click', () => {
                if (this.music) this.music.play();
            }, { once: true });
        });
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music = null;
        }
    }

    playSFX(type) {
        try {
            if (this.isMuted) return;
            
            // Simple synthetic beeps using Web Audio API for zero-latency
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                this.audioCtx = new AudioContext();
            }
            
            // Resume if suspended (common in browsers)
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            let freq = 440;
            let duration = 0.1;
            
            switch(type) {
                case 'coin': freq = 880; break;
                case 'diamond': freq = 1200; duration = 0.2; break;
                case 'powerup': freq = 660; duration = 0.3; break;
                case 'jump': freq = 330; break;
                case 'hit': freq = 110; duration = 0.5; break;
            }
            
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Audio SFX failed:', e);
        }
    }
}
