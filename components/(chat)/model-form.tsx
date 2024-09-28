import { useState, createElement } from 'react'
import { Button } from '@/components/ui/button'
import {
  FormProvider,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Textarea from 'react-textarea-autosize'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { IconFlow, IconPlus, IconTrash } from '@/components/ui/icons'
import { providers } from '@/lib/chat/models'
import { formatKey } from '@/lib/utils'

// const modalityVariants = [
//     { value: 'text', icon: <IconLanguage /> },
//     { value: 'vision', icon: <IconVision /> },
//     { value: 'speech', icon: <IconSpeech /> },
//     { value: 'function call', icon: <IconTool /> }
//   ]

const FormSchema = z.object({
  id: z
    .string()
    .min(1, { message: 'Field is required' })
    .refine(val => !/\s/.test(val), { message: 'No blank spaces allowed' })
    .refine(val => !/\//.test(val), { message: 'No slashes allowed' }),
  owner: z
    .string()
    .min(1, { message: 'Field is required' })
    .refine(val => !/\s/.test(val), { message: 'No blank spaces allowed' })
    .refine(val => !/\//.test(val), { message: 'No slashes allowed' }),
  provider: z.enum([...providers.map(provider => provider.id)] as [
    string,
    ...string[]
  ]),
  description: z.string().max(500, { message: 'Field is too long' }).optional(),
  info: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  ),
  apiKey: z.string(),
  apiURL: z.string().optional(),
  headers: z.string().optional()
})

interface ModelFormProps {
  modelId?: string
  setModelKey: (modelKey: { id: string; type: string } | null) => void
}

export default function ModelForm({ modelId, setModelKey }: ModelFormProps) {
  const [isApiUrl, setApiUrl] = useState<boolean>(false)
  const [isApiKey, setApiKey] = useState<boolean>(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: (() => {
      const storedData = localStorage.getItem(modelId || '')
      return storedData
        ? JSON.parse(storedData)
        : {
            id: '',
            owner: '',
            provider: 'openai',
            description: '',
            // modality: ['text'],
            info: [{ key: 'Model Page', value: '' }],
            apiKey: '',
            apiURL: '',
            headers: ''
          }
    })()
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'info'
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const key = `${data.owner}/${data.id}`

    let models: string[] = JSON.parse(localStorage.getItem('models') || '[]')
    if (modelId !== key) {
      if (modelId) localStorage.removeItem(modelId)
      models = models.filter((model: string) => model !== modelId)
      models.push(key)
      localStorage.setItem('models', JSON.stringify(models))
    }

    localStorage.setItem(key, JSON.stringify(data))

    setModelKey({ id: key, type: 'local' })
    return form.reset()
  }

  return (
    <FormProvider {...form}>
      <form
        className="space-y-2"
        onSubmit={form.handleSubmit(onSubmit, () =>
          toast.error('Validation failed')
        )}
      >
        <div className="flex space-x-2">
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem className="flex-1 basis-2/5">
                <FormLabel> Owner </FormLabel>
                <FormControl>
                  <Input
                    placeholder={formatKey(form.getValues('provider'))}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="text-4xl text-muted mt-7"> / </span>
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem className="flex-1 basis-3/5">
                <FormLabel> Identifier </FormLabel>
                <FormControl>
                  <Input placeholder="Model's real name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel> Description </FormLabel>
              <FormControl>
                <Textarea
                  tabIndex={0}
                  placeholder="The most powerful language model ever created. Knows how to cook"
                  className="min-h-[40px] max-h-96 w-full bg-transparent px-2 focus-within:outline-none sm:text-sm "
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormDescription>You can also add details below</FormDescription>
        {/* Info fields */}
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center relative group">
            <FormField
              control={form.control}
              name={`info.${index}.key`}
              render={({ field }) => (
                <FormItem className="w-50">
                  <FormControl>
                    <Input
                      placeholder="Key"
                      className="border-dotted border-2 border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <IconFlow className="size-10 text-muted-foreground/50" />
            <FormField
              control={form.control}
              name={`info.${index}.value`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Value"
                      className="border-dotted border-2 border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              onClick={() => remove(index)}
              variant="ghost"
              size="icon"
              className="absolute right-0 opacity-0 group-hover:opacity-100"
            >
              <IconTrash />
            </Button>
          </div>
        ))}
        {fields.length < 5 && (
          <Button
            type="button"
            onClick={() => append({ key: '', value: '' })}
            variant="secondary"
            className="w-full flex items-center justify-center h-6 border-dashed border-2 border-input rounded-lg cursor-pointer bg-transparent dark:hover:border-white/40 active:bg-gray-100"
          >
            <IconPlus />
          </Button>
        )}
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel> Provider </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center">
                          {createElement(provider.icon, {
                            className: 'mx-2 size-5'
                          })}
                          {formatKey(provider.id)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apiURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel> API URL</FormLabel>
              <FormControl>
                <Input
                  placeholder={`https://api.com/${form.getValues('provider')}/v1`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />{' '}
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel> API key </FormLabel>
              <FormControl>
                <Input placeholder="sk-xxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between mt-4 mx-2">
          <Button
            type="reset"
            variant="secondary"
            onClick={() => form.reset()}
            className="transition-transform transform hover:scale-105"
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="transition-transform transform hover:scale-105"
          >
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
