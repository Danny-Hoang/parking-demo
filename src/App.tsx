import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { endPoint, findShortestPath, IPoint, obstaclesB4, path, startPoint } from './findPath';

type Point = [p1: number, p2: number];


function App() {

	const [state, setState] = useState({ color: 'green ' })

	const points: Point[] = [[100, 190], [410, 190], [410, 300], [1060, 300]]

	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const { clientX, clientY } = e
		console.log({ clientX, clientY })

	}

	const generatePaths = (points: Point[]) => {
		let action = 'M'
		let path = '';
		for (let i = 0; i < points.length - 1; i++) {
			let current = points[i]
			let next = points[i + 1]
			const deltaX = next[0] - current[0];
			const deltaY = next[1] - current[1];
			path = `${path} ${action}${!i ? ` ${points[i][0]} ${points[i][1]} l` : ''} ${deltaX} ${deltaY}`
			action = 'l';
		}

		return path;
	}

	const shortestPath: IPoint[] = findShortestPath(startPoint, endPoint, path, obstaclesB4)
	const pointsList = generatePaths(shortestPath)
	const start = shortestPath[0]
	const end = shortestPath[shortestPath.length - 1]

	const transition = { duration: 2, ease: "easeInOut" };
	return (
		<Container className="App"
			onClick={handleClick}
		>


			<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000">
				<motion.path
					d={pointsList}
					fill="transparent"
					strokeWidth="8"
					stroke="red"
					strokeLinecap="round"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={transition}
				/>
			</svg>
			<Map

				src='/images/B4F.png'
			/>

			<CurrentLoc
				x={start[0]}
				y={start[1]}
				src='/images/current.png'
			/>
			<Destination
				x={end[0]}
				y={end[1]}
				src='/images/pincar.png'
			/>
			{/* <Stage width={window.innerWidth} height={window.innerHeight}>
				<Layer>
					<Text text="Try click on rect" />
					<Rect
						x={20}
						y={20}
						width={50}
						height={50}
						fill={state.color}
						shadowBlur={5}
						onClick={handleClick}
					/>
				</Layer>
			</Stage> */}
		</Container>
	);
}

export default App;


const Container = styled.div`
	transform: translateX(00px) translateY(200px) scale(0.7) perspective(4000px) rotateX(64deg);
	position: relative;
	svg {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
	}
`

const CurrentLoc = styled.img<{ x: number, y: number }>`
	width: 60px;
	position: absolute;
	z-index: 100;
	top: 0;
    left: 0;
	transform: ${props => `translate(${props.x - 50}px, ${props.y - 60}px)`} ;
`
const Destination = styled.img<{ x: number, y: number }>`
	width: 60px;
	position: absolute;
	z-index: 100;
	top: 0;
    left: 0;
	transform: ${props => `translate(${props.x - 50}px, ${props.y - 60}px)`};
`



const Map = styled.img`
	position: absolute;
		top: 0;
		left: 0;
`
