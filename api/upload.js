const { handleUpload } = require('@vercel/blob/client');

module.exports = async (req, res) => {
  // 1. Explicit CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Generating Vercel Blob client token...');
    
    // The handleUpload function facilitates the secure client-side upload handshake
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Validation logic can go here (e.g. check if user is logged in)
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
            'image/svg+xml', 'application/pdf', 'application/zip',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          tokenPayload: JSON.stringify({ project: 'moood-strategy-intake' }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Vercel Blob Upload Finished:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Handshake Error:', error);
    return res.status(400).json({ error: error.message });
  }
};
