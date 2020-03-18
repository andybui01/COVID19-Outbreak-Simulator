function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ball settings
const BALL_RADIUS = 5;
const BALL_COLORS = ['orange', 'pink'];

// Canvas settings
const canvasWidth = 900;
const canvasHeight = 500;

const BALL_COUNT = 200;
const speed = 10;

// Initialise Canvas
const state = {canvas: d3.select('svg#canvasSimulation')};
state.canvas.attr('width', canvasWidth).attr('height', canvasHeight);

// Ball initial positions
const balls = [];
const directions = [-1,1];

for (var i = 0; i < BALL_COUNT; i++) {
    var direction = directions[Math.floor(Math.random() * directions.length)];

    var init_v = speed; // Hypotenuse speed
    var init_vx = Math.floor((Math.random() * speed) + 1)*direction;

    direction = directions[Math.floor(Math.random() * directions.length)];

    var init_vy = Math.sqrt(init_v**2 - init_vx**2)*direction;


    balls[i] = {x:getRandomInt(0,canvasWidth), y:getRandomInt(0,canvasHeight), future: {vx: init_vx/10, vy: init_vy/10}};
}


// Setup force system
state.forceSim = d3.forceSimulation()
    .alphaDecay(0)
    .velocityDecay(0)
    .on('tick', () => { tick(state); }); // Every 'tick' of the simulation,
    // call tick to advance one step...

// Set to 'bounce' type of collision
state.forceSim.force('collision', d3.forceBounce().elasticity(1));

// Set collision radius
state.forceSim.force('collision').radius(n => n.r || BALL_RADIUS);

// Make ball bounce off walls.
state.forceSim.force('walls', walls);


// Walls
function walls() {
    var ball;
    for (var i = 0; i < balls.length; i++) {
        ball = balls[i]
        
        if (ball.x - BALL_RADIUS < 0) {
            ball.x = BALL_RADIUS;
            ball.vx = -ball.vx;
        }
        if (ball.y - BALL_RADIUS < 0) {
            ball.y = BALL_RADIUS;
            ball.vy = -ball.vy;
        }
        if (ball.x + BALL_RADIUS > canvasWidth) {
            ball.x = canvasWidth - BALL_RADIUS;
            ball.vx = -ball.vx;
        }
        if (ball.y + BALL_RADIUS > canvasHeight) {
            ball.y = canvasHeight - BALL_RADIUS;
            ball.vy = -ball.vy;
        }
    }
}




// Initial render
render();

// function onControlChange(val, mode, prop) {
// 	const module = state
// 	d3.select(module.canvas.node().parentNode).select('.val').text(val);
// 	module.forceSim.force('collision')[prop](val);
// 	kickStart();
// }

function tick(state) {
    let ball = state.canvas.selectAll('circle.ball').data(state.forceSim.nodes());

	ball.exit().remove();

	ball.merge(
		ball.enter().append('circle')
			.classed('ball', true)
			.attr('fill', (d,idx) => BALL_COLORS[idx%BALL_COLORS.length])
	)
		.attr('r', d => d.r || BALL_RADIUS)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y);
}

function render() {
	const numExamples = 7,
		h = [ 0.25, 0.5, 0.75].map(r => canvasWidth * r),
		v = d3.range(numExamples).map(n => canvasHeight * (n+0.5)/numExamples);

	// Clear all trails
	d3.selectAll('.trails').selectAll('*').remove();

    const sim = state.forceSim;

    // Initial state
    sim.nodes(balls);

    setTimeout(() => {
        // Apply future
        balls.filter(ball => ball.future).forEach(ball => {
            Object.keys(ball.future).forEach(attr => { ball[attr] = ball.future[attr]});
        });
    }, 800);

}