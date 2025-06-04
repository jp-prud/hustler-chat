import { gateway } from '@vercel/ai-sdk-gateway';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  const { response } = await generateText({
    model: gateway(model),
    messages,
  });

  console.log(response.messages);

  // Combine as mensagens do usuário com as mensagens do assistente
  const fullMessages = [...messages, ...response.messages];

  return Response.json({ messages: fullMessages });
}
