const axios = require('axios');

// Endpoint base: process.env.VISION_ENDPOINT | Key: process.env.VISION_KEY

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const document_intelligence = async (fileBuffer) => {
    const url = `${process.env.VISION_ENDPOINT}/documentintelligence/documentModels/prebuilt-layout:analyze`;

    const options = {
        method: 'POST',
        url,
        params: {
            features: 'ocr.highResolution,ocr.formula,ocr.font',
            'api-version': '2024-11-30'
        },
        headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': process.env.VISION_KEY
        },
        data: fileBuffer
    };

    const { data, headers, status } = await axios.request(options);

    if(status != 202) {
        return data;
    }

    return document_intelligence_response(headers['operation-location']);
}

const document_intelligence_response = async (url) => {
    const options = {
        method: 'GET',
        url,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.VISION_KEY
        }
    }

    let attempts = 0;

    await delay(10000);

    while (attempts < 10) {
        const { data } = await axios.request(options);

        if (data.status === 'succeeded') {
            return data.analyzeResult.content;
        }

        if (data.status === 'failed') {
            const error = new Error('Falha ao analisar o documento');
            error.status = 502;
            error.details = data;
            throw error;
        }

        await delay(1000);

        attempts++;
    }

    const error = new Error('Tempo limite excedido ao aguardar a análise do documento');
    error.status = 504;
    throw error;
}

module.exports = { document_intelligence };
