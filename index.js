const http = require('http');
const crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const { CONSTANTS } = require('./constants.js');

const allowedUsers = process.env.ALLOWED_USERS.split(',');
CONSTANTS.ALLOWED_USERS.push(...allowedUsers);
CONSTANTS.OPENAI_MODEL = process.env.OPENAI_MODEL || 'text-curie-001';
CONSTANTS.OPENAI_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS) || 60;
CONSTANTS.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
CONSTANTS.OPENAI_FREQUENCY_PENALTY =
    parseInt(process.env.OPENAI_FREQUENCY_PENALTY) || 0.0;
CONSTANTS.OPENAI_PRESENCE_PENALTY =
    parseInt(process.env.OPENAI_PRESENCE_PENALTY) || 0.0;
CONSTANTS.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const { telegramUpdate } = require('./telegrambot/update.js');

const server = http.createServer(async (req, res) => {
    const { url } = req;
    let { method } = req;
    method = method.toLowerCase();
    let response = {
        message: 'Not Found',
        code: 404,
    };
    const requestId = crypto.randomUUID();

    const log = () => {
        const now = new Date();
        const options = {
            hour12: false,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        const time = now.toLocaleString('en-us', options);
        const log = {
            id: requestId,
            method,
            url,
            time,
        };

        return log;
    };

    switch (method) {
        case 'get':
            res.writeHead(response.code, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify(response));
            break;
        case 'post':
            try {
                const body = [];
                req.on('data', async (chunk) => {
                    body.push(chunk);
                });
                req.on('end', async () => {
                    const response = {
                        telegramIn: {},
                        openAi: {},
                        telegramOut: {},
                        errors: [],
                    };
                    try {
                        const bodyString = Buffer.concat(body).toString();
                        if (bodyString.length > 0 && url === '/update') {
                            const bodyObject = JSON.parse(bodyString);
                            console.log(bodyString);
                            const result = await telegramUpdate(bodyObject);
                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                            });
                            response.telegramIn = bodyObject;
                            response.telegramOut = result.telegram;
                            response.openAi = result.openai;
                            const resultString = JSON.stringify(
                                response,
                                null,
                                2
                            );
                            res.end(resultString);
                        } else {
                            res.writeHead(400, {
                                'Content-Type': 'application/json',
                            });
                            res.end(bodyString);
                        }
                    } catch (err) {
                        res.writeHead(500, {
                            'Content-Type': 'application/json',
                        });
                        res.end();
                    }
                });
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end();
            }
            break;
        default:
            res.writeHead(response.code, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify(response));
            break;
    }

    //global end
    req.on('end', () => {
        console.log('END');
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
