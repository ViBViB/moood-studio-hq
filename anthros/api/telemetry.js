import { Redis } from '@upstash/redis'

export default async function handler(req, res) {
    console.log('[Telemetry API] Available env keys:', Object.keys(process.env).filter(k => k.includes('KV') || k.includes('REDIS') || k.includes('UPSTASH')));

    // Only allow POST requests for telemetry
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || process.env.KV_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN;

        if (!url || !token) {
            console.error('[Telemetry API] Missing Redis environment variables.');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const redis = new Redis({ url, token });

        // Handle varying content types (fetch vs sendBeacon)
        let payload = req.body;
        if (typeof req.body === 'string') {
            payload = JSON.parse(req.body);
        }

        if (!payload || !payload.session) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        // Generate a unique key for the session
        const key = `telemetry:anthros:${payload.session}`;

        // Store the detailed telemetry payload
        await redis.set(key, payload);

        // Keep a running set of session IDs for easy retrieval later
        await redis.sadd('telemetry:anthros:sessions', payload.session);

        console.log(`[Telemetry API] Successfully saved session: ${payload.session}`);
        return res.status(200).json({ success: true, message: 'Telemetry saved to Upstash Redis.' });
    } catch (error) {
        console.error('[Telemetry API] Error saving data:', error);
        return res.status(500).json({ error: 'Failed to save telemetry data to DB' });
    }
}
