import { fireEvent, render, screen, within } from "@testing-library/react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { usePlayerStore } from "@/stores/player";
import { useUIStore } from "@/stores/ui";
import type { Song } from "@/types";

let mockPathname = "/";
let mockSession: { user: { role: string } } | null = { user: { role: "user" } };
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: mockSession }),
}));
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined }),
}));
jest.mock("@/hooks/useNavigationAvailability", () => ({
  useNavigationAvailability: () => ({
    hasAlbums: true,
    hasRadioStations: true,
  }),
}));
jest.mock("@/hooks/usePlatformSettings", () => ({
  usePlatformSettings: () => ({
    data: { general: { edula_enabled: true, polls_enabled: false } },
  }),
}));
jest.mock("@/components/player/StreamingQualityPicker", () => ({
  StreamingQualityPicker: () => null,
}));
jest.mock("@/components/music/CreatePlaylistModal", () => ({
  CreatePlaylistModal: ({ open }: { open: boolean }) =>
    open ? <div role="dialog">Create your playlist</div> : null,
}));

const song = {
  id: 1,
  title: "Ateso song",
  slug: "ateso-song",
  artist: { id: 1, name: "Artist", slug: "artist" },
} as Song;
beforeEach(() => {
  mockPathname = "/";
  mockSession = { user: { role: "user" } };
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  usePlayerStore.setState({
    currentSong: null,
    queue: [],
    originalQueue: [],
    queueIndex: 0,
    isPlaying: false,
  });
  useUIStore.setState({ playerMinimized: false, activeModal: null });
});

it("keeps playback inside navigation after minimizing and can restore it", () => {
  usePlayerStore.getState().play(song);
  render(<MobileBottomNav />);
  const dock = screen.getByRole("navigation", { name: "Mobile navigation" });
  fireEvent.click(within(dock).getByTitle("Minimize player"));
  expect(within(dock).getByLabelText("Minimized player")).toBeInTheDocument();
  fireEvent.click(within(dock).getByRole("button", { name: "Pause" }));
  expect(usePlayerStore.getState().isPlaying).toBe(false);
  fireEvent.click(within(dock).getByRole("button", { name: "Expand player: Ateso song" }));
  expect(within(dock).getByTitle("Minimize player")).toBeInTheDocument();
});

it("shows playlist creation in Library and opens the existing dialog", () => {
  mockPathname = "/library";
  render(<MobileBottomNav />);
  fireEvent.click(screen.getByRole("button", { name: "Create playlist" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Create your playlist");
});

it("opens Edula composition through the shared dialog state", () => {
  mockPathname = "/edula";
  render(<MobileBottomNav />);
  fireEvent.click(screen.getByRole("button", { name: "Create post" }));
  expect(useUIStore.getState().activeModal).toBe("edula-compose");
});

it("offers Studio creation in an accessible sheet", () => {
  mockPathname = "/artist";
  mockSession = { user: { role: "artist" } };
  render(<MobileBottomNav />);
  fireEvent.click(screen.getByRole("button", { name: "Create in Studio" }));
  expect(screen.getByRole("dialog", { name: "Create in Studio" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Upload music" })).toHaveAttribute(
    "href",
    "/artist/upload",
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it.each(["/", "/songs", "/polls", "/playlists/new", "/artist/upload"])(
  "hides irrelevant or disabled creation on %s",
  (path) => {
    mockPathname = path;
    render(<MobileBottomNav />);
    expect(
      screen.queryByRole("button", {
        name: /Create playlist|Create post|Create in Studio|Create poll/,
      }),
    ).not.toBeInTheDocument();
  },
);

it("does not offer creation to guests", () => {
  mockPathname = "/library";
  mockSession = null;
  render(<MobileBottomNav />);
  expect(screen.queryByRole("button", { name: "Create playlist" })).not.toBeInTheDocument();
});
