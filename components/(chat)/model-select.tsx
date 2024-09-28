'use state'

import React from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ModelCard } from '@/components/(chat)/model-card'
import { findRemoteModel, remoteModels } from '@/lib/chat/models'
import {
  IconCheck,
  IconChevronUpDown,
  IconEdit,
  IconGraph,
  IconPlus,
  IconTrash
} from '@/components/ui/icons'

const ModelForm = dynamic(() => import('@/components/(chat)/model-form'), {
  ssr: false
})

interface ModelSelectProps {
  modelKey: { id: string; type: string } | null
  setModelKey: (modelKey: { id: string; type: string } | null) => void
  className?: string
}

export default function ModelSelect({
  modelKey,
  setModelKey,
  className
}: ModelSelectProps) {
  const [cardModel, setCardModel] = React.useState(modelKey!)
  const [isCmdOpen, setCmdOpen] = React.useState(false)
  const [isDialogOpen, setDialogOpen] = React.useState(false)

  React.useEffect(() => {
    setCmdOpen(false)
    setDialogOpen(false)
  }, [modelKey])

  const localModels: string[] = JSON.parse(
    localStorage.getItem('models') ?? '[]'
  )

  const getPlaceholder = () => {
    if (modelKey?.type === 'remote') {
      const remote = findRemoteModel(modelKey.id)
      return (
        <div className="flex items-center">
          {remote?.icon &&
            React.createElement(remote.icon, {
              className: 'mr-2 size-5'
            })}
          {remote?.owner}/{remote?.id}
        </div>
      )
    } else if (modelKey?.type === 'local')
      return (
        <div className="flex items-center">
          <IconGraph className="mr-2 size-5" />
          {localModels.find(item => item === modelKey.id)}
        </div>
      )
    else return 'Select Models...'
  }

  return (
    <Popover open={isCmdOpen} onOpenChange={setCmdOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('w-[200px] justify-between', className)}
        >
          {getPlaceholder()}
          <IconChevronUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-[200px] p-0', className)}>
        <Command>
          <CommandInput placeholder="Search Models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Suggestions">
              {remoteModels.map(item => (
                <CommandItem
                  key={`${item.owner}/${item.id}`}
                  className="font-mono mx-2"
                  onMouseEnter={() =>
                    setCardModel({
                      id: `${item.owner}/${item.id}`,
                      type: 'remote'
                    })
                  }
                  onSelect={value => {
                    console.log(value)
                    setModelKey({
                      id: `${item.owner}/${item.id}`,
                      type: 'remote'
                    })
                  }}
                >
                  {item.icon &&
                    React.createElement(item.icon, {
                      className: 'mr-2 size-5'
                    })}
                  {item.id}
                  <IconCheck
                    className={cn(
                      'ml-auto h-4 w-4',
                      modelKey &&
                        modelKey.type === 'remote' &&
                        modelKey.id === item.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Your models">
              <CommandItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full flex items-center justify-center font-semibold h-6 border-dashed border-2 border-input rounded-lg cursor-pointer bg-transparent dark:hover:border-primary/40 active:bg-gray-100 "
                    >
                      Add model
                      <IconPlus className="ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-scroll">
                    <DialogHeader>
                      <DialogTitle>
                        Add your own model and provider!
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      Fill in the fields below to connect a model. It all stays
                      local!
                    </DialogDescription>
                    <ModelForm setModelKey={setModelKey} />
                  </DialogContent>
                </Dialog>
              </CommandItem>

              {localModels.map(item => (
                <CommandItem
                  key={`l-${item}`}
                  className="font-mono mx-2"
                  onMouseEnter={() => setCardModel({ id: item, type: 'local' })}
                  onSelect={() => setModelKey({ id: item, type: 'local' })}
                >
                  <span className="size-5">⚬</span> {item.split('/')[1]}
                  <IconCheck
                    className={cn(
                      'ml-auto h-4 w-4',
                      modelKey &&
                        modelKey.type === 'local' &&
                        modelKey.id === item
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="absolute top-0 left-[100%] w-full">
          <ModelCard modelKey={cardModel} variant="small" />
          {cardModel?.type === 'local' && (
            <div className="absolute top-0 right-3 flex space-x-2 p-2">
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <IconEdit />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-scroll">
                  <DialogHeader>
                    <DialogTitle>
                      Configure your own model and provider!
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Fill in the fields below to connect a model. It all stays
                    local!
                  </DialogDescription>
                  {isDialogOpen && (
                    <ModelForm
                      modelId={cardModel.id}
                      setModelKey={setModelKey}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setModelKey(null)
                  localStorage.removeItem(cardModel.id)

                  let models: string[] = JSON.parse(
                    localStorage.getItem('models') || '[]'
                  )
                  models = models.filter(model => model !== cardModel.id)
                  localStorage.setItem('models', JSON.stringify(models))
                }}
              >
                <IconTrash />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
