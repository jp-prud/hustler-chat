'use client'

import { MemoizedMarkdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GatewayModelId } from "@vercel/ai-sdk-gateway";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

export default function Page() {
  const [value, setValue] = useState<GatewayModelId>("openai/gpt-4o");
  const [isPending, startTransition] = useTransition();

  const [state, action] = useActionState(
    async (state: any, formData: FormData) => {
      const message = formData.get("message");

      if (!message) {
        return state;
      }

      const result = await handleSearch(message as string) as any;

      return result
    },
    { messages: [] }
  );

  async function handleSearch(query: string) {
    try {
      const tempMessages = [
        ...state.messages,
        {
          role: "user", content: query,
        }
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: tempMessages,
          model: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      return {
        messages: data.messages,
      };
    } catch (error) {
      console.error("Error:", error);
      return state;
    }
  }

  const handleCardClick = (card: string) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append("message", card);

      action(formData);
    });
  }

  return (
    <div className="flex flex-1 flex-col p-4 bg-gray-100 h-dvh">
      <div className="@container/main flex flex-1 flex-col gap-2 bg-white rounded-lg">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
          <div className="flex justify-center items-center h-full">
            <div className="w-full mx-auto max-w-3xl px-4 flex-1">
              <div className="w-full mx-auto mt-10 pb-10 size-full flex flex-col justify-center">
                {state.messages.length === 0 && (
                  <div className={
                    cn(
                      "flex flex-col gap-4 items-center",
                      state.messages.length > 0 && "hidden",
                      isPending && 'opacity-50 cursor-not-allowed pointer-events-none'
                    )
                  }>
                    <h1>What can I help with?</h1>
                    <span className="text-muted-foreground">Choose a task to get started</span>

                    <div className="flex gap-4 w-full">
                      <Card className="w-1/2 cursor-pointer" onClick={() => handleCardClick("Make a blog post about the latest trends in the tech industry.")}>
                        <CardContent className="flex flex-col gap-2">
                          <CardTitle>
                            Make a blog post
                          </CardTitle>

                          <CardDescription>
                            Make a blog post about the latest trends in the tech industry.
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card className="w-1/2 cursor-pointer" onClick={() => handleCardClick("Research a topic and provide a detailed report.")}>
                        <CardContent className="flex flex-col gap-2">
                          <CardTitle>
                            Research a topic
                          </CardTitle>

                          <CardDescription>
                            Research a topic and provide a detailed report.
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {state.messages.length > 0 && (
                  <ScrollArea className="h-[580px] max-h-[580px] w-full pr-4">
                    {state.messages.map(renderMessage)}

                    {isPending && (
                      <div className="text-gray-500 italic">Thinking...</div>
                    )}
                  </ScrollArea>
                )}
              </div>

              <form
                className="border relative w-full flex flex-col gap-4 rounded-2xl overflow-hidden bg-muted"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  startTransition(() => {
                    action(formData);
                  });
                }}
              >
                <textarea
                  className="!border-none !outline-none flex w-full px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 max-h-[160px] overflow-y-hidden resize-none bg-muted"
                  data-testid="multimodal-input"
                  placeholder="Send a message..."
                  name="message"
                  disabled={isPending}
                />

                <div className={
                  cn(
                    "w-full flex justify-between px-4 pb-4",
                    isPending && "opacity-50 cursor-not-allowed pointer-events-none"
                  )
                }>
                  <div className="flex items-center gap-2">
                    <AgentSelector value={value} setValue={setValue} />
                  </div>

                  <Button type="submit" disabled={isPending} className="cursor-pointer">
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderMessage(message: any) {
  if (message.role === "user") {
    return (
      <div className="mb-4" key={`${message.role}-${Math.random()}`}>
        <div className="flex justify-end">
          <span className="flex flex-col gap-4 bg-primary text-primary-foreground px-3 py-2 rounded-xl">
            {message.content}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4" key={`${message.role}-${Math.random()}`}>
      <div className="relative gap-2 pl-10 flex flex-col gap-2">
        <div className="absolute top-0 left-0 size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
          <div className="translate-y-px">
            <svg
              height="14"
              strokeLinejoin="round"
              viewBox="0 0 16 16"
              width="14"
              style={{ color: "currentcolor" }}
            >
              <path
                d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
                fill="currentColor"
              ></path>
              <path
                d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
                fill="currentColor"
              ></path>
              <path
                d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>


        {message.content.map((contentItem: any, idx: number) => (
          <MemoizedMarkdown key={idx} content={contentItem.text} />
        ))}
      </div>
    </div>
  );
}

const frameworks: { value: GatewayModelId; label: string }[] = [
  { value: "openai/gpt-4o", label: "Open AI - GPT-4o" },
  { value: "openai/o3", label: "Open AI - O3" },
  { value: "openai/o3-mini", label: "Open AI - O3 Mini" },
  { value: "anthropic/claude-3.7-sonnet", label: "Claude 3.7 Sonnet" },
  { value: "anthropic/claude-4-sonnet-20250514", label: "Claude 4 Sonnet" },
  { value: "deepseek/deepseek-r1", label: "DeepSeek - R1" },
  { value: "xai/grok-3-beta", label: "Grok 3 Beta" },
  { value: "perplexity/sonar", label: "Perplexity - Sonar" },
  { value: "vertex/claude-3-5-sonnet-20240620", label: "Vertex - Claude 3.5 Sonnet" },
  { value: "vertex/gemini-1.5-pro-002", label: "Vertex - Gemini 1.5 Pro" },
];

type TAgentSelector = {
  value: GatewayModelId;
  setValue: (value: GatewayModelId) => void;
};

function AgentSelector({ value, setValue }: TAgentSelector) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between cursor-pointer"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select framework..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search the model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
