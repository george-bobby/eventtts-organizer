import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Bypass SSL certificate verification for Roboflow API.
// Required on Windows/corporate networks where Node.js can't verify
// Roboflow's intermediate certificate chain.
const roboflowAgent = new https.Agent({ rejectUnauthorized: false });

// Types
interface CampusLocation {
	name: string;
	lat: number;
	lng: number;
}

interface GPSMatch {
	name: string | null;
	distance: number;
	confidence: number;
	coordinates: CampusLocation | null;
}

interface AIPrediction {
	predicted_class: string;
	probabilities: Record<string, number>;
}

interface HybridPrediction {
	final_location: string;
	final_confidence: number;
	gps_contribution: number;
	ai_contribution: number;
	method: 'hybrid' | 'gps-only' | 'ai-only';
	location_scores: Record<string, number>;
}

interface RoboflowPrediction {
	class: string;
	confidence: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

interface RoboflowResponse {
	// Object detection models return an array; classification models may return an object
	predictions: RoboflowPrediction[] | Record<string, number>;
	// Classification shorthand fields
	top?: string;
	confidence?: number;
	image?: {
		width: number;
		height: number;
	};
}

// Configuration
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const MODEL_ID = 'c-tracker-awsa5/1';
const ROBOFLOW_URL = `https://serverless.roboflow.com/${MODEL_ID}`;

// Campus location coordinates
const campusLocations: CampusLocation[] = [
	{ name: 'Main Gate', lat: 12.863788, lng: 77.434897 },
	{ name: 'Cross Road', lat: 12.86279, lng: 77.437411 },
	{ name: 'Block 1', lat: 12.863154, lng: 77.437718 },
	{ name: 'Students Square', lat: 12.862314, lng: 77.43824 },
	{ name: 'Open Auditorium', lat: 12.862510,lng:  77.438496  },
	{ name: 'Block 4', lat: 12.862211, lng: 77.43886 },
	{ name: 'Xpress Cafe', lat: 12.862045, lng: 77.439374 },
	{ name: 'Block 6', lat: 12.862103, lng: 77.439809 },
	{ name: 'Amphi Theater', lat: 12.861424, lng: 77.438057 },
	{ name: 'PU Block', lat: 12.860511, lng: 77.437249 },
	{ name: 'Architecture Block', lat: 12.860132, lng: 77.438592 },
];

// Utility functions
function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371e3; // Earth's radius in meters
	const phi1 = (lat1 * Math.PI) / 180;
	const phi2 = (lat2 * Math.PI) / 180;
	const dphi = ((lat2 - lat1) * Math.PI) / 180;
	const dlambda = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dphi / 2) ** 2 +
		Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;

	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestLocation(userLat: number, userLng: number): GPSMatch {
	let nearestLocation: CampusLocation | null = null;
	let minDistance = Infinity;

	for (const loc of campusLocations) {
		const dist = calculateDistance(userLat, userLng, loc.lat, loc.lng);
		if (dist < minDistance) {
			minDistance = dist;
			nearestLocation = loc;
		}
	}

	const maxDistance = 200; // meters
	const confidence = Math.max(0, Math.min(1, 1 - minDistance / maxDistance));

	return {
		name: nearestLocation?.name || null,
		distance: minDistance,
		confidence,
		coordinates: nearestLocation || null,
	};
}

function combinePredictions(
	aiPrediction: AIPrediction | null,
	gpsMatch: GPSMatch | null,
	gpsWeight: number = 40,
	aiWeight: number = 60
): HybridPrediction | null {
	if (!aiPrediction && !gpsMatch) {
		return null;
	}

	const totalWeight = gpsWeight + aiWeight || 1;
	const gpsW = gpsWeight / totalWeight;
	const aiW = aiWeight / totalWeight;

	const scores: Record<string, number> = {};

	// GPS contribution
	if (gpsMatch && gpsMatch.name) {
		scores[gpsMatch.name] = gpsW * gpsMatch.confidence;
	}

	// AI contribution
	if (aiPrediction && aiPrediction.probabilities) {
		for (const [loc, prob] of Object.entries(aiPrediction.probabilities)) {
			scores[loc] = (scores[loc] || 0) + aiW * prob;
		}
	}

	if (Object.keys(scores).length === 0) {
		return null;
	}

	const bestLoc = Object.keys(scores).reduce((a, b) =>
		scores[a] > scores[b] ? a : b
	);
	const bestScore = scores[bestLoc];

	const gpsContribution =
		gpsMatch && gpsMatch.name === bestLoc
			? ((gpsW * gpsMatch.confidence) / bestScore) * 100
			: 0;

	const aiContribution = aiPrediction
		? ((aiW * (aiPrediction.probabilities[bestLoc] || 0)) / bestScore) * 100
		: 0;

	return {
		final_location: bestLoc,
		final_confidence: bestScore,
		gps_contribution: gpsContribution,
		ai_contribution: aiContribution,
		method:
			gpsMatch && aiPrediction ? 'hybrid' : gpsMatch ? 'gps-only' : 'ai-only',
		location_scores: scores,
	};
}

