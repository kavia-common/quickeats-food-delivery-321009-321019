import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders QuickEats brand", () => {
  render(<App />);
  const brand = screen.getByText(/QuickEats/i);
  expect(brand).toBeInTheDocument();
});
