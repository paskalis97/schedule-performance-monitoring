"use client";

import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WeeklyCutoff } from "@/types/database";

interface Props {
  cutoffs: Pick<WeeklyCutoff, "cutoff_id" | "cutoff_date" | "week_number">[];
  selectedCutoff: string;
}

/** Dropdown that pushes `?cutoff=YYYY-MM-DD` to the URL on change. */
export function CutoffSlicer({ cutoffs, selectedCutoff }: Props) {
  const router = useRouter();

  return (
    <Select
      value={selectedCutoff}
      onValueChange={(value) => router.push(`?cutoff=${value}`)}
    >
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Select cut-off week" />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {cutoffs.map((c) => (
          <SelectItem key={c.cutoff_id} value={c.cutoff_date}>
            W{c.week_number} — {format(parseISO(c.cutoff_date), "dd MMM yyyy")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
