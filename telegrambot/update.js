const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { CONSTANTS } = require('../constants.js');

const configuration = new Configuration({
    apiKey: CONSTANTS.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

console.log('openIaModel', CONSTANTS.OPENAI_MODEL);

const axiosRequestBot = axios.create({
    baseURL: `https://api.telegram.org/bot${CONSTANTS.TELEGRAM_BOT_TOKEN}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const telegramUpdate = async (body, telegramSendMsgImp, openaiCompleteImp) => {
    const response = {
        openai: {},
        telegram: {},
        errors: [],
    };
    let resultTelegram = {};
    const { message } = body;

    if (!message) {
        response.errors = ['message is empty'];
        return response;
    }

    const { chat, text } = message;

    if (!chat) {
        response.errors = ['chat is empty'];
        return response;
    }

    const { id } = chat;

    switch (text) {
        case '/getid':
            resultTelegram =
                telegramSendMsgImp || (await telegramSendMsg(id, `${id}`));
            const resultTelegramString = JSON.stringify(
                resultTelegram,
                null,
                2
            );
            console.log(resultTelegramString);
            response.telegram = resultTelegram;
            return response;
        default:
            if (!CONSTANTS.ALLOWED_USERS.includes(id.toString())) {
                response.errors = ['user not allowed'];
                return response;
            }
            const prompt = `${id}: ${text}`;
            const user = `${id}`;
            const resultIa =
                openaiCompleteImp || (await openaiComplete(prompt, user));

            if (resultIa.errors) {
                resultTelegram = await telegramSendMsg(id, 'error en openai');
                response.telegram = resultTelegram;
                response.openai = resultIa;
                return response;
            }

            const { data } = resultIa;
            const { choices } = data;

            if (choices.length > 0) {
                const texts = choices.map((choice) => choice.text);
                if (texts.length > 0) {
                    resultTelegram =
                        telegramSendMsgImp ||
                        (await telegramSendMsg(id, texts.join('\n')));
                } else {
                    resultTelegram =
                        telegramSendMsgImp ||
                        (await telegramSendMsg(
                            id,
                            'no hay respuesta de openai'
                        ));
                }
            } else {
                resultTelegram =
                    telegramSendMsgImp ||
                    (await telegramSendMsg(id, 'no hay respuesta de openai'));
            }

            response.openai = resultIa;
            response.telegram = resultTelegram;
            const responseString = JSON.stringify(response, null, 2);
            console.log(responseString);
            return response;
    }
};

const telegramSendMsg = async (chatId, text) => {
    const response = {
        data: {},
        errors: undefined,
    };
    if (text === '') {
        response.errors = ['text is empty'];
        return response;
    }
    const url = '/sendMessage';
    const body = {
        chat_id: chatId,
        text,
    };

    try {
        const resultTelegram = await axiosRequestBot.post(url, body);
        const { data } = resultTelegram;

        response.data = data;

        return response;
    } catch (err) {
        response.errors = [err.message];
        return response;
    }
};

const openaiComplete = async (prompt, user) => {
    const response = {
        data: {},
        errors: undefined,
    };
    const stop = [`${user}:`];
    const options = {
        model: CONSTANTS.OPENAI_MODEL,
        prompt: prompt,
        temperature: 0,
        max_tokens: CONSTANTS.OPENAI_MAX_TOKENS,
        top_p: 1.0,
        frequency_penalty: CONSTANTS.OPENAI_FREQUENCY_PENALTY,
        presence_penalty: CONSTANTS.OPENAI_PRESENCE_PENALTY,
        stop: stop,
        user: user,
    };
    try {
        const result = await openai.createCompletion(options);

        const { data } = result;

        response.data = data;

        return response;
    } catch (err) {
        response.errors = [err.message];
        return response;
    }
};

module.exports = { telegramUpdate, telegramSendMsg };
