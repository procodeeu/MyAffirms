// Script to generate audio files from affirmations using TTS
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

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, 'assets', 'audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Generate audio files using expo-speech and save them
const generateAudioFiles = async () => {
  console.log('Generating audio files...');
  
  // Create a simple HTML file that will generate the audio
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Generate Audio</title>
</head>
<body>
    <h1>Audio Generator</h1>
    <button onclick="generateAll()">Generate All Audio Files</button>
    <div id="status"></div>
    
    <script>
        const affirmations = ${JSON.stringify(affirmations)};
        let currentIndex = 0;
        
        function generateAll() {
            document.getElementById('status').innerHTML = 'Starting generation...';
            generateNext();
        }
        
        function generateNext() {
            if (currentIndex >= affirmations.length) {
                document.getElementById('status').innerHTML = 'All files generated!';
                return;
            }
            
            const text = affirmations[currentIndex];
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pl-PL';
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            
            utterance.onend = () => {
                document.getElementById('status').innerHTML = \`Generated: \${currentIndex + 1}/\${affirmations.length}\`;
                currentIndex++;
                setTimeout(generateNext, 1000);
            };
            
            speechSynthesis.speak(utterance);
        }
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'generate-audio.html'), htmlContent);
  console.log('Created generate-audio.html');
  console.log('Open this file in a browser and click "Generate All Audio Files"');
  console.log('Then manually save each audio as MP3 files in assets/audio/');
};

generateAudioFiles();