// Test script to verify Google Cloud TTS voices
const testText = "To jest test głosu"

const testVoices = async () => {
  console.log('Testing TTS voices...')
  
  // Test Marek (Male)
  const marekResponse = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: testText,
      voiceId: 'pl-PL-MarekNeural',
      rate: 1.0,
      pitch: 0.0
    })
  })
  
  const marekData = await marekResponse.json()
  console.log('Marek response:', marekData)
  
  // Test Agnieszka (Female)  
  const agnieszkaResponse = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: testText,
      voiceId: 'pl-PL-AgnieszkaNeural',
      rate: 1.0,
      pitch: 0.0
    })
  })
  
  const agnieszkaData = await agnieszkaResponse.json()
  console.log('Agnieszka response:', agnieszkaData)
  
  // Compare audio content
  if (marekData.audioContent && agnieszkaData.audioContent) {
    console.log('Audio content comparison:')
    console.log('Marek audioContent length:', marekData.audioContent.length)
    console.log('Agnieszka audioContent length:', agnieszkaData.audioContent.length)
    console.log('Are they identical?', marekData.audioContent === agnieszkaData.audioContent)
    
    if (marekData.audioContent === agnieszkaData.audioContent) {
      console.error('🚨 PROBLEM: Both voices generated identical audio content!')
    } else {
      console.log('✅ Audio content is different - voices are working correctly')
    }
  }
}

// Run in browser console
testVoices()