export const setIndex = async (index) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    try {
        const response = await fetch(`${baseUrl}/matrix/set_index?index=${index}`, {
            method: "POST",
        });
        const data = await response.json();
        if (data.status === "success") {
            return data.index;
        } else {
            console.error("Error:", data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

export const fetchMatrix = async (setMatrix, setIsDataLoaded) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
	console.log("Base URL:", baseUrl);
    console.log("Fetching matrix from backend...");
    try {
        const res = await fetch(`${baseUrl}/matrix`);
        if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
                setMatrix(data);
            }
            console.log("Matrix loaded from backend:", data);
        }
    } catch (err) {
        console.error("Error loading matrix:", err);
    }
    setIsDataLoaded(true);
};

export const uploadMatrixToBackend = async (matrix) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    try {
        const res = await fetch(`${baseUrl}/matrix`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(matrix),
        });
        if (res.ok) {
            console.log("Matrix uploaded to backend.");
        } else {
            console.error("Failed to upload matrix.");
        }
    } catch (err) {
        console.error("Error uploading matrix:", err);
    }
};
