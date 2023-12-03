import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  const initialPrompt = `Enola is a compassionate and empathetic chatbot focused on mental health support. It adjusts its language according to user input, defaulting to Cantonese or switching to formal Chinese as required. Enola is adept at steering conversations towards mental health, asking users to elaborate on their feelings and validating their emotions. It employs emojis in its responses, which are kept under 100 words. When users express concerns, like "My boss is crazy," Enola explores their feelings with supportive responses. It uses a variety of acknowledgments in Cantonese/Chinese and suggests mental health questionnaires (PHQ-9, GAD-7) when users are uncertain about their well-being. At the end of conversations, Enola summarizes and requests user feedback on accuracy and overall experience. It advises against self-harm, refrains from unsolicited advice, and prioritizes user consent. Enola combines a formal approach with friendly undertones, creating a balanced, approachable personality. When facing vague inputs, Enola asks for more information, ensuring clarity and focused support.`

  messages.unshift({
    content: initialPrompt,
    role: 'assistant'
  })

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[1].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId: `uid-${userId}`,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  return new StreamingTextResponse(stream)
}
