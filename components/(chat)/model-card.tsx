import { ExternalLink } from '@/components/ui/external-link'
import { Model, findRemoteModel } from '@/lib/chat/models'
import { createElement } from 'react'

interface ModelCardProps {
  modelKey: { id: string; type: string } | null
  variant?: 'large' | 'small'
}

export function ModelCard({ modelKey, variant = 'large' }: ModelCardProps) {
  if (!modelKey) return <div> Hello </div>

  let model: Model =
    modelKey.type === 'local'
      ? JSON.parse(localStorage.getItem(modelKey.id) ?? '{}')
      : findRemoteModel(modelKey.id)

  const regulars: { key: string; value: string }[] = []
  const links: { key: string; value: string }[] = []

  model.info.forEach(item => {
    try {
      new URL(item.value)
      links.push(item)
    } catch {
      regulars.push(item)
    }
  })

  return (
    <div
      className={`mx-auto bg-card text-card-foreground ${variant === 'large' ? 'max-w-2xl' : 'max-w-sm'} border rounded-lg shadow-sm shadow-primary`}
    >
      <div className="px-6 pt-5 rounded-t-lg">
        <h1 className=" flex items-center space-x-1 text-lg font-semibold h-6">
          {model.icon &&
            createElement(model.icon, { className: 'mr-2 size-5' })}
          {model.owner && (
            <span className="text-muted-foreground/70">{model.owner}</span>
          )}
          <span className="text-2xl text-muted-foreground font-thin pr-1">
            /
          </span>
          {model.id}
        </h1>
        <p
          className={`leading-normal mt-4 text-muted-foreground/70 ${variant === 'large' ? 'text-sm' : 'text-xs'}`}
        >
          {model.description}
        </p>
      </div>
      <div className="px-6 py-5 text-xs divide-y">
        {regulars.map((pair, index) => (
          <div
            key={index}
            className={`flex items-start py-2 ${variant === 'large' ? 'text-sm' : ' text-xs'}`}
          >
            <span
              className={`font-medium ${variant === 'large' ? 'min-w-28 mr-16' : 'min-w-24 mr-8 opacity-30'}`}
            >
              {pair.key}
            </span>
            <span className="flex-1 text-muted-foreground">{pair.value}</span>
          </div>
        ))}
      </div>
      <div className="p-3 flex justify-start font-medium border-t rounded-b-lg bg-zinc-50 dark:bg-zinc-900">
        {variant === 'large' &&
          links.map(item => (
            <ExternalLink
              key={item.key}
              className="text-sm text-zinc-300"
              href={item.value}
            >
              {item.key}
            </ExternalLink>
          ))}
      </div>
    </div>
  )
}
