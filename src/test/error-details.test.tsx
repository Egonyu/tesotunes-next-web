import { render, screen } from "@/test/test-utils";
import { ErrorDetails } from "@/components/errors/error-details";

// The boundaries said "Something went wrong" and nothing else, so a person
// hitting one had nothing to report and no way to get it — asking someone on a
// phone to open dev tools is not a reasonable request. A render error's message
// survives into production in the browser, so it belongs on the page.

describe("ErrorDetails", () => {
  it("shows the message, which is the part that identifies the fault", () => {
    render(
      <ErrorDetails
        error={Object.assign(new Error("Cannot read properties of undefined (reading 'map')"), {
          digest: "1234567890",
        })}
      />,
    );

    expect(screen.getByText(/reading 'map'/)).toBeInTheDocument();
    expect(screen.getByText(/1234567890/)).toBeInTheDocument();
  });

  it("shows the digest alone when there is no message", () => {
    const error = Object.assign(new Error(""), { digest: "abc123" });

    render(<ErrorDetails error={error} />);

    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  /** Nothing to say is better said with nothing than with an empty box. */
  it("renders nothing when there is neither", () => {
    const { container } = render(<ErrorDetails error={new Error("")} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("offers the details for copying, so they can be pasted into a report", () => {
    render(
      <ErrorDetails
        error={Object.assign(new Error("boom"), { digest: "d1" })}
      />,
    );

    expect(screen.getByRole("button", { name: /copy error details/i })).toBeInTheDocument();
  });
});
