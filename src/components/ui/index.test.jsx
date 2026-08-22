import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Drawer, Pagination } from "./index.jsx";
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

describe("Pagination", () => {
  it("uses the 1-based page metadata instead of stale navigation flags", async () => {
    const user = userEvent.setup();
    const onPage = vi.fn();
    const t = (key, values) => (values?.page ? `Page ${values.page}` : key);

    renderWithProviders(
      <Pagination
        loading={false}
        meta={{ currentPage: 2, totalPages: 3, totalElements: 60, hasNext: false, hasPrevious: false }}
        onPage={onPage}
        t={t}
      />
    );

    await user.click(screen.getByRole("button", { name: "catalog.nextPage" }));
    expect(onPage).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPage).toHaveBeenCalledTimes(1);
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
