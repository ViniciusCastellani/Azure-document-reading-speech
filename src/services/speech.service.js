const axios = require('axios');

// Endpoint base: process.env.SPEECH_ENDPOINT | Key: process.env.SPEECH_KEY | Region: process.env.SPEECH_REGION

const fast_transcription = async (fileBuffer, fileName, definition) => {
    const url = `${process.env.SPEECH_ENDPOINT}/speechtotext/transcriptions:transcribe`;

    const form = new FormData();
    form.append('audio', new Blob([fileBuffer]), fileName);
    form.append('definition', JSON.stringify(definition));

    const options = {
        method: 'POST',
        url,
        params: {
            'api-version': '2025-10-15'
        },
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.SPEECH_KEY
        },
        data: form
    };

    const { data } = await axios.request(options);

    return data;
}

const text_to_speech = async (ssml, outputFormat) => {
    const url = `https://${process.env.SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const options = {
        method: 'POST',
        url,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.SPEECH_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': outputFormat,
            'User-Agent': 'ai900-proxy-gateway'
        },
        data: ssml,
        responseType: 'arraybuffer'
    };

    const { data } = await axios.request(options);

    return data;
}

module.exports = { fast_transcription, text_to_speech };
