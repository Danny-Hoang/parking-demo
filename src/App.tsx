import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import styled from 'styled-components';
import { motion } from 'framer-motion';

type Point = [p1: number, p2: number];


function App() {

	const [state, setState] = useState({ color: 'green ' })

	const points: Point[] = [[100, 190], [410, 190],[410, 300],[1060, 300]]

	const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const target = e.currentTarget;
		const { clientX, clientY } = e

		console.log({ clientX, clientY })

	}

	const generatePaths = (points: Point[]) => {
		let begin = true
		let action = 'M'
		let path = '';
		for(let i = 0; i < points.length - 1; i++) {
			let current = points[i]
			let next = points[i+1]
			const deltaX = next[0] - current[0];
			const deltaY = next[1] - current[1];
			path = `${path} ${action} ${deltaX} ${deltaY}`

			action = 'l';
		}
	}

	const transition = { duration: 2, ease: "easeInOut" };
	return (
		<Container className="App"
			onClick={handleClick}
		>


			<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000">
				<motion.path
					d="M 100 190 l 310 0  l 0 110 l 650 0"
					fill="transparent"
					strokeWidth="5"
					stroke="royalblue"
					strokeLinecap="round"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={transition}
				/>
			</svg>
			<img

				src='/images/1F.png'
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
	img {
		position: fixed;
		top: 0;
		left: 0;
	}

	position: relative;
	svg {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
	}
`
