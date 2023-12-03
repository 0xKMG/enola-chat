import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Expressing Emotional Challenges',
    message: `I've been feeling really anxious lately about my job. How can I cope with this stress?`
  },
  {
    heading: 'Seeking Behavioral Advice',
    message: `I often find myself procrastinating. What strategies can I use to be more productive?`
  },
  {
    heading: 'Navigating Personal Relationships',
    message: `I had an argument with my friend and I'm not sure how to resolve it. Can you help?`
  },
  {
    heading: '想用廣東話探索自己嘅想法？',
    message: `我最近有啲失落，唔知點樣做好。`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">Welcome to Enola Chat!</h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is an AI chatbot app built by the Enola Team, designed to support
          your mental well-being journey.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
