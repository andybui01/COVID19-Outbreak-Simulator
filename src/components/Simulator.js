import Stats from "./Stats"
import { useEffect, useState, useRef } from "preact/hooks"
import Generate from '../actions/Generate'
import { select, forceSimulation } from 'd3'
import Forces from "../actions/Forces"

export default () => {
    const [state, setState] = useState({
        time: 1,
        nodes: Generate({dimensions:{
            population:2,
            w: 900,
            h: 500,
            speed: 5
        }})
    });

    const svgRef = useRef();

    useEffect(()=>{
        // const interval = setInterval(()=> {
        //     setState(prevState => ({
        //         ...prevState, 
        //         time: prevState.time + 1
        //     }))
        // },10000/3);
        // return () => {
        //     clearInterval(interval)
        // }
        const svg = select(svgRef.current)

        let nodes = state.nodes;

        const simulation = forceSimulation(state.nodes)
        .alphaDecay(0)
        .velocityDecay(0)
        .on('tick', ()=>{
            svg
                .selectAll(".node")
                .exit()
                .remove();
            svg
                .selectAll(".node")
                .data(nodes)
                .join("circle")
                .attr("class", "node")
                .attr("r", 4)
                .attr("cx", node => node.x)
                .attr("cy", node => node.y);
        })

        simulation.force('iterate', Forces(nodes, setState, {radius: 5, h: 500, w: 900}))

    },[state.nodes])
    return (
        <>
            <Stats 
                healthy={60}
                infected={70}
                recovered={0}
                time={state.time}
            />
            <svg height={500} width={900} ref={svgRef} />
        </>
    )
}