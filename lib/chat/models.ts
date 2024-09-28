import { createOpenAI, openai } from '@ai-sdk/openai'
import { LanguageModel } from 'ai'
import { AIState } from '.'
import {
  IconAntrophic,
  IconMeta,
  IconMistral,
  IconOpenAI
} from '@/components/ui/icons'

export interface Model {
  id: string
  description: string
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  owner: string
  provider: any
  info: { key: string; value: string }[]
}

export const remoteModels: Model[] = [
  {
    id: 'gpt-3',
    description: 'The most powerful language model ever created.',
    owner: 'OpenAI',
    icon: IconOpenAI,
    provider: createOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    }),
    info: [
      { key: 'Parameters', value: '175B' },
      { key: 'Papers', value: 'https://arxiv.org/abs/2005.14165' },
      { key: 'Documentation', value: 'https://beta.openai.com/docs/' }
    ]
  },
  {
    id: 'llama3-8b-8192',
    description:
      'Llama is a 70 billion parameter open source model by Meta fine-tuned for instruction following purposes served by Groq on their LPU hardware.',
    owner: 'Meta',
    icon: IconAntrophic,
    provider: createOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    }),
    info: [
      { key: 'Parameters', value: '175B' },
      { key: 'Papers', value: 'https://arxiv.org/abs/2005.14165' },
      { key: 'Documentation', value: 'https://beta.openai.com/docs/' }
    ]
  }
]

export const findRemoteModel = (id: string) =>
  remoteModels.find((i: Model) => id === `${i.owner}/${i.id}`)

export const providers = [
  { id: 'openai', icon: IconOpenAI },
  { id: 'groq', icon: IconMistral }
] as const

//Todo: Can add auth-validation
export const getModel = (model: AIState['model']): LanguageModel => {
  const modelID = model.id.split('/')[1]

  switch (model.provider) {
    case '':
      const remote = findRemoteModel(model.id)
      if (!remote) throw new Error(`Model not found: ${model.id}`)
      return remote.provider(modelID)
    case 'openai':
      return createOpenAI({
        apiKey: model.apiKey,
        baseURL: model.apiURL
      })(modelID)
    case 'groq':
      return createOpenAI({
        apiKey: model.apiKey,
        baseURL: model.apiURL || 'https://api.groq.com/openai/v1'
      })(modelID)
    default:
      throw new Error(`Unknown provider: ${model.provider}`)
  }
}
