// Standalone Space Animation - No dependencies required
// This animation will work independently without needing any other files

document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const canvas = document.getElementById('space-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Star properties
    const stars = [];
    const numStars = 200;
    const shootingStars = [];
    
    // Create nebula layers
    const nebulae = [];
    const numNebulae = 5;
    
    // Add meteors
    const meteors = [];
    
    // Set canvas size to full window
    function resizeCanvas() {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Only regenerate if canvas actually changed size (not initial load)
        if (oldWidth !== 0 && oldHeight !== 0) {
            generateNebulae();
            generateStars();
        }
    }
    
    // Call resize on load and when window is resized
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Generate stars with colored stars
    function generateStars() {
        stars.length = 0;
        // Color options for stars
        const starColors = [
            'rgba(255, 255, 255, 1)', // White
            'rgba(173, 216, 230, 1)', // Light blue
            'rgba(255, 244, 229, 1)', // Cream
            'rgba(255, 210, 161, 1)', // Light orange
            'rgba(224, 122, 95, 0.8)', // Reddish
            'rgba(129, 236, 236, 0.8)' // Cyan
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
            ['rgba(63, 81, 181, 0.07)', 'rgba(63, 81, 181, 0.03)'],  // Blue
            ['rgba(156, 39, 176, 0.07)', 'rgba(156, 39, 176, 0.03)'], // Purple
            ['rgba(233, 30, 99, 0.07)', 'rgba(233, 30, 99, 0.03)'],   // Pink
            ['rgba(76, 175, 80, 0.06)', 'rgba(76, 175, 80, 0.02)'],   // Green
            ['rgba(255, 152, 0, 0.06)', 'rgba(255, 152, 0, 0.02)']    // Orange
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
    
    // Random chance to create a meteor
    function maybeCreateMeteor() {
        if (Math.random() < 0.005) {
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
    
    // Random chance to create a shooting star
    function maybeCreateShootingStar() {
        if (Math.random() < 0.01) {
            createShootingStar();
        }
    }
    
    // Update and draw stars
    function drawStars() {
        stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const twinkleOpacity = (Math.sin(star.twinklePhase) + 1) / 2 * 0.5 + 0.5;
            
            let radius = star.radius;
            if (star.pulsate) {
                radius += Math.sin(performance.now() * star.pulsateSpeed) * 0.5;
            }
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
            
            const color = star.color.replace('1)', `${star.opacity * twinkleOpacity})`);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }
    
    // Draw nebulae
    function drawNebulae() {
        nebulae.forEach(nebula => {
            nebula.phase += 0.005;
            const offsetX = Math.sin(nebula.phase) * 20;
            const offsetY = Math.cos(nebula.phase) * 20;
            
            const gradient = ctx.createRadialGradient(
                nebula.x + offsetX, nebula.y + offsetY, 0,
                nebula.x + offsetX, nebula.y + offsetY, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, nebula.outerColor);
            
            ctx.beginPath();
            ctx.arc(nebula.x + offsetX, nebula.y + offsetY, nebula.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
    }
    
    // Update and draw meteors
    function updateMeteors() {
        for (let i = meteors.length - 1; i >= 0; i--) {
            const meteor = meteors[i];
            
            meteor.x += Math.cos(meteor.angle) * meteor.speed;
            meteor.y += Math.sin(meteor.angle) * meteor.speed;
            
            if (Math.random() < 0.3) {
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
                particle.opacity -= 0.02;
                particle.size *= 0.97;
                
                if (particle.opacity <= 0 || particle.size <= 0.5) {
                    meteor.particles.splice(j, 1);
                } else {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.opacity})`;
                    ctx.fill();
                }
            }
            
            const gradient = ctx.createLinearGradient(
                meteor.x, meteor.y,
                meteor.x - Math.cos(meteor.angle) * meteor.length,
                meteor.y - Math.sin(meteor.angle) * meteor.length
            );
            gradient.addColorStop(0, `hsla(${meteor.hue}, 100%, 70%, 1)`);
            gradient.addColorStop(0.3, `hsla(${meteor.hue + 20}, 100%, 50%, 0.6)`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.beginPath();
            ctx.moveTo(meteor.x, meteor.y);
            ctx.lineTo(
                meteor.x - Math.cos(meteor.angle) * meteor.length,
                meteor.y - Math.sin(meteor.angle) * meteor.length
            );
            ctx.lineWidth = meteor.width;
            ctx.strokeStyle = gradient;
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
            
            ctx.beginPath();
            
            const trailLength = star.length * (1 - Math.min(progress * 2, 1));
            const trailX = star.currentX - (dx / totalDist) * trailLength;
            const trailY = star.currentY - (dy / totalDist) * trailLength;
            
            const gradient = ctx.createLinearGradient(
                trailX, trailY, star.currentX, star.currentY
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradient.addColorStop(1, star.color.replace('1)', `${star.alpha})`));
            
            ctx.moveTo(trailX, trailY);
            ctx.lineTo(star.currentX, star.currentY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(star.currentX, star.currentY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = star.color.replace('1)', `${star.alpha})`);
            ctx.fill();
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, 'rgba(10, 10, 30, 1)');
        bgGradient.addColorStop(1, 'rgba(5, 5, 20, 1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawNebulae();
        drawStars();
        updateMeteors();
        updateShootingStars();
        
        maybeCreateShootingStar();
        maybeCreateMeteor();
        
        requestAnimationFrame(animate);
    }
    
    // Initialize
    generateNebulae();
    generateStars();
    animate();
    
    console.log('Space Animation initialized successfully!');
});
