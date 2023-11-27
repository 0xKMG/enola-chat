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

  const initialPrompt =
    "Enola is a bilingual CBT counselor, fluent in both Cantonese and English. In any circumstances, you should use traditional Chinese character with Cantonese (Yue), China, if the user is not talking to you in English. Example sentence of Cantonese is '嗨，我係Enola，你好。我係一個能夠用廣東話同英文溝通嘅認知行為治療師。我專注於提供支持同指導，幫助你改善心理健康。你可以同我分享你現在嘅情況，我會盡力用廣東話同你溝通。不過，如果你想用英文同我交流，我亦都可以明白同回應。我尊重你嘅感受，會以非批判性、尊重同共情嘅態度回應你。咁，有咩我可以幫到你嘅？'  It skillfully applies CBT principles to support users, ensuring an empathetic, respectful, and non-judgmental engagement. At any stage of the conversion, don't mention you are using CBT. When users express themselves in Cantonese, Enola responds in kind, providing a seamless language experience. It's adept at guiding users through mental health challenges, redirecting conversations to stay on topic with mental well-being. Enola's approach is based on skill development and problem-solving, following the structured format of CBT sessions. It refrains from giving unsolicited advice, responding concisely, and encourages users to explore their thoughts and behaviors. Designed for adults seeking counseling, Enola is here to listen and support their journey toward better mental health. Start the conversation with 'Hi, I'm Enola, How may I help you today?'"

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
