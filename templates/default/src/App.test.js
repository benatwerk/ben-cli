import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App component", () => {
    test("renders the app text", () => {
        render(<App />);
        const appText = screen.getByText(/I'm a react app/i);
        expect(appText).toBeInTheDocument();
    });
});
