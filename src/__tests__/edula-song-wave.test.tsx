import { render, screen, fireEvent } from "@testing-library/react";
import {
    TimelineSongWave,
    waveBars,
} from "@/components/edula/timeline-song-wave";

const mockSeek = jest.fn();
let mockState = {
    currentSong: { id: 42 },
    currentTime: 30,
    duration: 120,
    isPlaying: true,
    isLoading: false,
    seek: mockSeek,
};
jest.mock("@/stores/player", () => ({
    usePlayerStore: (selector: (state: typeof mockState) => unknown) =>
        selector(mockState),
}));
beforeEach(() => {
    mockSeek.mockReset();
    mockState = {
        currentSong: { id: 42 },
        currentTime: 30,
        duration: 120,
        isPlaying: true,
        isLoading: false,
        seek: mockSeek,
    };
});

test("wave progress and seeking use the shared player's actual timeline", () => {
    const { container } = render(
        <TimelineSongWave songId={42} title="Amun" seconds={180} />,
    );
    const range = screen.getByRole("slider", { name: "Seek Amun" });
    expect(range).toHaveAttribute("max", "120");
    expect(range).toHaveValue("30");
    expect(range).toHaveAttribute("aria-valuetext", "0:30 of 2:00");
    expect(container.querySelectorAll('rect[data-played="true"]')).toHaveLength(
        12,
    );
    fireEvent.change(range, { target: { value: "90" } });
    expect(mockSeek).toHaveBeenCalledWith(90);
    expect(screen.getByText("Playback visualizer")).toBeInTheDocument();
});

test("other songs cannot seek the currently playing track", () => {
    render(<TimelineSongWave songId={99} title="Another song" seconds={180} />);
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByText("Play to seek")).toBeInTheDocument();
    expect(mockSeek).not.toHaveBeenCalled();
});

test("real peaks stay static and the paused state stops the visualizer animation", () => {
    const { container, rerender } = render(
        <TimelineSongWave songId={42} title="Amun" peaks={[0.2, 0.8, 0.5]} />,
    );
    expect(screen.getByText("Waveform")).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("data-visualizer", "false");
    mockState.isPlaying = false;
    rerender(<TimelineSongWave songId={42} title="Amun" />);
    expect(container.firstChild).toHaveAttribute("data-playing", "false");
    expect(screen.getByRole("slider")).toHaveValue("30");
});

test("bad peaks and missing duration do not produce NaN positions or enabled seeking", () => {
    expect(waveBars([NaN, Infinity])).toHaveLength(48);
    expect(
        waveBars([0, -2, 0.5]).every(
            (value) => Number.isFinite(value) && value >= 0.12 && value <= 1,
        ),
    ).toBe(true);
    mockState.duration = 0;
    render(<TimelineSongWave songId={42} title="Unknown duration" />);
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(screen.getByRole("slider")).toHaveValue("0");
});
