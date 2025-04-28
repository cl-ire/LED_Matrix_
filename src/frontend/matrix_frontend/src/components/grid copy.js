import React, { useState, useEffect } from 'react';

const INITIAL_COLOR = [0, 0, 0]; // RGB for black

const GridButton = () => {
  const [secondaryColor, setSecondaryColor] = useState([255, 0, 0]); // Default to red
  const [grid, setGrid] = useState(
    Array(16).fill(null).map(() => Array(16).fill(INITIAL_COLOR))
  );
  const [mouseDown, setMouseDown] = useState(false);

  // Add global listeners to track mouse up (to prevent stuck state if cursor leaves area)
  useEffect(() => {
    const handleMouseUp = () => setMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

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

  const handleColorChange = (e) => {
    const rgb = hexToRgb(e.target.value);
    if (rgb) setSecondaryColor(rgb);
  };

  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r, g, b];
  };

  const printMatrix = () => {
    console.log('Current Grid Matrix:');
    console.table(grid);
    console.log(JSON.stringify(grid));
  };

  return (
    <div className="container mt-4"
         onMouseDown={() => setMouseDown(true)}
         onMouseUp={() => setMouseDown(false)}>

      <h3 className="text-center">16x16 Grid of Buttons</h3>

      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="me-3">
          <label htmlFor="colorPicker" className="form-label">
            Choose secondary color:
          </label>
          <input
            type="color"
            id="colorPicker"
            value={`#${secondaryColor.map((x) => x.toString(16).padStart(2, '0')).join('')}`}
            onChange={handleColorChange}
          />
        </div>

        <button className="btn btn-info" onClick={printMatrix}>
          Print Matrix to Console
        </button>
      </div>

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

export default GridButton;
