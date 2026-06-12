import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CameraCapture } from "@/components/ui/camera-capture";

describe("CameraCapture", () => {
  it("falls back gracefully when the device has no camera API", async () => {
    // jsdom has no navigator.mediaDevices — exactly the unavailable path.
    const onClose = jest.fn();
    const onCapture = jest.fn();

    render(
      <CameraCapture facing="user" onCapture={onCapture} onClose={onClose} />
    );

    await waitFor(() => {
      expect(screen.getByText("Camera not available")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /choose a photo instead/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onCapture).not.toHaveBeenCalled();
  });

  it("shows the permission message when getUserMedia rejects", async () => {
    Object.defineProperty(global.navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: jest.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError")) },
    });

    render(
      <CameraCapture facing="environment" onCapture={jest.fn()} onClose={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("Camera permission needed")).toBeInTheDocument();
    });

    Reflect.deleteProperty(global.navigator, "mediaDevices");
  });
});
