import { BarChart3 } from "lucide-react";
import { Button, Label, RadioGroup, RadioGroupItem } from "../ui";
interface ComparisonHeaderProps {
  itemCount: "2" | "3" | "4";
  setItemCount: (value: "2" | "3" | "4") => void;
  showSummary: boolean;
  setShowSummary: (value: boolean) => void;
}

export function ComparisonHeader({
  itemCount,
  setItemCount,
  showSummary,
  setShowSummary,
}: ComparisonHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Product Comparison</h1>
        <p className="text-muted-foreground">
          Compare features and specifications side by side
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <RadioGroup
          value={itemCount}
          onValueChange={(value) => setItemCount(value as "2" | "3" | "4")}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="r2" />
            <Label htmlFor="r2">2 Items</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="r3" />
            <Label htmlFor="r3">3 Items</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="r4" />
            <Label htmlFor="r4">4 Items</Label>
          </div>
        </RadioGroup>

        <Button
          variant={showSummary ? "default" : "outline"}
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {showSummary ? "Hide Summary" : "Show Summary"}
        </Button>
      </div>
    </div>
  );
}