async function predictWithRoboflow(
	imageBase64: string
): Promise<AIPrediction | null> {
	try {
		const response = await axios({
			method: 'POST',
			url: ROBOFLOW_URL,
			params: {
				api_key: ROBOFLOW_API_KEY,
				confidence: 0.01,
			},
			data: imageBase64,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			httpsAgent: roboflowAgent,
			timeout: 30000,
		});

		const roboflowData: RoboflowResponse = response.data;
		console.log('[Roboflow] Raw response:', JSON.stringify(roboflowData).slice(0, 600));

		const probabilities: Record<string, number> = {};
		let topClass: string | null = null;
		let topConfidence = 0;

		// ── Case 1: Classification model returns top/confidence shorthand ──
		if (roboflowData.top && typeof roboflowData.confidence === 'number') {
			topClass = roboflowData.top;
			topConfidence = roboflowData.confidence;
			probabilities[topClass] = topConfidence;
		}

		// ── Case 2: Predictions is an array (object detection / some classifiers) ──
		if (Array.isArray(roboflowData.predictions)) {
			if (roboflowData.predictions.length === 0) {
				console.warn('[Roboflow] Empty predictions array — model detected nothing in this image');
				if (!topClass) return null;
			} else {
				for (const pred of roboflowData.predictions) {
					probabilities[pred.class] = Math.max(probabilities[pred.class] ?? 0, pred.confidence);
				}
				const top = roboflowData.predictions.reduce((a, b) =>
					a.confidence > b.confidence ? a : b
				);
				if (top.confidence > topConfidence) {
					topClass = top.class;
					topConfidence = top.confidence;
				}
			}
		}
		// ── Case 3: Predictions is an object/dict {className: confidence} ──
		else if (roboflowData.predictions && typeof roboflowData.predictions === 'object') {
			const dict = roboflowData.predictions as Record<string, number>;
			for (const [cls, conf] of Object.entries(dict)) {
				probabilities[cls] = conf;
				if (conf > topConfidence) {
					topConfidence = conf;
					topClass = cls;
				}
			}
		}

		if (!topClass) {
			console.warn('[Roboflow] Could not extract any prediction from response');
			return null;
		}

		console.log(`[Roboflow] Top prediction: ${topClass} (${(topConfidence * 100).toFixed(1)}%)`);

		return {
			predicted_class: topClass,
			probabilities,
		};
	} catch (error: any) {
		if (error?.response) {
			console.error(
				`[Roboflow] HTTP ${error.response.status}:`,
				JSON.stringify(error.response.data).slice(0, 500)
			);
		} else if (error?.request) {
			console.error('[Roboflow] No response (timeout/network):', error.message);
		} else {
			console.error('[Roboflow] Setup error:', error?.message);
		}
		return null;
	}
}

async function validateImageWithGemini(
	imageBase64: string
): Promise<{ isValid: boolean; reason: string }> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		console.warn('[Gemini] GEMINI_API_KEY is not defined, skipping pre-validation');
		return { isValid: true, reason: 'Gemini API key not configured' };
	}

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
			generationConfig: {
				responseMimeType: 'application/json',
			},
		});

		const prompt = `You are a campus localization assistant.
Analyze the provided image. Does the image depict an outdoor campus area, building, gate, landmark, or indoor facility (like a classroom, library, auditorium, student square, or academic block corridor)?
Reject closeups of faces/selfies (where the face dominates the frame and campus context is missing), documents/text sheets, digital screens, screenshots, random household objects, food plates (where the food dominates and cafe background is missing), animals, or other unrelated things.
Provide your response strictly in the following JSON format:
{
  "isValidCampusLocation": boolean,
  "reason": "a brief explanation of why the image is or is not a valid campus location"
}`;

		const result = await model.generateContent([
			prompt,
			{
				inlineData: {
					data: imageBase64,
					mimeType: 'image/jpeg',
				},
			},
		]);

		const text = result.response.text();
		console.log('[Gemini] Raw response:', text);

		const json = JSON.parse(text);
		return {
			isValid: !!json.isValidCampusLocation,
			reason: json.reason || 'No reason provided',
		};
	} catch (error) {
		console.error('[Gemini] Pre-validation failed:', error);
		// In case of API/parsing failure, we fallback to true to not block the user's workflow entirely
		return { isValid: true, reason: 'Gemini API/parsing error, bypassing pre-validation' };
	}
}

async function getAIPrediction(
	imageBase64: string
): Promise<AIPrediction | null> {
	const result = await predictWithRoboflow(imageBase64);
	// If Roboflow fails, return null — do NOT silently substitute a fake result.
	return result;
}

function getGPSPrediction(lat: number, lng: number): GPSMatch {
	return findNearestLocation(lat, lng);
}

