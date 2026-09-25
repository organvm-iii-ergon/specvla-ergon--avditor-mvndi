import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  VERTEX_SHADER,
  FRAGMENT_SHADER,
  getCombinedShaderSource,
  cacheShaderSource,
  getCachedShaderSource,
  SHADER_CACHE_NAME,
  SHADER_ENDPOINT,
} from "./shaders";

describe("shaders module", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("exports valid vertex and fragment shader strings", () => {
    expect(VERTEX_SHADER).toContain("attribute vec2 a_position");
    expect(FRAGMENT_SHADER).toContain("gl_FragColor");
  });

  it("combines vertex and fragment shaders correctly", () => {
    const combined = getCombinedShaderSource();
    expect(combined).toContain("/* VERTEX SHADER */");
    expect(combined).toContain("/* FRAGMENT SHADER */");
    expect(combined).toContain(VERTEX_SHADER);
    expect(combined).toContain(FRAGMENT_SHADER);
  });

  it("caches shader source in localStorage", async () => {
    const result = await cacheShaderSource();
    expect(result).toBe(true);

    expect(localStorage.getItem("avditor_shader_vertex")).toBe(VERTEX_SHADER);
    expect(localStorage.getItem("avditor_shader_fragment")).toBe(FRAGMENT_SHADER);
  });

  it("retrieves cached shader source from localStorage", async () => {
    localStorage.setItem("avditor_shader_vertex", "custom vertex shader");
    localStorage.setItem("avditor_shader_fragment", "custom fragment shader");

    const cached = await getCachedShaderSource();
    expect(cached.vertex).toBe("custom vertex shader");
    expect(cached.fragment).toBe("custom fragment shader");
  });

  it("falls back to default shaders if cache is empty", async () => {
    const cached = await getCachedShaderSource();
    expect(cached.vertex).toBe(VERTEX_SHADER);
    expect(cached.fragment).toBe(FRAGMENT_SHADER);
  });

  it("interacts with CacheStorage API when available", async () => {
    const putMock = vi.fn().mockResolvedValue(undefined);
    const openMock = vi.fn().mockResolvedValue({
      put: putMock,
    });

    vi.stubGlobal("caches", {
      open: openMock,
    });

    const success = await cacheShaderSource();
    expect(success).toBe(true);
    expect(openMock).toHaveBeenCalledWith(SHADER_CACHE_NAME);
    expect(putMock).toHaveBeenCalledWith(SHADER_ENDPOINT, expect.any(Response));
  });
});
