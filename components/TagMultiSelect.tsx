"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/";
import { Badge } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Tag = { id: string; name: string };

export default function TagMultiSelect({
  selectedTags,
  setSelectedTags,
}: {
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
}) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from("tags").select("*");
      if (data) setAllTags(data);
    };
    fetchTags();
  }, []);

  const handleSelect = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreate = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const { data } = await supabase
      .from("tags")
      .insert({ name: trimmed })
      .select()
      .single();

    if (data) {
      const newTag: Tag = { id: data.id, name: data.name };
      setAllTags([...allTags, newTag]);
      setSelectedTags([...selectedTags, newTag]);
      setNewTagInput("");
    }
  };

  const removeTag = (id: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex gap-1">
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            + Add Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {allTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => handleSelect(tag)}
                >
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="border-t p-2 flex gap-2">
              <input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Create new tag"
                className="text-sm border rounded px-2 py-1 w-full"
              />
              <Button size="sm" onClick={handleCreate}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
