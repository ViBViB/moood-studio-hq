const { handleUpload } = require('@vercel/blob/client');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Here you can validate the user session
        return {
          allowedContentTypes: [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'image/webp', 
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          tokenPayload: JSON.stringify({
            // optional metadata
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called when the upload is finished on Vercel's side
        console.log('Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(400).json({ error: error.message });
  }
};
