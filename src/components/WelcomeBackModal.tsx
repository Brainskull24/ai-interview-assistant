import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, RotateCcw, Play } from "lucide-react";

interface WelcomeBackModalProps {
  candidateName: string;
  onResume: () => void;
  onStartNew: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  candidateName,
  onResume,
  onStartNew,
}) => {
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <RotateCcw className="w-5 h-5 mr-2 text-yellow-600" />
            Welcome Back, {candidateName}!
          </DialogTitle>
          <DialogDescription>
            It looks like you have an unfinished interview session. What would
            you like to do?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={onResume}
            className="w-full text-lg h-12 bg-green-600 hover:bg-green-700"
          >
            <Play className="w-5 h-5 mr-2" />
            Resume Session
          </Button>
          <Button
            onClick={onStartNew}
            variant="outline"
            className="w-full text-md h-12 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Zap className="w-4 h-4 mr-2" />
            Start A New Interview (Discard Progress)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBackModal;
