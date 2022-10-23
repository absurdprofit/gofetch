import {videoClient}from '../common/clients.js';
import {BufferStream, ProgressStream} from '../../../build/common/streams.mjs';

/****************
 * Example of a GZIP encoded webm video
 * streamed, decoded and played using the MediaSource API.
 * **************
 */

const videoURL = './videos/video.gzip';
const onplay = async () => {
    let newHandle;
    if (saveToDisk) {
        newHandle = await window.showSaveFilePicker();
    }

    const response = await videoClient.get(videoURL);
    if (!video) return;
    // when enough chunks have been decoded and queued
    video.onloadedmetadata = () => {
        console.log("Play");
        video.play();
    }

    const mediaSource = new MediaSource();
    video.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', async () => {
        // create video buffer
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
        const wait = () => new Promise((resolve) => sourceBuffer.onupdateend = resolve);
        const writable = new BufferStream({
            onChunk: async (chunk) => {
                if (video.error) return;
                sourceBuffer.appendBuffer(chunk);
                await wait();

                console.log("on Chunk");
            },
            onEnd: () => {
                sourceBuffer.addEventListener('updateend', mediaSource.endOfStream);
                
                console.log("on End");
            }
        });
        
        const body = response.body;
        body
        .pipeThrough(new ProgressStream({
            onProgress: onProgress,
            contentLength: response.headers['content-length']
        }))   
        .pipeTo(writable);

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
const progressBar = document.querySelector('progress');

const onProgress = (progress) => {
    if (progressBar) {
        progressBar.value = progress * 100;
    }
}

if (play) {
    play.onclick = onplay;
}

let saveToDisk = checkbox.checked;
if (checkbox) {
    checkbox.onclick = () => {
        saveToDisk = checkbox.checked;
    }
}

