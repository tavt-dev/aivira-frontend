import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Drawer } from "./index.jsx";
import { renderWithProviders } from "../../test/render.jsx";

describe("Drawer focus", () => {
  it("keeps focus in a controlled input when its parent rerenders", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ControlledDrawer />);
    const input = screen.getByRole("textbox", { name: "Book title" });

    expect(input).toHaveFocus();
    await user.type(input, "Decision Logs");

    expect(input).toHaveValue("Decision Logs");
    expect(input).toHaveFocus();
  });
});

function ControlledDrawer() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(true);

  return (
    <Drawer open={open} title="Create book" onClose={() => setOpen(false)}>
      <label>
        Book title
        <input aria-label="Book title" value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
    </Drawer>
  );
}
