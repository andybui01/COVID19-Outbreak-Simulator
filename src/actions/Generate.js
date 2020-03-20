export default ({isolation=0, population=8, dimensions, speed=2}) => {
    // atHome constant is used to make a certain amount of balls stay at home
    const atHome = (isolation != 0) ? (isolation * population * 0.1): 1;

    return Array.from({length: population}, (index)=>{
        let direction = Math.random() < 0.5 ? -1 : 1;
        const vx = (Math.floor((Math.random() * speed) + 1)*direction)/10;
        direction = Math.random() < 0.5 ? -1 : 1;
        const vy = (Math.sqrt(speed**2 - vx**2)*direction)/10
        return ({
            infected: index == 0,
            recovered: false,
            x: Math.floor(Math.random() * (dimensions.w - 0 + 1)) + 0,
            y: Math.floor(Math.random() * (dimensions.h - 0 + 1)) + 0,
            vx,
            vy
        })
    });
    // for (var i = 0; i < BALL_COUNT; i++) {
    //     var direction = directions[Math.floor(Math.random() * directions.length)];

    //     var init_vx, init_vy;

    //     // If ball is allowed to roam, generate its velocity
    //     if (i % atHome == 0) {
    //         var init_v = SPEED; // Hypotenuse SPEED

    //         init_vx = Math.floor((Math.random() * SPEED) + 1)*direction;

    //         direction = directions[Math.floor(Math.random() * directions.length)];

    //         init_vy = Math.sqrt(init_v**2 - init_vx**2)*direction;
    //     } else {
    //         init_vy = init_vx = 0; // If ball stays at home then velocity is 0
    //     }

    //     balls[i] = {
    //         x:getRandomInt(0,CANVAS_WIDTH),
    //         y:getRandomInt(0,CANVAS_HEIGHT),
    //         future: {vx: init_vx/10, vy: init_vy/10}, // Use future so that when we generate
    //         // nodes, vx and vy will be the speed & direction the ball travels in.

    //         // Set all balls to be healthy at first
    //         infected: false,
    //         recovered: false,
    //         tick_infected: null // tick_infected stores the tick when balls[i] got infected
    //     }
    // }

    // // Set first ball to be infected
    // balls[0].infected = true;
    // balls[0].tick_infected = 0;
}