import gofetch from '../../build/index.mjs';

const button = document.getElementById('start');

button.onclick = async () => {
    const fileHandle = await window.showSaveFilePicker({
        types: [{
          description: 'Audio file',
          accept: {'audio/mp3': ['.mp3']},
        }],
    });
  
    const audioContext = new AudioContext();
    const response = await gofetch.get('examples/video-to-audio/video.webm');

    const arrayBuffer = await response.arrayBuffer();
    const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const {sampleRate,numberOfChannels} = decodedAudioBuffer;
    const mp3Data = [];

    const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, 128); //mono 44.1khz encode to 128kbps
    const samples = await decodedAudioBuffer.getChannelData(0); //one second of silence replace that with your own samples
    let mp3Tmp = mp3encoder.encodeBuffer(samples); //encode mp3

    //Push encode buffer to mp3Data variable
    mp3Data.push(mp3Tmp);

    // Get end part of mp3
    mp3Tmp = mp3encoder.flush();

    // Write last data to the output data, too
    // mp3Data contains now the complete mp3Data
    mp3Data.push(mp3Tmp);

    const blob = new Blob(mp3Data, {type: 'audio/mp3'});
    
    const url = URL.createObjectURL(blob);
    const audio = document.querySelector('audio');
    audio.src = url;
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    console.log("Finished");
}