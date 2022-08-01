import {encryptedClient} from './clients.js';
import {BufferStream} from '/build/common/streams.mjs';
import { deriveKey, EncryptionStream } from './utils.js';

const videoURL = 'video.enc';
const onplay = async () => {
    let newHandle;
    if (saveToDisk) {
        newHandle = await window.showSaveFilePicker();
    }

    encryptedClient.get(videoURL)
    .then(response => {
        if (!video) return;
        video.onloadedmetadata = () => {
            console.log("Play");
            video.play();
        }

        const mediaSource = new MediaSource();
        video.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', async () => {
            const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            const writable = new BufferStream({
                onChunk: (chunk) => {
                    requestIdleCallback(() => {
                        if (video.error) return;
                        sourceBuffer.appendBuffer(chunk);
                    });

                    console.log("on Chunk");
                },
                onEnd: () => {
                    requestIdleCallback(() => {
                        sourceBuffer.onupdateend = () => {
                            mediaSource.endOfStream();
                        }
                    });
                    
                    console.log("on End");
                }
            });
            
            const body = response.body;
            body.pipeTo(writable);

            if (saveToDisk) {
                const key = await deriveKey('absurdprofit1234');            
                const writableStream = await newHandle.createWritable();
                response.body
                .pipeThrough(new CompressionStream('gzip'))
                .pipeThrough(new EncryptionStream(key))
                .pipeTo(writableStream);
            }
        });
        
    })
}

const video = document.querySelector('video');
const play = document.querySelector('button');
const checkbox = document.querySelector('#checkbox');

if (play) {
    play.onclick = onplay;
}

let saveToDisk = checkbox.checked;
if (checkbox) {
    checkbox.onclick = () => {
        saveToDisk = checkbox.checked;
    }
}