function processHybridPrediction(
	aiPrediction: AIPrediction | null,
	gpsMatch: GPSMatch | null,
	gpsWeight: number,
	aiWeight: number
): any {
	// Handle GPS-only case (when AI weight is 0 or AI prediction fails)
	if (aiWeight === 0 || !aiPrediction) {
		if (gpsMatch && gpsMatch.name) {
			return {
				predicted_class: gpsMatch.name,
				confidence: gpsMatch.confidence,
				probabilities: { [gpsMatch.name]: gpsMatch.confidence },
				gps_data: gpsMatch,
				method: 'gps-only',
			};
		}
		// No GPS data available either
		return {
			error: 'No location could be determined',
			message:
				'Unable to detect location from image and no GPS coordinates provided',
			method: 'failed',
		};
	}

	// Handle AI-only case (when GPS weight is 0 or no GPS data)
	if (gpsWeight === 0 || !gpsMatch || !gpsMatch.name) {
		return {
			predicted_class: aiPrediction.predicted_class,
			confidence: aiPrediction.probabilities[aiPrediction.predicted_class],
			probabilities: aiPrediction.probabilities,
			ai_data: aiPrediction,
			method: 'ai-only',
		};
	}

	// Handle hybrid case
	const hybrid = combinePredictions(
		aiPrediction,
		gpsMatch,
		gpsWeight,
		aiWeight
	);

	if (hybrid) {
		return {
			predicted_class: hybrid.final_location,
			confidence: hybrid.final_confidence,
			probabilities: aiPrediction.probabilities,
			hybrid_prediction: hybrid,
			gps_data: gpsMatch,
			ai_data: aiPrediction,
			method: hybrid.method,
		};
	}

	// Fallback to AI-only if hybrid fails
	return {
		predicted_class: aiPrediction.predicted_class,
		confidence: aiPrediction.probabilities[aiPrediction.predicted_class],
		probabilities: aiPrediction.probabilities,
		ai_data: aiPrediction,
		method: 'ai-only',
	};
}

export async function POST(request: NextRequest) {
	try {
		let gpsLat: number | null = null;
		let gpsLng: number | null = null;
		let gpsWeight: number = 40;
		let aiWeight: number = 60;
		let imageFile: File | null = null;
		let imageBase64: string | null = null;

		// Check content type to determine parsing method
		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('application/json')) {
			// JSON request
			try {
				const body = await request.json();
				gpsLat = body.latitude || body.gps_lat || null;
				gpsLng = body.longitude || body.gps_lng || null;
				gpsWeight = body.gps_weight || 40;
				aiWeight = body.ai_weight || 60;
				imageBase64 = body.image || body.imageBase64 || null;
			} catch (error) {
				return NextResponse.json(
					{ error: 'Invalid JSON format' },
					{ status: 400 }
				);
			}
		} else {
			// FormData request (default)
			try {
				const formData = await request.formData();
				gpsLat = formData.get('gps_lat')
					? parseFloat(formData.get('gps_lat') as string)
					: null;
				gpsLng = formData.get('gps_lng')
					? parseFloat(formData.get('gps_lng') as string)
					: null;
				gpsWeight = formData.get('gps_weight')
					? parseInt(formData.get('gps_weight') as string)
					: 40;
				aiWeight = formData.get('ai_weight')
					? parseInt(formData.get('ai_weight') as string)
					: 60;
				imageFile = formData.get('image') as File;
			} catch (error) {
				return NextResponse.json(
					{ error: 'Invalid FormData format' },
					{ status: 400 }
				);
			}
		}

		let aiPrediction: AIPrediction | null = null;
		let gpsMatch: GPSMatch | null = null;

		// Get AI prediction if needed (when AI weight > 0 and image provided)
		if (aiWeight > 0) {
			if (imageFile) {
				// Convert file to base64
				const bytes = await imageFile.arrayBuffer();
				const buffer = Buffer.from(bytes);
				imageBase64 = buffer.toString('base64');
			}

			if (imageBase64) {
				// Validate image content using Gemini before calling Roboflow
				const validation = await validateImageWithGemini(imageBase64);
				if (!validation.isValid) {
					return NextResponse.json(
						{
							error: 'Invalid campus image',
							message: validation.reason,
							method: 'failed',
						},
						{ status: 422 }
					);
				}
				aiPrediction = await getAIPrediction(imageBase64);
			}
		}

		// Get GPS prediction if needed (when GPS weight > 0 and coordinates provided)
		if (gpsWeight > 0 && gpsLat !== null && gpsLng !== null) {
			gpsMatch = getGPSPrediction(gpsLat, gpsLng);
		}

		// Process the prediction based on available data and weights
		const response = processHybridPrediction(
			aiPrediction,
			gpsMatch,
			gpsWeight,
			aiWeight
		);

		// Check if the response indicates an error
		if (response && response.error) {
			return NextResponse.json(response, { status: 422 }); // Unprocessable Entity
		}

		if (!response) {
			return NextResponse.json(
				{
					error: 'No valid prediction could be made',
					message:
						'Please provide either an image (for AI prediction) or GPS coordinates (for GPS prediction)',
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(response);
	} catch (error) {
		console.error('Prediction error:', error);
		return NextResponse.json(
			{
				error: 'Prediction failed',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
