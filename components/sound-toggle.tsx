import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/contexts/sound-context";

export function SoundToggle() {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSound}
      title={
        isSoundEnabled
          ? "Disable sound notifications"
          : "Enable sound notifications"
      }
      className="relative"
    >
      {isSoundEnabled ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4 text-red-500" />
      )}
      <span className="sr-only">
        {isSoundEnabled ? "Disable" : "Enable"} sound notifications
      </span>
    </Button>
  );
}
