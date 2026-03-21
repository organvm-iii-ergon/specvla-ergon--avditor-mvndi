import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatBox from "./ChatBox";

// Mock the ai package's DefaultChatTransport — must be a class (used with `new`)
vi.mock("ai", () => ({
  DefaultChatTransport: class MockDefaultChatTransport {
    constructor(_options: unknown) {}
  },
}));

// Mock @ai-sdk/react useChat hook
const mockSendMessage = vi.fn();
vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => ({
    messages: [],
    sendMessage: mockSendMessage,
    status: "idle",
    error: null,
  })),
}));

// Mock aiProvider service (uses localStorage which is already mocked in setupTests)
vi.mock("@/services/aiProvider", () => ({
  getStoredApiKey: vi.fn(() => "test-key"),
  getStoredProvider: vi.fn(() => "gemini"),
}));

describe("ChatBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom does not implement scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders without crashing", () => {
    render(<ChatBox auditContext="test audit context" />);
    expect(screen.getByText(/Consult the Oracle/i)).toBeInTheDocument();
  });

  it("renders the input field", () => {
    render(<ChatBox auditContext="test audit context" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<ChatBox auditContext="test audit context" />);
    const button = screen.getByRole("button", { name: /ask/i });
    expect(button).toBeInTheDocument();
  });

  it("submit button is disabled when input is empty", () => {
    render(<ChatBox auditContext="test audit context" />);
    const button = screen.getByRole("button", { name: /ask/i });
    expect(button).toBeDisabled();
  });

  it("submit button is enabled when input has text", () => {
    render(<ChatBox auditContext="test audit context" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "How do I improve my score?" } });
    const button = screen.getByRole("button", { name: /ask/i });
    expect(button).toBeEnabled();
  });

  it("shows placeholder text in empty state", () => {
    render(<ChatBox auditContext="test audit context" />);
    expect(screen.getByText("The Oracle is listening...")).toBeInTheDocument();
  });

  it("displays user messages from useChat", async () => {
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: [
        {
          id: "1",
          role: "user",
          parts: [{ type: "text", text: "Hello Oracle" }],
          content: "Hello Oracle",
        },
      ],
      sendMessage: mockSendMessage,
      status: "idle",
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ChatBox auditContext="test context" />);
    expect(screen.getByText("Hello Oracle")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("displays assistant messages from useChat", async () => {
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: [
        {
          id: "2",
          role: "assistant",
          parts: [{ type: "text", text: "I see your Mercury score is low." }],
          content: "I see your Mercury score is low.",
        },
      ],
      sendMessage: mockSendMessage,
      status: "idle",
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ChatBox auditContext="test context" />);
    expect(screen.getByText("I see your Mercury score is low.")).toBeInTheDocument();
    expect(screen.getByText("Oracle")).toBeInTheDocument();
  });

  it("shows streaming indicator when status is streaming", async () => {
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "streaming",
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ChatBox auditContext="test context" />);
    expect(screen.getByText("Oracle is channeling...")).toBeInTheDocument();
  });

  it("disables input and button while streaming", async () => {
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "streaming",
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ChatBox auditContext="test context" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /ask/i })).toBeDisabled();
  });

  it("shows error message when error is present", async () => {
    const { useChat } = await import("@ai-sdk/react");
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: "idle",
      error: new Error("Connection failed"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ChatBox auditContext="test context" />);
    expect(screen.getByText(/temporarily disconnected/i)).toBeInTheDocument();
  });

  it("calls sendMessage on form submit with non-empty input", () => {
    render(<ChatBox auditContext="my audit context" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "What should I fix?" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);
    expect(mockSendMessage).toHaveBeenCalledWith(
      { text: "What should I fix?" },
      { body: { auditContext: "my audit context" } }
    );
  });
});
