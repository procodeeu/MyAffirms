// Simple script to create audio URLs using Google TTS
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

// Generate audio URLs for each affirmation
const audioUrls = affirmations.map((text, index) => {
  const encodedText = encodeURIComponent(text);
  return {
    id: index,
    text: text,
    url: `https://translate.google.com/translate_tts?ie=UTF-8&tl=pl&client=tw-ob&q=${encodedText}`
  };
});

// Create audio config file
const audioConfig = {
  affirmations: audioUrls
};

const configPath = path.join(__dirname, 'assets', 'audio-config.json');
fs.writeFileSync(configPath, JSON.stringify(audioConfig, null, 2));

console.log('Generated audio-config.json with TTS URLs');
console.log('Audio URLs created for', affirmations.length, 'affirmations');

// Also create a test HTML file to verify the URLs work
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Audio URLs</title>
</head>
<body>
    <h1>Test Generated Audio</h1>
    ${audioUrls.map((item, index) => `
        <div>
            <h3>Affirmation ${index + 1}</h3>
            <p>${item.text}</p>
            <audio controls>
                <source src="${item.url}" type="audio/mpeg">
            </audio>
        </div>
    `).join('')}
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'test-audio.html'), testHtml);
console.log('Created test-audio.html to verify audio URLs');