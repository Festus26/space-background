// Space Animation - animated space background on a <canvas>, no dependencies
// MIT License (c) Semih Yıldırım - https://github.com/Festus26/space-background
//
// Starts automatically on <canvas id="space-canvas"> and fills that canvas's CSS box.
// Options (data attributes on the canvas, or URL parameters which win):
//   data-fps / ?fps=                  frame rate cap (default 60)
//   data-battery-fps / ?batteryFps=   frame rate cap on battery, where the browser reports it (default 30)
//   data-comet-fps / ?cometFps=       frame rate cap while meteors or shooting stars are on screen
//                                     (default: the display's full refresh rate, overriding the caps above)
// Other canvases: SpaceAnimation.start(canvas, { fps: 30 }) returns { stop() }.

(function() {
    const DEFAULTS = {
        fps: 60,
        batteryFps: 30,
        cometFps: 0         // 0 = the display's full refresh rate
    };

    const NUM_STARS = 200;
    const NUM_NEBULAE = 5;
    const SKY_SCALE = 1;            // background + nebulae at CSS resolution; lower scales show blocky banding
    const SKY_REDRAW_MS = 100;      // nebulae drift a few pixels per second; no need to redraw them every frame
    const MAX_STEP = 6;             // after a pause, advance at most 6 frames' worth of motion

    // Colors as [r, g, b, max alpha] so opacity can be applied when drawing
    const STAR_COLORS = [
        [255, 255, 255, 1],     // White
        [173, 216, 230, 1],     // Light blue
        [255, 244, 229, 1],     // Cream
        [255, 210, 161, 1],     // Light orange
        [224, 122, 95, 0.8],    // Reddish
        [129, 236, 236, 0.8]    // Cyan
    ];

    const NEBULA_COLORS = [
        [63, 81, 181, 0.07, 0.03],     // Blue
        [156, 39, 176, 0.07, 0.03],    // Purple
        [233, 30, 99, 0.07, 0.03],     // Pink
        [76, 175, 80, 0.06, 0.02],     // Green
        [255, 152, 0, 0.06, 0.02]      // Orange
    ];

    function rgba(c, alpha) {
        return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
    }

    function readOptions(canvas, overrides) {
        const options = Object.assign({}, DEFAULTS, overrides);
        const params = new URLSearchParams(window.location.search);
        const sources = [
            ['fps', canvas.dataset.fps, params.get('fps')],
            ['batteryFps', canvas.dataset.batteryFps, params.get('batteryFps')],
            ['cometFps', canvas.dataset.cometFps, params.get('cometFps')]
        ];
        sources.forEach(([key, dataValue, urlValue]) => {
            [dataValue, urlValue].forEach(value => {
                const number = parseFloat(value);
                if (number > 0) options[key] = number;
            });
        });
        return options;
    }

    function start(canvas, overrides) {
        const options = readOptions(canvas, overrides);
        const ctx = canvas.getContext('2d', { alpha: false });
        const sky = document.createElement('canvas');
        const skyCtx = sky.getContext('2d', { alpha: false });

        const stars = [];
        const nebulae = [];
        const shootingStars = [];
        const meteors = [];

        // Size in CSS pixels; drawing uses these coordinates and the transform handles Retina scaling
        let width = 0;
        let height = 0;

        let running = false;
        let frameId = 0;
        let lastFrameTime = 0;
        let lastSkyTime = -Infinity;
        let onBattery = false;
        let inView = true;
        let stopped = false;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Generate stars with colored stars
        function generateStars() {
            stars.length = 0;
            for (let i = 0; i < NUM_STARS; i++) {
                const colorIndex = Math.random() > 0.7 ? Math.floor(Math.random() * STAR_COLORS.length) : 0;
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2,
                    color: STAR_COLORS[colorIndex],
                    pulsate: Math.random() > 0.9,
                    pulsateSpeed: Math.random() * 0.02 + 0.01
                });
            }
        }

        // Generate nebulae with vibrant colors
        function generateNebulae() {
            nebulae.length = 0;
            for (let i = 0; i < NUM_NEBULAE; i++) {
                nebulae.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * width * 0.7 + width * 0.3,
                    color: NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)],
                    phase: Math.random() * Math.PI * 2
                });
            }
        }

        // Create a meteor
        function createMeteor() {
            meteors.push({
                x: Math.random() * width,
                y: -50,
                angle: Math.PI / 2 + (Math.random() - 0.5) * 0.5,
                speed: 4 + Math.random() * 7,
                length: 80 + Math.random() * 120,
                hue: Math.floor(Math.random() * 60),
                particles: [],
                width: 3 + Math.random() * 2
            });
        }

        // Create a shooting star
        function createShootingStar() {
            const angle = Math.random() * Math.PI * 2;
            const startX = width / 2 + Math.cos(angle) * (width + 100);
            const startY = height / 2 + Math.sin(angle) * (height + 100);

            const distanceFromCenter = Math.random() * (width / 3) + (width / 6);
            const endX = width / 2 + Math.cos(angle + Math.PI) * distanceFromCenter;
            const endY = height / 2 + Math.sin(angle + Math.PI) * distanceFromCenter;
            const totalDist = Math.hypot(endX - startX, endY - startY);

            shootingStars.push({
                startX, startY,
                currentX: startX,
                currentY: startY,
                dirX: (endX - startX) / totalDist,
                dirY: (endY - startY) / totalDist,
                totalDist,
                length: 100 + Math.random() * 100,
                speed: 3 + Math.random() * 5,
                hue: Math.floor(Math.random() * 360)
            });
        }

        // Chance per 60fps frame, adjusted for how many frames' worth of time passed
        function chance(perFrame, step) {
            return Math.random() < 1 - Math.pow(1 - perFrame, step);
        }

        // Background gradient and nebulae, drawn to the low-resolution sky canvas
        function drawSky(step) {
            skyCtx.setTransform(SKY_SCALE, 0, 0, SKY_SCALE, 0, 0);

            const bgGradient = skyCtx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, 'rgba(10, 10, 30, 1)');
            bgGradient.addColorStop(1, 'rgba(5, 5, 20, 1)');
            skyCtx.fillStyle = bgGradient;
            skyCtx.fillRect(0, 0, width, height);

            nebulae.forEach(nebula => {
                nebula.phase += 0.005 * step;
                const x = nebula.x + Math.sin(nebula.phase) * 20;
                const y = nebula.y + Math.cos(nebula.phase) * 20;

                const gradient = skyCtx.createRadialGradient(x, y, 0, x, y, nebula.radius);
                gradient.addColorStop(0, rgba(nebula.color, nebula.color[3]));
                gradient.addColorStop(1, rgba(nebula.color, nebula.color[4]));

                skyCtx.beginPath();
                skyCtx.arc(x, y, nebula.radius, 0, Math.PI * 2);
                skyCtx.fillStyle = gradient;
                skyCtx.fill();
            });
        }

        // Update and draw stars
        function drawStars(step, now, still) {
            stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed * step;
                const twinkleOpacity = still ? 1 : (Math.sin(star.twinklePhase) + 1) / 2 * 0.5 + 0.5;

                let radius = star.radius;
                if (star.pulsate && !still) {
                    radius += Math.sin(now * star.pulsateSpeed) * 0.5;
                }

                ctx.beginPath();
                ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = rgba(star.color, star.color[3] * star.opacity * twinkleOpacity);
                ctx.fill();
            });
        }

        // Update and draw meteors
        function updateMeteors(step) {
            for (let i = meteors.length - 1; i >= 0; i--) {
                const meteor = meteors[i];

                meteor.x += Math.cos(meteor.angle) * meteor.speed * step;
                meteor.y += Math.sin(meteor.angle) * meteor.speed * step;

                if (chance(0.3, step)) {
                    meteor.particles.push({
                        x: meteor.x - Math.cos(meteor.angle) * (Math.random() * 5),
                        y: meteor.y - Math.sin(meteor.angle) * (Math.random() * 5),
                        size: 1 + Math.random() * 2,
                        opacity: 1,
                        hue: meteor.hue + Math.floor(Math.random() * 20)
                    });
                }

                for (let j = meteor.particles.length - 1; j >= 0; j--) {
                    const particle = meteor.particles[j];
                    particle.opacity -= 0.02 * step;
                    particle.size *= Math.pow(0.97, step);

                    if (particle.opacity <= 0 || particle.size <= 0.5) {
                        meteor.particles.splice(j, 1);
                    } else {
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.opacity})`;
                        ctx.fill();
                    }
                }

                const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
                const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;
                const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
                gradient.addColorStop(0, `hsla(${meteor.hue}, 100%, 70%, 1)`);
                gradient.addColorStop(0.3, `hsla(${meteor.hue + 20}, 100%, 50%, 0.6)`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.beginPath();
                ctx.moveTo(meteor.x, meteor.y);
                ctx.lineTo(tailX, tailY);
                ctx.lineWidth = meteor.width;
                ctx.strokeStyle = gradient;
                ctx.stroke();

                if (meteor.y > height + 100 || meteor.x < -100 || meteor.x > width + 100) {
                    meteors.splice(i, 1);
                }
            }
        }

        // Update and draw shooting stars
        function updateShootingStars(step) {
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const star = shootingStars[i];

                star.currentX += star.dirX * star.speed * step;
                star.currentY += star.dirY * star.speed * step;

                const progress = Math.hypot(star.currentX - star.startX, star.currentY - star.startY) / star.totalDist;
                if (progress >= 1) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                // Fade in during the first 20%, fade out during the last 20%
                let alpha = 1;
                if (progress < 0.2) alpha = progress * 5;
                else if (progress > 0.8) alpha = (1 - progress) * 5;

                const trailLength = star.length * (1 - Math.min(progress * 2, 1));
                const trailX = star.currentX - star.dirX * trailLength;
                const trailY = star.currentY - star.dirY * trailLength;
                const color = `hsla(${star.hue}, 80%, 80%, ${alpha})`;

                const gradient = ctx.createLinearGradient(trailX, trailY, star.currentX, star.currentY);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(1, color);

                ctx.beginPath();
                ctx.moveTo(trailX, trailY);
                ctx.lineTo(star.currentX, star.currentY);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(star.currentX, star.currentY, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }

        function render(now, step) {
            const still = reducedMotion.matches;

            const skyElapsed = now - lastSkyTime;
            if (still || skyElapsed >= SKY_REDRAW_MS) {
                const skyStep = (still || !isFinite(skyElapsed)) ? 0 : Math.min(skyElapsed / (1000 / 60), 30);
                drawSky(skyStep);
                lastSkyTime = now;
            }

            const dpr = canvas.width / width;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(sky, 0, 0, width, height);

            drawStars(still ? 0 : step, now, still);

            if (!still) {
                updateMeteors(step);
                updateShootingStars(step);
                if (chance(0.01, step)) createShootingStar();
                if (chance(0.005, step)) createMeteor();
            }
        }

        // Animation loop with a frame rate cap
        function animate(now) {
            frameId = requestAnimationFrame(animate);

            // Fast-moving meteors and shooting stars look choppy at a low frame rate, so lift the cap while any are on screen
            const cometsActive = meteors.length > 0 || shootingStars.length > 0;
            const fps = cometsActive ? options.cometFps : (onBattery ? Math.min(options.fps, options.batteryFps) : options.fps);
            const elapsed = now - lastFrameTime;
            if (fps > 0 && elapsed < 1000 / fps - 2) return;

            // Movement was tuned for 60fps; scale it by real elapsed time so 120Hz screens aren't twice as fast
            const step = Math.min(elapsed / (1000 / 60), MAX_STEP);
            lastFrameTime = now;
            render(now, step);
        }

        // Run only while visible, and not at all when the user prefers reduced motion
        function updateRunning() {
            const shouldRun = !stopped && inView && !document.hidden && !reducedMotion.matches && width > 0;
            if (shouldRun && !running) {
                running = true;
                lastFrameTime = performance.now();
                frameId = requestAnimationFrame(animate);
            } else if (!shouldRun && running) {
                running = false;
                cancelAnimationFrame(frameId);
            }
            // A still frame for reduced motion
            if (!stopped && reducedMotion.matches && width > 0) render(performance.now(), 0);
        }

        // Match the canvas to its CSS box, keeping the existing sky in place
        function resize() {
            const rect = canvas.getBoundingClientRect();
            const newWidth = Math.round(rect.width);
            const newHeight = Math.round(rect.height);
            if (newWidth === 0 || newHeight === 0) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(newWidth * dpr);
            canvas.height = Math.round(newHeight * dpr);
            sky.width = Math.ceil(newWidth * SKY_SCALE);
            sky.height = Math.ceil(newHeight * SKY_SCALE);

            if (width === 0) {
                width = newWidth;
                height = newHeight;
                generateNebulae();
                generateStars();
            } else if (newWidth !== width || newHeight !== height) {
                const sx = newWidth / width;
                const sy = newHeight / height;
                stars.forEach(star => { star.x *= sx; star.y *= sy; });
                nebulae.forEach(nebula => { nebula.x *= sx; nebula.y *= sy; nebula.radius *= sx; });
                width = newWidth;
                height = newHeight;
            }

            lastSkyTime = -Infinity;
            render(performance.now(), 0); // avoid a blank frame after resizing
            updateRunning();
        }

        let resizeTimer = 0;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, width === 0 ? 0 : 150);
        });
        resizeObserver.observe(canvas);

        const intersectionObserver = new IntersectionObserver(entries => {
            inView = entries[entries.length - 1].isIntersecting;
            updateRunning();
        });
        intersectionObserver.observe(canvas);

        document.addEventListener('visibilitychange', updateRunning);
        reducedMotion.addEventListener('change', updateRunning);

        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                onBattery = !battery.charging;
                battery.addEventListener('chargingchange', () => { onBattery = !battery.charging; });
            }).catch(() => {});
        }

        return {
            stop() {
                stopped = true;
                updateRunning();
                resizeObserver.disconnect();
                intersectionObserver.disconnect();
                document.removeEventListener('visibilitychange', updateRunning);
                reducedMotion.removeEventListener('change', updateRunning);
            }
        };
    }

    window.SpaceAnimation = { start };

    function autoStart() {
        const canvas = document.getElementById('space-canvas');
        if (canvas) start(canvas);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoStart);
    else autoStart();
})();
