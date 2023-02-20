# Bot Telegram con Chat GPT-3

Implementación sencilla de un bot en telegram conectado a Chat GPT.

[Publicación acerca de este proyecto](https://80bits.blog/index.php/2023/02/19/bot-de-telegram-con-chat-gpt-3/)

### Instalar dependencias

```bash
$ npm install
```

### Ejecutar servicio

```bash
$ node index.js
```

### Ejecutar tests

```bash
$ npm run tests
```

### Ejecutar fix de prettier

```bash
$ npm run prettier.w
```

### Variables de entorno

-   **ALLOWED_USERS**. string separado por comas donde están los id de usuario permitidos en el bot.
-   **OPENAI_MODEL**. nombre del modelo GPT-3 a usar, por defecto davinci.
-   **OPENAI_API_KEY**. api key para poder acceder a los servicios de openAI.
-   **OPENAI_MAX_TOKENS**. numero máximo permitido de tokens al momento de usar las apis, por defecto 60 tokens.
-   **OPENAI_FREQUENCY_PENALTY**. por defecto 0.
-   **OPENAI_PRESENCE_PENALTY**. por defecto 0.
-   **TELEGRAM_BOT_TOKEN**. el api del bot de Telegram para el acceso a los servicios de Telegram.
