// Optimized Standalone Space Animation with Battery Saving Features

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d', { 
        alpha: false,  // Optimization: No transparency needed
        desynchronized: true  // Better performance
    });
    
    // Performance settings
    const performanceMode = {
        highPerformance: true,  // Set to false for battery saving
        targetFPS: 60,
        batteryFPS: 30,  // Lower FPS when on battery
        reducedMotion: false
    };
    
    // Detect battery status
    let onBattery = false;
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            onBattery = !battery.charging;
            battery.addEventListener('chargingchange', () => {
                onBattery = !battery.charging;
                console.log(`Battery mode: ${onBattery ? 'On Battery' : 'Plugged In'}`);
            });
        });
    }
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    performanceMode.reducedMotion = prefersReducedMotion.matches;
    
    // Star properties
    const stars = [];
    const numStars = 200;
    const shootingStars = [];
    
    // Create nebula layers
    const nebulae = [];
    const numNebulae = 5;
    
    // Add meteors
    const meteors = [];
    
    // Performance tracking
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    
    // Visibility API for pausing when tab is hidden
    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible) {
            lastFrameTime = performance.now();
            animate();
        }
    });
    
    // Set canvas size to full window
    function resizeCanvas() {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Only regenerate if canvas actually changed size
        if (oldWidth !== 0 && oldHeight !== 0) {
            generateNebulae();
            generateStars();
        }
    }
    
    resizeCanvas();
    
    // Debounce resize for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 150);
    });
    
    // Generate stars with colored stars
    function generateStars() {
        stars.length = 0;
        const starColors = [
            'rgba(255, 255, 255, 1)',
            'rgba(173, 216, 230, 1)',
            'rgba(255, 244, 229, 1)',
            'rgba(255, 210, 161, 1)',
            'rgba(224, 122, 95, 0.8)',
            'rgba(129, 236, 236, 0.8)'
        ];
        
        for (let i = 0; i < numStars; i++) {
            const colorIndex = Math.random() > 0.7 ? Math.floor(Math.random() * starColors.length) : 0;
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                color: starColors[colorIndex],
                pulsate: Math.random() > 0.9,
                pulsateSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    // Generate nebulae with vibrant colors
    function generateNebulae() {
        nebulae.length = 0;
        const colors = [
            ['rgba(63, 81, 181, 0.07)', 'rgba(63, 81, 181, 0.03)'],
            ['rgba(156, 39, 176, 0.07)', 'rgba(156, 39, 176, 0.03)'],
            ['rgba(233, 30, 99, 0.07)', 'rgba(233, 30, 99, 0.03)'],
            ['rgba(76, 175, 80, 0.06)', 'rgba(76, 175, 80, 0.02)'],
            ['rgba(255, 152, 0, 0.06)', 'rgba(255, 152, 0, 0.02)']
        ];
        
        for (let i = 0; i < numNebulae; i++) {
            const colorIndex = Math.floor(Math.random() * colors.length);
            nebulae.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * canvas.width * 0.7 + canvas.width * 0.3,
                color: colors[colorIndex][0],
                outerColor: colors[colorIndex][1],
                speed: (Math.random() - 0.5) * 0.2,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // Create a meteor
    function createMeteor() {
        const startX = Math.random() * canvas.width;
        const startY = -50;
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        const speed = 4 + Math.random() * 7;
        const length = 80 + Math.random() * 120;
        const hue = Math.floor(Math.random() * 60);
        
        meteors.push({
            x: startX,
            y: startY,
            angle,
            speed,
            length,
            hue,
            particles: [],
            active: true,
            width: 3 + Math.random() * 2
        });
    }
    
    // Random chance to create a meteor (reduced frequency on battery)
    function maybeCreateMeteor() {
        const chance = onBattery ? 0.002 : 0.005;
        if (Math.random() < chance) {
            createMeteor();
        }
    }
    
    // Create a shooting star
    function createShootingStar() {
        const angle = Math.random() * Math.PI * 2;
        const length = 100 + Math.random() * 100;
        const speed = 3 + Math.random() * 5;
        
        const startX = canvas.width / 2 + Math.cos(angle) * (canvas.width + 100);
        const startY = canvas.height / 2 + Math.sin(angle) * (canvas.height + 100);
        
        const distanceFromCenter = Math.random() * (canvas.width / 3) + (canvas.width / 6);
        const endX = canvas.width / 2 + Math.cos(angle + Math.PI) * distanceFromCenter;
        const endY = canvas.height / 2 + Math.sin(angle + Math.PI) * distanceFromCenter;
        
        const hue = Math.floor(Math.random() * 360);
        const color = `hsl(${hue}, 80%, 80%)`;
        
        shootingStars.push({
            startX, startY, endX, endY,
            currentX: startX,
            currentY: startY,
            length,
            speed,
            angle,
            alpha: 0,
            color,
            active: true
        });
    }
    
    // Random chance to create a shooting star (reduced frequency on battery)
    function maybeCreateShootingStar() {
        const chance = onBattery ? 0.005 : 0.01;
        if (Math.random() < chance) {
            createShootingStar();
        }
    }
    
    // Update and draw stars (optimized)
    function drawStars() {
        ctx.fillStyle = 'white'; // Batch drawing where possible
        
        stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const twinkleOpacity = (Math.sin(star.twinklePhase) + 1) / 2 * 0.5 + 0.5;
            
            let radius = star.radius;
            if (star.pulsate && !onBattery) {  // Skip pulsation on battery
                radius += Math.sin(performance.now() * star.pulsateSpeed) * 0.5;
            }
            
            ctx.globalAlpha = star.opacity * twinkleOpacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
            
            if (star.color !== 'rgba(255, 255, 255, 1)') {
                ctx.fillStyle = star.color;
            }
            ctx.fill();
        });
        
        ctx.globalAlpha = 1.0;
    }
    
    // Draw nebulae (simplified on battery)
    function drawNebulae() {
        nebulae.forEach(nebula => {
            nebula.phase += 0.005;
            const offsetX = onBattery ? 0 : Math.sin(nebula.phase) * 20;
            const offsetY = onBattery ? 0 : Math.cos(nebula.phase) * 20;
            
            const gradient = ctx.createRadialGradient(
                nebula.x + offsetX, nebula.y + offsetY, 0,
                nebula.x + offsetX, nebula.y + offsetY, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, nebula.outerColor);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(nebula.x + offsetX, nebula.y + offsetY, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Update and draw meteors (limited particles on battery)
    function updateMeteors() {
        const maxParticles = onBattery ? 10 : 30;
        
        for (let i = meteors.length - 1; i >= 0; i--) {
            const meteor = meteors[i];
            
            meteor.x += Math.cos(meteor.angle) * meteor.speed;
            meteor.y += Math.sin(meteor.angle) * meteor.speed;
            
            // Reduce particle generation on battery
            if (meteor.particles.length < maxParticles && Math.random() < (onBattery ? 0.15 : 0.3)) {
                meteor.particles.push({
                    x: meteor.x - Math.cos(meteor.angle) * (Math.random() * 5),
                    y: meteor.y - Math.sin(meteor.angle) * (Math.random() * 5),
                    size: 1 + Math.random() * 2,
                    opacity: 1,
                    hue: meteor.hue + Math.floor(Math.random() * 20)
                });
            }
            
            // Draw particles
            for (let j = meteor.particles.length - 1; j >= 0; j--) {
                const particle = meteor.particles[j];
                particle.opacity -= 0.02;
                particle.size *= 0.97;
                
                if (particle.opacity <= 0 || particle.size <= 0.5) {
                    meteor.particles.splice(j, 1);
                } else {
                    ctx.globalAlpha = particle.opacity;
                    ctx.fillStyle = `hsl(${particle.hue}, 100%, 50%)`;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            ctx.globalAlpha = 1.0;
            
            // Draw meteor trail
            const gradient = ctx.createLinearGradient(
                meteor.x, meteor.y,
                meteor.x - Math.cos(meteor.angle) * meteor.length,
                meteor.y - Math.sin(meteor.angle) * meteor.length
            );
            gradient.addColorStop(0, `hsl(${meteor.hue}, 100%, 70%)`);
            gradient.addColorStop(0.3, `hsla(${meteor.hue + 20}, 100%, 50%, 0.6)`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = meteor.width;
            ctx.beginPath();
            ctx.moveTo(meteor.x, meteor.y);
            ctx.lineTo(
                meteor.x - Math.cos(meteor.angle) * meteor.length,
                meteor.y - Math.sin(meteor.angle) * meteor.length
            );
            ctx.stroke();
            
            if (meteor.y > canvas.height + 100 || meteor.x < -100 || meteor.x > canvas.width + 100) {
                meteors.splice(i, 1);
            }
        }
    }
    
    // Update and draw shooting stars
    function updateShootingStars() {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];
            
            const totalDist = Math.sqrt(
                Math.pow(star.endX - star.startX, 2) + 
                Math.pow(star.endY - star.startY, 2)
            );
            
            const dx = star.endX - star.startX;
            const dy = star.endY - star.startY;
            star.currentX += (dx / totalDist) * star.speed;
            star.currentY += (dy / totalDist) * star.speed;
            
            const currentDist = Math.sqrt(
                Math.pow(star.currentX - star.startX, 2) + 
                Math.pow(star.currentY - star.startY, 2)
            );
            
            const progress = currentDist / totalDist;
            if (progress < 0.2) {
                star.alpha = progress * 5;
            } else if (progress > 0.8) {
                star.alpha = (1 - progress) * 5;
            } else {
                star.alpha = 1;
            }
            
            if (progress >= 1) {
                shootingStars.splice(i, 1);
                continue;
            }
            
            const trailLength = star.length * (1 - Math.min(progress * 2, 1));
            const trailX = star.currentX - (dx / totalDist) * trailLength;
            const trailY = star.currentY - (dy / totalDist) * trailLength;
            
            const gradient = ctx.createLinearGradient(
                trailX, trailY, star.currentX, star.currentY
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(1, star.color.replace('hsl', 'hsla').replace(')', `, ${star.alpha})`));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(trailX, trailY);
            ctx.lineTo(star.currentX, star.currentY);
            ctx.stroke();
            
            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.currentX, star.currentY, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }
    
    // FPS limiter for battery saving
    let lastRenderTime = 0;
    function shouldRender(timestamp) {
        const targetFPS = onBattery ? performanceMode.batteryFPS : performanceMode.targetFPS;
        const minInterval = 1000 / targetFPS;
        
        if (timestamp - lastRenderTime < minInterval) {
            return false;
        }
        
        lastRenderTime = timestamp;
        return true;
    }
    
    // Animation loop with FPS throttling
    function animate(timestamp = performance.now()) {
        // Stop animation when tab is hidden
        if (!isVisible) return;
        
        // FPS limiting for battery saving
        if (!shouldRender(timestamp)) {
            requestAnimationFrame(animate);
            return;
        }
        
        // Calculate FPS
        frameCount++;
        if (frameCount % 60 === 0) {
            const currentTime = performance.now();
            fps = Math.round(1000 / (currentTime - lastFrameTime));
            lastFrameTime = currentTime;
        }
        
        // Clear and draw background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, 'rgba(10, 10, 30, 1)');
        bgGradient.addColorStop(1, 'rgba(5, 5, 20, 1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw all elements
        drawNebulae();
        drawStars();
        
        if (!performanceMode.reducedMotion) {
            updateMeteors();
            updateShootingStars();
            
            maybeCreateShootingStar();
            maybeCreateMeteor();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Initialize
    generateNebulae();
    generateStars();
    animate();
    
    console.log('Optimized Space Animation initialized!');
    console.log(`Battery mode: ${onBattery ? 'Enabled' : 'Disabled'}`);
    console.log(`Reduced motion: ${performanceMode.reducedMotion ? 'Enabled' : 'Disabled'}`);
});