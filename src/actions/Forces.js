export default (nodes, callback, settings) => {

    const walls = (node)=> {
        if (node.x - settings.radius < 0) {
            return {
                ...node,
                x:settings.radius,
                vx:-node.vx
            }
        }
        if (node.y - settings.radius < 0) {
            return {
                ...node,
                y: settings.radius,
                vy: -node.vy
            }
        }
        if (node.x + settings.radius > settings.w) {
            return {
                ...node,
                    x: settings.w - settings.radius,
                    vx: -node.vx
            }
        }
        if (node.y + settings.radius > settings.h) {
            return {
                ...node,
                    y: settings.h - settings.radius,
                    vy: -node.vy
            }
        }
        return node
    };
    const computedNodes = nodes.map(walls);
    nodes != computedNodes ? callback((prevState)=>({
        ...prevState,
        nodes: computedNodes
    })) : undefined;
}