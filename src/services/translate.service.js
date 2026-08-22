const axios = require('axios');

const translate_text = async (textToTranslate, from = "en", to, apiVersion = "3.0") => {
    const url = `${process.env.TRANSLATE_ENDPOINT}/translate`;

    const body = {
        'text': textToTranslate
    }

    const parameters = {
        'api-version': apiVersion,
        'from': from,
        'to': to
    }

    const headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.TRANSLATE_KEY,
        'Ocp-Apim-Subscription-Region': process.env.TRANSLATE_REGION
    }

    const options = {
        method: 'POST',
        url,
        params: parameters,
        headers: headers,
        data: [body]
    };

    const { data } = await axios.request(options);

    return data;
}


module.exports = { translate_text };
