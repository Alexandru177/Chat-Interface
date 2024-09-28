'use client'
import { useState } from 'react'
import { type AI } from 'lib/chat'
import { useAIState } from 'ai/rsc'
import { constrainValue, formatKey } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import Textarea from 'react-textarea-autosize'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconInfo } from '@/components/ui/icons'

interface NumberParam {
  label: string
  description: string
  range: [number, number]
  default: number
}

function SliderItem({
  label,
  description,
  range,
  default: defaultValue
}: NumberParam) {
  const [aiState] = useAIState<typeof AI>()
  const [value, setValue] = useState(
    aiState.model.options[label] || defaultValue
  )

  const handleChange = (value: number) => {
    const newValue = constrainValue(value, range)
    setValue(newValue)
    aiState.model.options[label] = newValue
  }

  return (
    <div className="space-y-1 mt-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {formatKey(label)}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IconInfo className="mx-1 inline" />
              </TooltipTrigger>
              <TooltipContent>{description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span className="text-sm font-medium">
          <Input
            value={value}
            type="number"
            onChange={e => {
              handleChange(Number(e.target.value))
            }}
            className="p-0 text-right tabular-nums w-16 h-6 text-sm font-medium tracking-tight rounded border-transparent hover:border-muted focus:ring-0 focus:outline-none"
          />
        </span>
      </div>
      <Slider
        value={[value]}
        min={range[0]}
        max={range[1]}
        step={range[1] - range[0] > 10 ? 1 : 0.1}
        onValueChange={value => handleChange(value[0])}
      />
    </div>
  )
}

function PromptItem() {
  const quickPrompts = [
    { label: 'Assistant', value: 'You are a helpful assistant' },
    {
      label: 'Researcher',
      value: `You are an expert at searching the web and answering user's queries with citation with the usage of Markdown. Anything inside the following \`context\` HTML block provided below is for your knowledge returned by the search engine and is not shared by the user. You have to answer question on the basis of it and cite the relevant information from it but you do not have to talk about the context in your response.
      
          <context>
          {context}
          </context>
      
          If you think there's nothing relevant in the search results, you can say that 'Hmm, sorry I could not find any relevant information on this topic. Would you like me to search again or ask something else?'.
          Anything between the \`context\` is retrieved from a search engine and is not a part of the conversation with the user. Today's date is ${new Date().toISOString()}`
    },
    {
      label: 'Philosopher',
      value:
        "You are a tutor that always responds in the Socratic style. You never give the student the answer, but always try to ask just the right question to help them learn to think for themselves. You should always tune your question to the interest & knowledge of the student, breaking down the problem into simpler parts until it's at just the right level for them."
    }
  ]
  const [aiState] = useAIState<typeof AI>()
  const [systemPrompt, setSystemPrompt] = useState<string>(
    aiState.model.prompt || ''
  )

  const handleChange = (value: string) => {
    setSystemPrompt(value)
    aiState.model.prompt = value
  }

  return (
    <div className="space-x-2 space-y-2">
      <h4 className="font-medium leading-none">System prompt</h4>
      <p className="text-sm text-muted-foreground">
        Set the system prompt for this chat. Browse quick prompts.
      </p>
      <Textarea
        tabIndex={0}
        placeholder="System prompt..."
        className="min-h-[60px] max-h-96 w-full bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        autoFocus
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        name="message"
        value={systemPrompt}
        onChange={e => handleChange(e.target.value)}
      />
      {quickPrompts.map(prompt => (
        <Button
          key={prompt.label}
          variant="outline"
          size="sm"
          onClick={() => handleChange(prompt.value)}
        >
          {prompt.label}
        </Button>
      ))}
    </div>
  )
}

const paramsConfig: Record<string, NumberParam[]> = {
  openai: [
    {
      label: 'maxOutputTokens',
      description: 'The maximum number of tokens to generate',
      range: [50, 4096],
      default: 2048
    },
    {
      label: 'temperature',
      description:
        'Controls the randomness of the output. Lower is less random',
      range: [0, 2],
      default: 1
    },
    {
      label: 'topP',
      description:
        'The cumulative probability of the most likely tokens to return',
      range: [0, 1],
      default: 1
    },
    {
      label: 'frequencyPenalty',
      description:
        'How much to penalize new tokens based on their existing frequency in the text so far',
      range: [0, 2],
      default: 2
    },
    {
      label: 'presencePenalty',
      description:
        'How much to penalize new tokens based on their existing presence in the text so far',
      range: [0, 2],
      default: 2
    }
  ]
}

export default function ModelOptions() {
  const [aiState] = useAIState()
  const profile = paramsConfig[aiState.model.provider] || paramsConfig.openai

  return (
    <div className="space-x-2 mr-2">
      <Button
        size="icon"
        onClick={() => alert(JSON.stringify(aiState.model, null, 2))}
      >
        state
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Options</Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px]">
          <PromptItem />
          {profile.map(param => (
            <SliderItem key={param.label} {...param} />
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
