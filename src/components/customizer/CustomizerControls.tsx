"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WristSizeSelector } from "./WristSizeSelector";
import { BeadEditorPanel } from "./BeadEditorPanel";
import { CharmSelector } from "./CharmSelector";
import { GiftPackagingPanel } from "./GiftPackagingPanel";
import { AIDesignAssistant } from "./AIDesignAssistant";

export function CustomizerControls() {
  return (
    <div className="space-y-4">
      <WristSizeSelector />
      <Tabs defaultValue="beads">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="beads">Beads</TabsTrigger>
          <TabsTrigger value="charm">Charm</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="gift">Gift</TabsTrigger>
        </TabsList>
        <TabsContent value="beads" className="space-y-4 pt-4">
          <BeadEditorPanel />
        </TabsContent>
        <TabsContent value="charm" className="pt-4">
          <CharmSelector />
        </TabsContent>
        <TabsContent value="ai" className="pt-4">
          <AIDesignAssistant />
        </TabsContent>
        <TabsContent value="gift" className="pt-4">
          <GiftPackagingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
