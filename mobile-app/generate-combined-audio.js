// Generate combined audio files with different voices
const fs = require('fs');
const path = require('path');

const affirmations = [
  "Jestem pewny siebie i zdolny",
  "Przyciagam sukces we wszystkim co robie", 
  "Jestem godny milosci i szacunku",
  "Ufam w swoja zdolnosc do pokonywania wyzwan",
  "Jestem wdzieczny za wszystkie mozliwosci w moim zyciu",
  "Kazdy dzien przynosi mi nowe okazje do rozwoju",
  "Mam w sobie sile do osiagniecia wszystkich swoich celow"
];

// Different voice options for Google TTS
const voices = {
  female: {
    name: 'Kobieta',
    params: '&ttsspeed=0.8'  // Female voice is default for Polish
  },
  male: {
    name: 'Mężczyzna', 
    params: '&ttsspeed=0.8'  // We'll try different approach for male
  }
};

// Generate URLs for individual affirmations with different voices
const generateVoiceUrls = () => {
  const result = {};
  
  Object.keys(voices).forEach(voiceKey => {
    result[voiceKey] = {
      name: voices[voiceKey].name,
      affirmations: affirmations.map((text, index) => ({
        id: index,
        text: text,
        url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=pl&client=tw-ob&q=${encodeURIComponent(text)}${voices[voiceKey].params}`
      })),
      // Combined session URL - all affirmations in one request
      combinedUrl: generateCombinedUrl(affirmations, voices[voiceKey].params)
    };
  });
  
  return result;
};

const generateCombinedUrl = (texts, voiceParams) => {
  // Google TTS has character limit, so let's try shorter pauses
  const combinedText = texts.join('. '); // Just period for pause
  const encodedText = encodeURIComponent(combinedText);
  
  // Check if URL is too long (Google TTS limit ~200 chars for text)
  if (encodedText.length > 200) {
    console.log('Combined text too long:', encodedText.length, 'chars. Using shorter version...');
    // Instead of splitting, use shorter pauses and fewer words
    const shorterText = texts.map(text => text.substring(0, 50)).join(', '); // Shorter version
    const shorterEncoded = encodeURIComponent(shorterText);
    
    if (shorterEncoded.length <= 200) {
      return `https://translate.google.com/translate_tts?ie=UTF-8&tl=pl&client=tw-ob&q=${shorterEncoded}${voiceParams}`;
    }
    
    // If still too long, return null to force individual playback
    return null;
  }
  
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=pl&client=tw-ob&q=${encodedText}${voiceParams}`;
};

// Generate the audio config
const audioConfig = generateVoiceUrls();

// Save to file
const configPath = path.join(__dirname, 'assets', 'audio-voices.json');
fs.writeFileSync(configPath, JSON.stringify(audioConfig, null, 2));

console.log('Generated audio-voices.json with voice options');
console.log('Available voices:', Object.keys(audioConfig).map(key => audioConfig[key].name));

// Create test HTML to verify the combined audio works
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Combined Audio</title>
</head>
<body>
    <h1>Test Combined Audio Sessions</h1>
    
    ${Object.keys(audioConfig).map(voiceKey => `
        <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
            <h2>${audioConfig[voiceKey].name}</h2>
            <h3>Combined Session (All affirmations in one file):</h3>
            <audio controls style="width: 100%;">
                <source src="${audioConfig[voiceKey].combinedUrl}" type="audio/mpeg">
            </audio>
            <p><strong>Duration:</strong> ~${affirmations.length * 4 + (affirmations.length - 1) * 3} seconds</p>
            
            <h3>Individual Affirmations:</h3>
            ${audioConfig[voiceKey].affirmations.map((item, index) => `
                <div style="margin: 10px 0;">
                    <p><strong>${index + 1}.</strong> ${item.text}</p>
                    <audio controls>
                        <source src="${item.url}" type="audio/mpeg">
                    </audio>
                </div>
            `).join('')}
        </div>
    `).join('')}
    
    <script>
        console.log('Audio config:', ${JSON.stringify(audioConfig, null, 2)});
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'test-combined-audio.html'), testHtml);
console.log('Created test-combined-audio.html to test both individual and combined audio');
console.log('Open this file in browser to test the audio quality and voice options');