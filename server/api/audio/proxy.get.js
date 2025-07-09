// Proxy dla Firebase Storage audio - rozwiazuje CORS problemy
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const audioUrl = query.url
    
    if (!audioUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing audio URL parameter'
      })
    }
    
    // Sprawdz czy URL jest z Firebase Storage
    if (!audioUrl.includes('storage.googleapis.com') && !audioUrl.includes('firebasestorage.app')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid audio URL - only Firebase Storage URLs allowed'
      })
    }
    
    console.log('Proxying audio request:', audioUrl)
    
    // Pobierz audio z Firebase Storage
    const response = await fetch(audioUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MyAffirms-Server/1.0'
      }
    })
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch audio: ${response.statusText}`
      })
    }
    
    // Przekaz audio z odpowiednimi headerami CORS
    const audioBuffer = await response.arrayBuffer()
    
    setHeader(event, 'Content-Type', response.headers.get('content-type') || 'audio/mpeg')
    setHeader(event, 'Content-Length', audioBuffer.byteLength.toString())
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    
    return new Uint8Array(audioBuffer)
    
  } catch (error) {
    console.error('Audio proxy error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to proxy audio'
    })
  }
})