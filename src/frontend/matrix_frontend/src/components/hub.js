import React, { useState, useEffect, createContext, useContext } from "react";


import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlus, HiChevronDoubleRight, HiChevronDoubleLeft } from "react-icons/hi";

import Grid from "./grid.js";
import ControlPanel from "./controlPanel.js";

import { setIndex, fetchMatrix } from '../util/backend_api_functions.js';

import matrixData from "../util/matrixData.js";

const TopicContext = createContext();

const Hub = () => {
	const [matrix, setMatrix] = useState(matrixData);
	const [gridIndex, setGridIndex] = useState(0);
	const [frameIndex, setFrameIndex] = useState(0);
	const [secondaryColor, setSecondaryColor] = useState([255, 0, 0]); // red
	const [nextButtonState, setNextButtonState] = useState(true);
	const [showDeleteOptions, setShowDeleteOptions] = useState(false);
	const [grid, setGrid] = useState(matrix[0].frames[0]);
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	
	useEffect(() => {
        fetchMatrix(setMatrix, setIsDataLoaded);
    }, []);

	const saveCurrentFrameToMatrix = () => {
		setMatrix(prevMatrix => {
			const updatedMatrix = [...prevMatrix];
			const currentGrid = [...grid.map(row => [...row])]; // Deep copy of grid
			updatedMatrix[gridIndex].frames[frameIndex] = currentGrid;
			return updatedMatrix;
		});
	};

	const loadPrevGrid = () => {		
		setFrameIndex(0); // Reset frame index when changing grids
        if (gridIndex === 0) {        
            setIndex(0);
            setGridIndex(0);
        }		
        else if (gridIndex >= 0) {
			const new_index = gridIndex - 1;
			setGridIndex(new_index);
            
            console.log("gridIndex", gridIndex, "matrix.length", matrix.length);
            setIndex(new_index);          
		}

        if (!nextButtonState) {
			setNextButtonState(true);
		}
	};

	const loadPrevFrame = () => {
		if (frameIndex > 0) {
			saveCurrentFrameToMatrix(); // Save current frame before switching
			const newIndex = frameIndex - 1;
			setFrameIndex(newIndex);
			setGrid(matrix[gridIndex].frames[newIndex]);
		}
	};

	const loadNextGrid = () => {
		console.log("gridIndex", gridIndex, "matrix.length", matrix.length - 1);
		setFrameIndex(0); // Reset frame index when changing grids
		if (gridIndex < matrix.length - 2) {
			const new_index = gridIndex + 1;
			setGridIndex(new_index);
            setIndex(new_index);
		} else if (gridIndex === matrix.length - 2) {
			const new_index = gridIndex + 1;
			setGridIndex(new_index);
			setNextButtonState(false);
            setIndex(new_index);			
			console.log("Next button state set to false");
		} else if (gridIndex === matrix.length - 1){
			// Create a new grid entry at the next index
			setMatrix((prevMatrix) => {
				const newMatrix = [...prevMatrix];

				// Safely create a new matrix entry if it doesn't exist yet
				if (!newMatrix[gridIndex + 1]) {
					newMatrix[gridIndex + 1] = {
						name: "newTile", // Default values for the new grid
						width: 16,
						height: 16,
						frame_delay_ms: 0,
						type: "static",
						frames: [
							Array(16)
								.fill(null)
								.map(() => Array(16).fill([0, 0, 0])),
						],
					};
				}

				// Return the new matrix state
				return newMatrix;
			});
			// Update the grid index after the matrix has been updated
			setGridIndex(gridIndex + 1);
		}
	};

	const loadNextFrame = () => {
		const totalFrames = matrix[gridIndex].frames.length;
		if (frameIndex < totalFrames - 1) {
			saveCurrentFrameToMatrix(); // Save current frame before switching
			const newIndex = frameIndex + 1;
			setFrameIndex(newIndex);
			setGrid(matrix[gridIndex].frames[newIndex]);
		} else {
			// Add a new empty frame and switch to it
			const newFrame = Array(matrix[gridIndex].height)
				.fill(null)
				.map(() => Array(matrix[gridIndex].width).fill([0, 0, 0]));
	
			const updatedMatrix = [...matrix];
			updatedMatrix[gridIndex].frames.push(newFrame);
			setMatrix(updatedMatrix);
	
			setFrameIndex(frameIndex + 1);
			setGrid(newFrame);
		}
	};

	const sharedStates = {
		matrix,
		setMatrix,
		gridIndex,
		setGridIndex,
		frameIndex,
		setFrameIndex,
		secondaryColor,
		setSecondaryColor,
		nextButtonState,
		setNextButtonState,
		showDeleteOptions,
		setShowDeleteOptions,
		grid,
		setGrid
	}

	return (
		<TopicContext.Provider value={sharedStates}>
		<div className="d-flex justify-content-center align-items-center mt-0">
			
			<HiOutlineChevronLeft onClick={loadPrevGrid} size={70} />
			{matrix[gridIndex].type === "animation" && (				
				<HiChevronDoubleLeft onClick={loadPrevFrame} size={70} />
			)}
			
			{isDataLoaded === true &&(
			<div style={{ width: "792px" }}>
			
				<ControlPanel/>
				<Grid/>
			
			</div>
			)}
			
			{matrix[gridIndex].type === "animation" && (
				<HiChevronDoubleRight onClick={loadNextFrame} size={70} />
			)}
			{nextButtonState === false ? (
				<HiOutlinePlus onClick={loadNextGrid} size={70} />
			) : (
				<HiOutlineChevronRight onClick={loadNextGrid} size={70} />
			)}
			
			
		</div>
		</TopicContext.Provider>
	);
};

export default Hub;

export function useTopicContext() {
	return useContext(TopicContext);
}