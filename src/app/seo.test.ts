import { describe, it, expect } from "vitest";
import { generateMetadata as aboutMetadata } from "./about/page";
import { generateMetadata as compareMetadata } from "./compare/page";
import { generateMetadata as docsMetadata } from "./docs/page";
import { generateMetadata as examplesMetadata } from "./examples/page";
import { generateMetadata as pricingMetadata } from "./pricing/page";
import { generateMetadata as historyMetadata } from "./history/page";
import { generateMetadata as vaultMetadata } from "./vault/page";

describe("Per-page metadata generator functions", () => {
  it("generateMetadata for /about returns correct title, description, and OG image", async () => {
    const meta = await aboutMetadata();
    expect(meta.title).toBe("Methodology");
    expect(meta.description).toContain("Four Pillars");
    expect(meta.openGraph?.images).toContain("/api/og?domain=Methodology");
  });

  it("generateMetadata for /compare returns correct title, description, and OG image", async () => {
    const meta = await compareMetadata();
    expect(meta.title).toBe("Competitor Analysis");
    expect(meta.description).toContain("Compare up to 3 websites");
    expect(meta.openGraph?.images).toContain("/api/og?domain=Competitor%20Analysis");
  });

  it("generateMetadata for /docs returns correct title, description, and OG image", async () => {
    const meta = await docsMetadata();
    expect(meta.title).toBe("API Documentation");
    expect(meta.description).toContain("API reference");
    expect(meta.openGraph?.images).toContain("/api/og?domain=API%20Documentation");
  });

  it("generateMetadata for /examples returns correct title, description, and OG image", async () => {
    const meta = await examplesMetadata();
    expect(meta.title).toBe("Case Studies");
    expect(meta.description).toContain("See how Avditor Mvndi decodes top brands");
    expect(meta.openGraph?.images).toContain("/api/og?domain=Case%20Studies");
  });

  it("generateMetadata for /pricing returns correct title, description, and OG image", async () => {
    const meta = await pricingMetadata();
    expect(meta.title).toBe("Pricing");
    expect(meta.description).toContain("Simple, cosmic pricing");
    expect(meta.openGraph?.images).toContain("/api/og?domain=Pricing");
  });

  it("generateMetadata for /history returns correct title, description, and OG image", async () => {
    const meta = await historyMetadata();
    expect(meta.title).toBe("Cosmic Archive");
    expect(meta.description).toContain("Review past digital manifestations");
    expect(meta.openGraph?.images).toContain("/api/og?domain=Cosmic%20Archive");
  });

  it("generateMetadata for /vault returns correct title, description, and OG image", async () => {
    const meta = await vaultMetadata();
    expect(meta.title).toBe("The Growth Vault");
    expect(meta.description).toContain("gated library");
    expect(meta.openGraph?.images).toContain("/api/og?domain=Growth%20Vault");
  });
});
