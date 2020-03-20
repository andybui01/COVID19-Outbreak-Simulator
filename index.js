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

function plusInfect() {
    HEALTHY_COUNT--;
    INFECTED_COUNT++;
}

function plusRecover() {
    INFECTED_COUNT--;
    RECOVERED_COUNT++;
}

function plusTime() {
    data[time] = {
        time: time,
        recovered: RECOVERED_COUNT,
        infected: INFECTED_COUNT,
        healthy: HEALTHY_COUNT
        
    }
    time++;
    // Refresh graph
    d3.select("div#reload").select("div#chart").remove();
    d3.select("div#reload").append("div").attr("id", "chart");

    draw();
}

// Ball settings
const BALL_RADIUS = 5;

const HEALTHY = 'lightblue';
const INFECTED = 'orange';
const RECOVERED = 'pink';

const BALL_COLORS = [RECOVERED, HEALTHY, INFECTED];

var isolation = 0;

// Canvas settings
const canvasWidth = 900;
const canvasHeight = 500;

const BALL_COUNT = 200;
const speed = 10;

// Initialise Canvas
const state = {canvas: d3.select('svg#canvasSimulation')};
state.canvas.attr('width', canvasWidth).attr('height', canvasHeight);


var data;

// Counting ticks and time
var tick_count, time;

// Initialise status counts
var HEALTHY_COUNT, INFECTED_COUNT, RECOVERED_COUNT;

// Ball initial positions
var balls = [], directions;

function start() {

    // state.canvas.selectAll('circle.ball').data(state.forceSim.nodes()).exit().remove();
    
    directions = [-1,1];

    // Counting ticks and time
    tick_count = 0;
    time = 0;

    // Initialise status counts
    HEALTHY_COUNT = BALL_COUNT;
    INFECTED_COUNT = 0;
    RECOVERED_COUNT = 0;

    data = [];

    generateBalls();
    
    plusInfect();
    plusTime();
} start();


function generateBalls() {
    const atHome = (isolation != 0) ? (isolation * BALL_COUNT * 0.1): 1;

    balls = [];
    for (var i = 0; i < BALL_COUNT; i++) {
        var direction = directions[Math.floor(Math.random() * directions.length)];

        var init_vx, init_vy;
        if (i % atHome == 0) {
            var init_v = speed; // Hypotenuse speed

            init_vx = Math.floor((Math.random() * speed) + 1)*direction;

            direction = directions[Math.floor(Math.random() * directions.length)];

            init_vy = Math.sqrt(init_v**2 - init_vx**2)*direction;
        } else {
            init_vy = init_vx = 0;
        }
        
        


        balls[i] = {
            x:getRandomInt(0,canvasWidth),
            y:getRandomInt(0,canvasHeight),
            future: {vx: init_vx/10, vy: init_vy/10},
            infected: false,
            recovered: false,
            tick_infected: null
        }
    }

    // Set first ball to be infected
    balls[0].infected = true;
    balls[0].tick_infected = 0;
}



// Setup force system
state.forceSim = d3.forceSimulation()
    .alphaDecay(0)
    .velocityDecay(0)
    .on('tick', () => { tick(state); }); // Every 'tick' of the simulation,
    // call tick to advance one step...

// Set to 'bounce' type of collision
state.forceSim.force('collision',
    d3.forceBounce().elasticity(1));

// Set collision radius
state.forceSim.force('collision').radius(n => n.r || BALL_RADIUS);

// Make ball bounce off walls
state.forceSim.force('walls', walls);

// Make balls change colour when infected
state.forceSim.force('infect', infect);

// Make balls change colour after recovering
state.forceSim.force('recover', recover);


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
            if (balls[i].infected == false) {
                continue;
            }
            else {
                var closest_node = closest_nodee(nodes, ball, 2*BALL_RADIUS+1);
                if (closest_node != undefined) {
                    var idx = closest_node.index;

                    if (balls[idx].recovered == false && balls[idx].infected == false) {
                        d3.select("circle#ball"+idx.toString()).style("fill", INFECTED);
                        balls[idx].infected = true;
                        balls[idx].tick_infected = tick_count;
                        plusInfect();
                        plusTime();
                    }
                }
            }
        } catch (TypeError) {}    
    }
}

// Recover - change colour after zombie ball becomes human again
function recover() {
    var ball;
    for (var i = 0; i < balls.length; i++) {
        ball = balls[i];
        
        if (ball.infected == false || ball.recovered == true) continue;

        if (tick_count - ball.tick_infected >= 1000) {
            ball.infected = false;
            ball.recovered = true;
            d3.select("circle#ball"+i.toString()).style("fill", RECOVERED);
            plusRecover();
            plusTime();
        }
    }
}

// Initial render
render();

function setIsolation(val) {
    isolation = val;
    start();

    // Recolour the balls
    for (var i = 0; i < BALL_COUNT; i++){
        if (balls[i].infected) {
            d3.select("circle#ball"+i.toString()).style("fill", INFECTED);
        } else {
            d3.select("circle#ball"+i.toString()).style("fill", HEALTHY);
        }
    }
    render();
    
}

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
    
    d3.select("span.healthy-count").text(HEALTHY_COUNT.toString());
    d3.select("span.infected-count").text(INFECTED_COUNT.toString());
    d3.select("span.recovered-count").text(RECOVERED_COUNT.toString());
    d3.select("span.time-count").text(time.toString());

    tick_count++;
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

function draw() {

    // Create SVG and padding for the chart
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("height", 200)
        .attr("width", 400);

    const strokeWidth = 0;
    const margin = { top: 0, bottom: 20, left: 30, right: 20 };
    const chart = svg.append("g").attr("transform", `translate(${margin.left},0)`);

    const width = +svg.attr("width") - margin.left - margin.right - strokeWidth * 2;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const grp = chart
        .append("g")
        .attr("transform", `translate(-${margin.left - strokeWidth},-${margin.top})`);

    // Create stack
    const stack = d3.stack().keys(["recovered", "healthy", "infected"]);
    const stackedValues = stack(data);
    const stackedData = [];
    // Copy the stack offsets back into the data.
    stackedValues.forEach((layer, index) => {
        const currentStack = [];
        layer.forEach((d, i) => {
            currentStack.push({
                values: d,
                time: data[i].time
            });
        });
        stackedData.push(currentStack);
    });

    // Create scales
    const yScale = d3
        .scaleLinear()
        .range([0, height])
        .domain([0, BALL_COUNT]);
    const xScale = d3
        .scaleLinear()
        .range([0, width])
        .domain([0,BALL_COUNT*2]);

    const area = d3
        .area()
        .x(dataPoint => xScale(dataPoint.time))
        .y0(dataPoint => yScale(dataPoint.values[0]))
        .y1(dataPoint => yScale(dataPoint.values[1]));



    // Actual draw area
    
    const series = grp
    .selectAll(".series")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "series");

    series.append("path")
    .attr("transform", `translate(${margin.left},0)`)
    .style("fill", (d, i) => BALL_COLORS[i])
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", strokeWidth)
    .attr("d", d => area(d));

    // Add the X Axis
    chart
        .append("g")
        .attr("transform", `translate(0,${height})`);

    // Add the Y Axis
    chart
        .append("g")
        .attr("transform", `translate(0, 0)`);
    
}