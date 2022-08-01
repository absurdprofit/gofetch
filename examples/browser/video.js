import {videoClient}from './clients.js';
import {BufferStream} from '../../build/common/streams.mjs';

const videoURL = 'video.gzip';
const onplay = async () => {
    let newHandle;
    if (saveToDisk) {
        newHandle = await window.showSaveFilePicker();
    }

    const response = await videoClient.get(videoURL);
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
            const writableStream = await newHandle.createWritable();
            response.body
            .pipeThrough(new CompressionStream('gzip'))
            .pipeTo(writableStream);
        }
    });
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

