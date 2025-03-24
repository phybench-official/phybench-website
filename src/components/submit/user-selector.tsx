"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fetchAllUsers } from "@/lib/actions"

export function UserSelector(
  {
    offererEmail,
    setOffererEmail
  }:{
    offererEmail: string;
    setOffererEmail: (v: string) => void;
  }
) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<{ label: string; value: string }[]>([])

  const labelToValue = (label: string) => {
    return users.find((user) => user.label === label)?.value || ""
  }

  useEffect(() => {
    fetchAllUsers().then(setUsers)
  }
  , [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {offererEmail
            ? users.find((user) => user.value === offererEmail)?.label
            : "选择用户"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command filter={
          (user, query) => {
            if (user.toLowerCase().includes(query.toLowerCase())) return 1;
            return 0;
          }
        }>
          <CommandInput placeholder="Search for User..." />
          <CommandList>
            <CommandEmpty>无匹配.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.value}
                  value={user.label}
                  onSelect={(currentValue) => {
                    setOffererEmail(labelToValue(currentValue) === offererEmail ? "" : labelToValue(currentValue))
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      offererEmail === user.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
