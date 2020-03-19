function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function closest_nodee(nodes, source, radius) {
    var n = nodes.length,
        dx,
        dy,
        d2,
        node,
        closest;

    if (radius == null) radius = Infinity;
    else radius *= radius;

    for (var i = 0; i < n; ++i) {

        node = nodes[i];

        if (node == source) continue;

        dx = source.x - node.x;
        dy = source.y - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;

    }
    return closest;
}

// Ball settings
const BALL_RADIUS = 20;

const INFECTED = 'orange';
const RECOVERED = 'pink';
const HEALTHY = 'lightblue';

const BALL_COLORS = [INFECTED, HEALTHY];

// Canvas settings
const canvasWidth = 900;
const canvasHeight = 500;

const BALL_COUNT = 10;
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

// Make ball bounce off walls
state.forceSim.force('walls', walls);

// Make balls change colour when infected
state.forceSim.force('infect', infect);


// Walls - change directions after making contact with wall
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

// Infect - change colour after zombie ball infects healthy ball
function infect() {
    var ball,
        source;
    const nodes = state.forceSim.nodes();

    for (var i = 0; i < nodes.length; i++) {
        ball = nodes[i];

        source = document.getElementById("ball"+i.toString());
        try {
            if (source.style.fill != INFECTED) {
                continue;
            }
            else {
                var closest_node = closest_nodee(nodes, ball, 2*BALL_RADIUS+1);
                if (closest_node != undefined) {
                    var idx = closest_node.index;
                    var status = d3.select("circle#ball"+idx.toString()).style("fill");
                    if (status != RECOVERED) d3.select("circle#ball"+idx.toString()).style("fill", INFECTED);
                }
            }
        } catch (TypeError) {}
        

        
        

        
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
			.style('fill', function(d,idx) {
                if (idx == 0) {
                    return INFECTED;
                } else {
                    return HEALTHY;
                }
            })
	)
		.attr('r', d => d.r || BALL_RADIUS)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y)
        .attr('id', (d, idx) => "ball"+idx.toString());
}

function render() {
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