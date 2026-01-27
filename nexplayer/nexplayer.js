// nexplayer.js

class NexPlayer {
    constructor(config) {
        this.selector = config.selector;
        this.source = config.source;
        this.container = document.querySelector(this.selector);
        
        // স্টেট ভেরিয়েবল
        this.video = null;
        this.hls = null;
        this.isControlsVisible = false;
        this.hideControlsTimeout = null;

        this.init();
    }

    init() {
        // UI সেটআপ
        this.container.classList.add('nex-container');
        this.container.innerHTML = `
            <video class="nex-video" playsinline></video>
            <div class="nex-loader"></div>
            <div class="nex-controls">
                <button class="nex-btn nex-play-btn">▶</button>
                <input type="range" class="nex-volume-slider" min="0" max="1" step="0.1" value="1">
                <div class="nex-live-badge"><div class="nex-live-dot"></div> LIVE</div>
                <button class="nex-btn nex-fs-btn">⛶</button>
            </div>
        `;

        // এলিমেন্ট সিলেক্ট
        this.video = this.container.querySelector('.nex-video');
        this.loader = this.container.querySelector('.nex-loader');
        this.controls = this.container.querySelector('.nex-controls');
        this.playBtn = this.container.querySelector('.nex-play-btn');
        this.volumeSlider = this.container.querySelector('.nex-volume-slider');
        this.fsBtn = this.container.querySelector('.nex-fs-btn');

        // ইঞ্জিন স্টার্ট
        this.loadSource();
        this.attachEvents();
    }

    loadSource() {
        // ১. লোডার অন করা
        this.loader.style.display = 'block';

        // ২. HLS সাপোর্ট চেক (Chrome, Firefox, Edge, Android)
        if (Hls.isSupported()) {
            this.hls = new Hls({
                debug: false,
                enableWorker: true, // ভালো পারফর্মেন্সের জন্য
                lowLatencyMode: true // লাইভ স্ট্রিমিং এর জন্য ফাস্ট
            });

            this.hls.loadSource(this.source);
            this.hls.attachMedia(this.video);

            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("NexPlayer: Ready (HLS Engine)");
                this.loader.style.display = 'none';
                // অটো প্লে পলিসির কারণে মিউট ছাড়া অটো প্লে নাও হতে পারে
                // this.video.play().catch(e => console.log("Auto-play blocked"));
            });

            // ৩. স্মার্ট এরর রিকভারি (Smart Feature)
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("Network error, recovering...");
                            this.hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("Media error, recovering...");
                            this.hls.recoverMediaError();
                            break;
                        default:
                            console.error("Fatal Error, stopping.");
                            this.hls.destroy();
                            break;
                    }
                }
            });

        } 
        // ৪. সাফারি বা আইফোন সাপোর্ট (Native HLS)
        else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            console.log("NexPlayer: Native Safari Support");
            this.video.src = this.source;
            this.video.addEventListener('loadedmetadata', () => {
                this.loader.style.display = 'none';
            });
        }
    }

    attachEvents() {
        // প্লে/পজ
        const togglePlay = () => {
            if (this.video.paused) {
                this.video.play();
            } else {
                this.video.pause();
            }
        };

        this.playBtn.addEventListener('click', togglePlay);
        
        // ভিডিওতে ক্লিক করলে মোবাইলে কন্ট্রোল দেখাবে, ডেস্কটপে প্লে/পজ হবে
        this.video.addEventListener('click', () => {
            this.toggleControls();
        });

        // বাটন আপডেট
        this.video.addEventListener('play', () => this.playBtn.innerText = '⏸');
        this.video.addEventListener('pause', () => this.playBtn.innerText = '▶');

        // লোডিং বাফারিং হ্যান্ডেল
        this.video.addEventListener('waiting', () => this.loader.style.display = 'block');
        this.video.addEventListener('playing', () => this.loader.style.display = 'none');

        // ভলিউম
        this.volumeSlider.addEventListener('input', (e) => this.video.volume = e.target.value);

        // ফুলস্ক্রিন
        this.fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                this.container.requestFullscreen().catch(err => console.log(err));
            } else {
                document.exitFullscreen();
            }
        });

        // মাউস মুভমেন্টে কন্ট্রোল শো/হাইড
        this.container.addEventListener('mousemove', () => this.showControlsTemp());
        this.container.addEventListener('touchstart', () => this.showControlsTemp());
    }

    toggleControls() {
        this.container.classList.toggle('show-controls');
    }

    showControlsTemp() {
        this.container.classList.add('show-controls');
        clearTimeout(this.hideControlsTimeout);
        this.hideControlsTimeout = setTimeout(() => {
            if (!this.video.paused) { // ভিডিও পজ থাকলে কন্ট্রোল হাইড হবে না
                this.container.classList.remove('show-controls');
            }
        }, 3000); // ৩ সেকেন্ড পর হাইড হবে
    }
}
