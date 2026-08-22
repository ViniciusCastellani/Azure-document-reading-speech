const axios = require('axios');

const analyze_text = async (textToAnalyze, kind = "SentimentAnalysis", language = 'en', opinionMining = 'True') => {
    const url = `${process.env.LANGUAGE_ENDPOINT}language/:analyze-text?api-version=2022-05-01`;

    const parameters = {
        modelVersion: "latest"
    }

    if (kind === "SentimentAnalysis") {
        parameters.opinionMining = opinionMining === true || opinionMining === 'True';
    }


    const body = {
        kind: kind,
        parameters: parameters,
        analysisInput: {
            documents: [
                {
                    id: "1",
                    language: language,
                    text: textToAnalyze
                }
            ]
        }
    };

    const options = {
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.LANGUAGE_KEY
        },
        data: body
    };


    const { data } = await axios.request(options);

    return data;
}


module.exports = { analyze_text };
