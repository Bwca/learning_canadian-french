const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

if (process.argv.length < 3) {
    console.error("Usage: node generateSpeech.js <relative-path-to-txt>");
    process.exit(1);
}

const inputFilePath = path.resolve(process.argv[2]);
const outputFolder = path.dirname(inputFilePath);
const outputFileName = path.basename(inputFilePath, ".txt") + ".webm";
const outputFilePath = path.join(outputFolder, outputFileName);

function removeSlashes(word) {
    return word.replace(/\s*\/\s*/g, ", ");
}

function cleanFrenchWord(word) {
    return removeSlashes(word.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim());
}

async function readFrenchWords(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const words = [];
    for await (const line of rl) {
        const columns = line.split("\t");
        if (columns.length < 3) continue;

        const french = cleanFrenchWord(columns[0].trim());
        const english = removeSlashes(columns[1].trim());
        const match = columns[2].match(/\[sound:(.+\.webm)\]/);

        if (match) {
            words.push({ french, english, fileName: match[1] });
        }
    }
    return words;
}

async function generateSpeechFiles(entries) {
    const browser = await puppeteer.launch({ 
        headless: false,
        args: [
            '--enable-usermedia-screen-capturing',
            '--allow-http-screen-capture',
            '--auto-select-desktop-capture-source=System Audio',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream'
        ]
    });
    const page = await browser.newPage();
    
    // Set permissions using CDP with correct permission names
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('http://localhost', ['microphone']);
    
    await page.goto("about:blank");

    const combinedAudioBuffers = [];

    for (const { french, english, fileName } of entries) {
        const filePath = path.join(outputFolder, fileName);
        console.log(`Processing: ${filePath} (Text: "${french}" → "${english}")`);

        const audioData = await page.evaluate(async (french, english) => {
            return new Promise(async (resolve) => {
                try {
                    // Request system audio capture
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            mandatory: {
                                chromeMediaSource: 'system',
                                chromeMediaSourceId: 'system'
                            }
                        },
                        video: false
                    });

                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'audio/webm;codecs=opus'
                    });
                    const audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = async () => {
                        if (audioChunks.length === 0) {
                            console.warn('No audio chunks recorded');
                            resolve(null);
                            return;
                        }

                        const blob = new Blob(audioChunks, { type: "audio/webm" });
                        const arrayBuffer = await blob.arrayBuffer();
                        resolve([...new Uint8Array(arrayBuffer)]);
                        stream.getTracks().forEach(track => track.stop());
                    };

                    const utterances = [
                        new SpeechSynthesisUtterance(french),
                        new SpeechSynthesisUtterance(english)
                    ];

                    utterances.forEach((utterance, index) => {
                        utterance.lang = index === 0 ? "fr-CA" : "en-US";
                        utterance.volume = 1.0;
                        utterance.rate = 1.0;
                        utterance.pitch = 1.0;
                    });

                    let currentIndex = 0;

                    const speakNext = () => {
                        if (currentIndex < utterances.length) {
                            const utterance = utterances[currentIndex];
                            
                            utterance.onend = () => {
                                currentIndex++;
                                if (currentIndex < utterances.length) {
                                    setTimeout(speakNext, 1000);
                                } else {
                                    setTimeout(() => {
                                        mediaRecorder.stop();
                                    }, 1000);
                                }
                            };

                            utterance.onerror = (event) => {
                                console.error(`Speech synthesis error: ${event.error}`);
                                mediaRecorder.stop();
                            };

                            window.speechSynthesis.speak(utterance);
                        }
                    };

                    mediaRecorder.start();
                    speakNext();
                } catch (error) {
                    console.error('Error setting up audio capture:', error);
                    resolve(null);
                }
            });
        }, french, english);

        if (audioData && audioData.length > 0) {
            const audioBuffer = Buffer.from(audioData);
            fs.writeFileSync(filePath, audioBuffer);
            console.log(`✅ Saved: ${filePath}`);
            combinedAudioBuffers.push(audioBuffer);
        } else {
            console.error(`❌ Error: No audio data recorded for ${fileName}`);
        }
    }

    if (combinedAudioBuffers.length > 0) {
        fs.writeFileSync(outputFilePath, Buffer.concat(combinedAudioBuffers));
        console.log(`✅ Saved concatenated file: ${outputFilePath}`);
    }

    await browser.close();
}

(async () => {
    try {
        const words = await readFrenchWords(inputFilePath);
        if (words.length === 0) {
            console.error("No valid entries found in the file.");
            process.exit(1);
        }
        await generateSpeechFiles(words);
    } catch (error) {
        console.error("Error:", error);
    }
})();
