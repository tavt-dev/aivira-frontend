import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReviewForm from "./ReviewForm.jsx";
import { renderWithProviders } from "../../test/render.jsx";

describe("ReviewForm", () => {
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn((file) => `blob:${file.name}`)
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires a comment before submit", async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ReviewForm title="Review Clean Architecture" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /Submit review|Gửi đánh giá/ }));

    expect(
      screen.getByText(/Write a short review before submitting.|Vui lòng nhập nhận xét trước khi gửi./)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits selected image files with the review fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const first = imageFile("first.jpg", "image/jpeg");
    const second = imageFile("second.webp", "image/webp");
    renderWithProviders(<ReviewForm title="Review Clean Architecture" onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox"), "Good book quality.");
    await user.upload(screen.getByLabelText(/Choose images|Chọn ảnh/), [first, second]);

    expect(screen.getAllByRole("img")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: /Submit review|Gửi đánh giá/ }));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 5,
      comment: "Good book quality.",
      files: [first, second]
    });
  });

  it("removes an image and revokes its preview URL", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm onSubmit={vi.fn()} />);
    const image = imageFile("cover.png", "image/png");

    await user.upload(screen.getByLabelText(/Choose images|Chọn ảnh/), image);
    await user.click(screen.getByRole("button", { name: /Remove image cover.png|Xóa ảnh cover.png/ }));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cover.png");
  });

  it("rejects unsupported and oversized files without changing the selection", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderWithProviders(<ReviewForm onSubmit={vi.fn()} />);

    await user.upload(
      screen.getByLabelText(/Choose images|Chọn ảnh/),
      new File(["text"], "note.txt", { type: "text/plain" })
    );
    expect(screen.getByText(/Only JPEG, PNG, GIF, or WebP|Chỉ hỗ trợ ảnh JPEG/)).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText(/Choose images|Chọn ảnh/),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" })
    );
    expect(screen.getByText(/no larger than 5 MB|không quá 5 MB/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("rejects a batch above five images and duplicate files", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReviewForm onSubmit={vi.fn()} />);
    const duplicate = imageFile("same.jpg", "image/jpeg", 10);

    await user.upload(screen.getByLabelText(/Choose images|Chọn ảnh/), [duplicate, duplicate]);
    expect(screen.getByText(/already been selected|đã được chọn/)).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText(/Choose images|Chọn ảnh/),
      Array.from({ length: 6 }, (_, index) => imageFile(`${index}.jpg`, "image/jpeg", index))
    );
    expect(screen.getByText(/select up to 5 images|tối đa 5 ảnh/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

function imageFile(name, type, lastModified = 1) {
  return new File(["image"], name, { type, lastModified });
}
