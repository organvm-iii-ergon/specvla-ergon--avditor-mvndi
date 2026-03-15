import { POST } from './route';
import { describe, it, expect, vi } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: () => JSON.stringify({ markdownAudit: 'Mocked audit response', scores: { communication: 90, aesthetic: 80, drive: 70, structure: 85 } }),
  },
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
        };
      }
    }
  };
});

vi.mock('@/services/scraper', () => {
  return {
    scrapeWebsite: vi.fn().mockResolvedValue("Mocked scraped content")
  };
});

vi.mock('@/auth', () => {
  return {
    auth: vi.fn().mockResolvedValue({ user: { email: 'test@example.com', name: 'Test User' } })
  };
});

describe('API Route /api/audit', () => {
  it('returns 401 if Authorization header is missing', async () => {
    const request = new Request('http://localhost/api/audit', {
      method: 'POST',
      body: JSON.stringify({
        link: 'test.com',
        businessType: 'test',
        goals: 'test'
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('Missing or invalid Authorization header');
  });

  it('returns 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/audit', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-key'
      },
      body: JSON.stringify({
        link: 'test.com'
        // Missing businessType and goals
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing required fields');
  });

  it('returns an audit if valid request is made with Authorization header', async () => {
    const request = new Request('http://localhost/api/audit', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        link: 'test.com',
        businessType: 'test',
        goals: 'test'
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.audit).toBe('Mocked audit response');
    
    // Ensure the Gemini mock was called
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
