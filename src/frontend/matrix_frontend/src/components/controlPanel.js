import { useTopicContext } from "./hub";

import { HiOutlineTrash } from "react-icons/hi";
import { uploadMatrixToBackend } from "../util/backend_api_functions.js";

const ControlPanel = () => {
	const {
		secondaryColor,
		setSecondaryColor,
		grid,
		setGrid,
		matrix,
		setMatrix,
		gridIndex,
		setGridIndex,
		frameIndex,
		setFrameIndex,
	} = useTopicContext();

    console.log("Matrix in ControlPanel:", matrix);
    console.log("GridIndex in ControlPanel:", gridIndex);
    console.log("FrameIndex in ControlPanel:", frameIndex);

	const handleColorChange = (e) => {
		const rgb = hexToRgb(e.target.value);
		if (rgb) setSecondaryColor(rgb);
	};

	const hexToRgb = (hex) => {
		let r = 0,
			g = 0,
			b = 0;
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

	const formatGridForAlignment = (grid) => {
		return grid
			.map((row) => {
				return (
					"[" +
					row
						.map((color) => {
							const [r, g, b] = color;
							return `[${r.toString().padStart(3)}, ${g
								.toString()
								.padStart(3)}, ${b.toString().padStart(3)}]`;
						})
						.join(", ") +
					"]"
				);
			})
			.join(",\n");
	};

	const printMatrix = () => {
		saveGridToMatrix();
		console.log("Current Grid Matrix:");
		console.table(grid);
		console.log(JSON.stringify(grid));

		const formatted = formatGridForAlignment(grid);
		const output = `[\n${formatted}\n]`;

		const blob = new Blob([output], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = matrix[gridIndex].name + "_grid.txt";
		a.click();
		URL.revokeObjectURL(url);
	};

	function saveGridToMatrix() {
		setMatrix((prevMatrix) => {
			const newMatrix = [...prevMatrix]; // shallow copy of matrix
			const target = { ...newMatrix[gridIndex] }; // copy the current grid object

			// Copy frames array and replace the specific frame
			const newFrames = [...target.frames];
			newFrames[frameIndex] = grid.map((row) => [...row]); // deep copy of grid

			// Update the target with new frames
			target.frames = newFrames;
			newMatrix[gridIndex] = target;

			// Now upload the updated matrix to the backend
			uploadMatrixToBackend(newMatrix);

			return newMatrix;
		});
	}

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setMatrix((prevMatrix) => {
			const newMatrix = [...prevMatrix]; // shallow copy of matrix
			const target = { ...newMatrix[gridIndex] }; // copy the current grid object

			if (name === "frame_delay_ms") {
				target[name] = parseInt(value); // convert to number
			} else {
				target[name] = value; // keep as string
			}
			newMatrix[gridIndex] = target;

			return newMatrix;
		});
	};

	const handleDelete = () => {
		if (matrix[gridIndex].type === "animation") {
			const choice = window.prompt(
				"This is an animation.\nWhat would you like to do?\n- Type 'f' to delete current frame\n- Type 'c' to delete entire component\n"
			);

			if (choice === "f") {
				if (matrix[gridIndex].frames.length > 1) {
					setMatrix((prevMatrix) => {
						const newMatrix = [...prevMatrix];
						const updatedFrames = [...newMatrix[gridIndex].frames];
						updatedFrames.splice(frameIndex, 1); // Remove current frame
						newMatrix[gridIndex].frames = updatedFrames;
						return newMatrix;
					});

					// Adjust frameIndex if needed
					setFrameIndex((prev) => (prev > 0 ? prev - 1 : 0));
					setGrid(matrix[gridIndex].frames[frameIndex > 0 ? frameIndex - 1 : 0]);
				} else {
					alert("Cannot delete the last frame of an animation.");
				}
			} else if (choice === "c") {
				// Delete entire component
				setMatrix((prevMatrix) => {
					const newMatrix = [...prevMatrix];
					newMatrix.splice(gridIndex, 1);
					return newMatrix;
				});
				setGridIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
				setFrameIndex(0);
				console.log("Component deleted");
			} else {
				console.log("Deletion cancelled");
			}
		} else {
			// Default component deletion for non-animation
			const confirmDelete = window.confirm("Are you sure you want to delete this component?");
			if (confirmDelete) {
				setMatrix((prevMatrix) => {
					const newMatrix = [...prevMatrix];
					newMatrix.splice(gridIndex, 1);
					return newMatrix;
				});
				setGridIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
				console.log("Component deleted");
			}
		}
	};

	return (
		<div
			style={{
				transform: "scale(1)",
				transformOrigin: "bottom center",
				height: "auto",
			}}
		>
			<form
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr", // Two columns with equal width
					gap: "20px", // Gap between columns
					marginLeft: "16px",
					marginRight: "16px",
				}}
				className="mb-4 p-4 bg-gray-100 rounded shadow space-y-4"
				onSubmit={(e) => e.preventDefault()}
			>
				{/* Title (centered) */}
				<h4
					style={{
						gridColumn: "span 2",
						textAlign: "center",
						marginBottom: "0px",
						padding: "0px",
					}}
				>
					Component: {gridIndex}
				</h4>

				{/* Left column (form fields) */}

				<div>
					<div>
						<label className="block text-sm font-medium">Name </label>
						<input
							type="text"
							name="name"
							value={matrix[gridIndex].name}
							onChange={handleFormChange}
							className="mt-1 p-2 border rounded w-full"
							style={{ width: "250px", marginLeft: "20px" }}
						/>
					</div>

					<div>
						<label className="block text-sm font-medium">Type </label>
						<select
							name="type"
							value={matrix[gridIndex].type}
							onChange={handleFormChange}
							className="mt-1 p-2 border rounded w-full"
							style={{ width: "250px", marginLeft: "28px" }}
						>
							<option value="static">Static</option>
							<option value="animation">Animation</option>
							<option value="clock">Clock</option>
						</select>
					</div>

					{matrix[gridIndex].type === "animation" && (
						<div>
							<label className="block text-sm font-medium">
								Frame Delay (ms)
							</label>
							<input
								type="number"
								name="frame_delay_ms"
								value={matrix[gridIndex].frame_delay_ms}
								onChange={handleFormChange}
								className="mt-1 p-2 border rounded w-full"
								min="0"
								style={{ width: "170px", marginLeft: "18px" }}
							/>
						</div>
					)}
				</div>

				{/* Right column (additional components) */}
				<div
					className="d-flex flex-column gap-1"
					style={{
						marginTop: "0px",
						width: "100%",
					}}
				>
					{/* Print Matrix Button */}
					<button
						className="btn btn-info p-2 rounded"
						onClick={printMatrix}
						style={{ width: "100%" }} // Make button stretch to the width
					>
						Download Matrix
					</button>

					{/* Save Changes Button */}
					<button
						className="btn btn-info p-2 rounded"
						onClick={saveGridToMatrix}
						style={{ width: "100%" }} // Make button stretch to the width
					>
						Save Changes
					</button>

					{/* Color Picker Row */}
					<div className="d-flex align-items-center me-0">
						<label
							htmlFor="colorPicker"
							className="form-label me-2"
							style={{ width: "100px", marginTop: "5px" }}
						>
							Choose color:
						</label>
						<input
							type="color"
							id="colorPicker"
							value={`#${secondaryColor
								.map((x) => x.toString(16).padStart(2, "0"))
								.join("")}`}
							onChange={handleColorChange}
							className="form-control p-0 rounded"
							style={{
								height: "40px",
								width: "65px",
								marginRight: "10px",
							}}
						/>
						{/* Trash icon and Delete label */}
						<div className="d-flex align-items-center" style={{ marginLeft: "50px" }}>
							<label
								htmlFor="deleteButton"
								className="form-label me-2"
								style={{ width: "60px", marginTop: "5px" }}
							>
								Delete :
							</label>
							<HiOutlineTrash
								onClick={handleDelete}
								size={35}
								style={{ color: "red", cursor: "pointer" }}
							/>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default ControlPanel;
