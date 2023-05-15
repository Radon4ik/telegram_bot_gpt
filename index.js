const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
dotenv.config();

const { BOT_TOKEN, API_KEY } = process.env;
const bot = new Telegraf(BOT_TOKEN);

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: API_KEY,
});

let questionContext = null;
let answerContext = null;

// Функция для отправки запроса к API OpenAI
async function generateResponse(question, context) {
  const openai = new OpenAIApi(configuration);

  let prompt = question;
  if (context) {
    prompt = `${context}\n${question}`;
  }

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 3000,
    temperature: 0,
  });

  if (response && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].text.trim();
  } else {
    throw new Error("Failed to generate a response");
  }
}

// Обработчик сообщений бота
bot.on("message", async (ctx) => {
  console.log(ctx);
  const question = ctx.message?.text?.trim();

  if (!question) {
    return ctx.reply("Пожалуйста, введите текст для генерации ответа.");
  }

  try {
    const responseText = await generateResponse(question, answerContext);
    ctx.reply(responseText);
    questionContext = question;
    answerContext = responseText;
  } catch (error) {
    console.error(error);
    ctx.reply("Извините, не удалось сгенерировать ответ.");
  }
});

bot.launch();
