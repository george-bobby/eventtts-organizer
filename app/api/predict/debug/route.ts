import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const MODEL_ID = 'c-tracker-awsa5/1';

// Same agent used in the main predict route
const agent = new https.Agent({ rejectUnauthorized: false });

// Tiny 1x1 white JPEG in base64
const DUMMY_IMAGE =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARC' +
  'AABAAEDASIA2gABAREA/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EAB8QAAEEAgMBAQAAAAAAAAAAAAEAAgMEERIhMUH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEB' +
  'AAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Ax9FFFAFFFFAf/9k=';

async function tryEndpoint(url: string) {
  try {
    const r = await axios({
      method: 'POST',
      url,
      params: { api_key: ROBOFLOW_API_KEY, confidence: 0.01 },
      data: DUMMY_IMAGE,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: agent,
      timeout: 15000,
    });
    return { status: r.status, data: r.data };
  } catch (e: any) {
    return {
      error: true,
      status: e?.response?.status,
      message: e?.message,
      data: e?.response?.data,
    };
  }
}

export async function GET(_request: NextRequest) {
  const [serverless, detect, classify] = await Promise.all([
    tryEndpoint(`https://serverless.roboflow.com/${MODEL_ID}`),
    tryEndpoint(`https://detect.roboflow.com/${MODEL_ID}`),
    tryEndpoint(`https://classify.roboflow.com/${MODEL_ID}`),
  ]);

  return NextResponse.json({
    config: {
      api_key_present: !!ROBOFLOW_API_KEY,
      api_key_prefix: ROBOFLOW_API_KEY?.slice(0, 6) + '...',
      model_id: MODEL_ID,
    },
    serverless,
    detect,
    classify,
  });
}
