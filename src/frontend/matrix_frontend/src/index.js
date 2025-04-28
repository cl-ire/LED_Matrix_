import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Hub from "./components/hub";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<div style={{ transform: "scale(0.85)", transformOrigin: "top center", height: "100vh" }}>
			<Hub />
		</div>
	</React.StrictMode>
);
