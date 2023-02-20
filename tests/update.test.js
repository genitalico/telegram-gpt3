const telegram = require('../telegrambot/update.js');
const updatePayload = require('./updatePayload.json');
const { CONSTANTS } = require('../constants.js');

test('telegramUpdate message is empty', async () => {
    const { telegramUpdate } = telegram;
    const { sample1 } = updatePayload;
    const result = await telegramUpdate(sample1);
    expect(result.errors).toEqual(['message is empty']);
});

test('telegramUpdate chat is empty', async () => {
    const { telegramUpdate } = telegram;
    const { sample2 } = updatePayload;
    const result = await telegramUpdate(sample2);
    expect(result.errors).toEqual(['chat is empty']);
});

test('telegramUpdate /getid command', async () => {
    const { telegramUpdate } = telegram;
    const { sample3, resultTelegram1 } = updatePayload;
    const telegramSendMsg = () => resultTelegram1;
    const result = await telegramUpdate(sample3, telegramSendMsg());
    expect(result.telegram.data.ok).toEqual(true);
});

test('telegramUpdate prompt: quien eres? invalid user', async () => {
    const { telegramUpdate } = telegram;
    const { sample4, resultTelegram1 } = updatePayload;
    const telegramSendMsg = () => resultTelegram1;
    const result = await telegramUpdate(sample4, telegramSendMsg());
    expect(result.errors).toEqual(['user not allowed']);
});

test('telegramUpdate prompt: quien eres?', async () => {
    const { telegramUpdate } = telegram;
    const { sample4, resultTelegram1, resultOpenAI } = updatePayload;
    const telegramSendMsg = () => resultTelegram1;
    const openaiComplete = () => resultOpenAI;
    CONSTANTS.ALLOWED_USERS.push(sample4.message.chat.id.toString());
    const result = await telegramUpdate(
        sample4,
        telegramSendMsg(),
        openaiComplete()
    );
    expect(result.telegram.data.ok).toEqual(true);
});
