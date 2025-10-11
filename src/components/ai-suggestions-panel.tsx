import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SuggestNewLegaciesOutput } from '@/ai/flows/suggest-new-legacies';
import { GitBranchPlus } from 'lucide-react';

type AiSuggestionsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SuggestNewLegaciesOutput;
  onAddEdge: (source: string, target: string, reason: string) => void;
};

export default function AiSuggestionsPanel({ isOpen, onClose, suggestions, onAddEdge }: AiSuggestionsPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">AI Legacy Suggestions</SheetTitle>
          <SheetDescription>
            The AI has analyzed your narrative and suggests these new connections.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="flex-grow pr-6">
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <Card key={index} className="bg-background">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <GitBranchPlus className="text-primary" />
                        New Legacy
                    </CardTitle>
                    <CardDescription>
                      From <span className="font-semibold text-primary">{suggestion.source}</span> to <span className="font-semibold text-primary">{suggestion.target}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => onAddEdge(suggestion.source, suggestion.target, suggestion.reason)}>
                      Add to Narrative
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">No suggestions available.</p>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
