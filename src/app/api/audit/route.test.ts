import { POST } from './route';
import { describe, it, expect, vi } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: () => 'Mocked audit response',
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

describe('API Route /api/audit', () => {
  it('returns 400 if geminiKey is missing', async () => {
    const request = new Request('http://localhost/api/audit', {
      method: 'POST',
      body: JSON.stringify({
        link: 'test.com',
        businessType: 'test',
        goals: 'test'
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Gemini API Key is required');
  });

  it('returns an audit if valid request is made', async () => {
    const request = new Request('http://localhost/api/audit', {
      method: 'POST',
      body: JSON.stringify({
        link: 'test.com',
        businessType: 'test',
        goals: 'test',
        geminiKey: 'valid-key'
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.audit).toBe('Mocked audit response');
  });
});
