import React, { useState, useEffect } from 'react';

import { useTopicContext } from "./hub";

const INITIAL_COLOR = [0, 0, 0]; // RGB for black

const Grid = () => {
  
  const { matrix, gridIndex, frameIndex, secondaryColor, grid, setGrid } =
		useTopicContext();

  //Array(16).fill(null).map(() => Array(16).fill(INITIAL_COLOR))

  const [mouseDown, setMouseDown] = useState(false);
  

  // Add global listeners to track mouse up (to prevent stuck state if cursor leaves area)
  useEffect(() => {
    const handleMouseUp = () => setMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);


  useEffect(() => {
    const frame = matrix[gridIndex]?.frames?.[frameIndex];
    if (Array.isArray(frame)) {
      setGrid(frame);
    } else {
      console.error("Invalid frame at", gridIndex, frameIndex);
    }
  }, [gridIndex, frameIndex]);


  const toggleCellColor = (rowIndex, colIndex) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      newGrid[rowIndex][colIndex] =
        JSON.stringify(newGrid[rowIndex][colIndex]) !== JSON.stringify(secondaryColor) || mouseDown 
          ? secondaryColor
          : INITIAL_COLOR;
      return newGrid;
    });
  };

  const handleButtonClick = (rowIndex, colIndex) => {
    toggleCellColor(rowIndex, colIndex);
  };

  const handleMouseEnter = (rowIndex, colIndex) => {
    if (mouseDown) {
      toggleCellColor(rowIndex, colIndex);
    }
  };


  return (
    <div className="container mt-4"
         onMouseDown={() => setMouseDown(true)}
         onMouseUp={() => setMouseDown(false)}>

      <div className="row justify-content-center">
        {grid.map((row, rowIndex) => (
          <div className="col-auto" key={rowIndex}>
            {row.map((color, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className="btn m-1"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: `rgb(${color.join(',')})`,
                }}
                onMouseDown={() => handleButtonClick(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
