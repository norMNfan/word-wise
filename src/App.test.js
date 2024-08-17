import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders each tab", () => {
  render(<App />);
  const tabs = screen.getAllByRole("tab");
  expect(tabs).toHaveLength(4); // Assuming you have 4 tabs
  expect(tabs[0]).toHaveTextContent("Current Vocab");
  expect(tabs[1]).toHaveTextContent("All Vocab");
  expect(tabs[2]).toHaveTextContent("Third Page");
  expect(tabs[3]).toHaveTextContent("Settings");
});
