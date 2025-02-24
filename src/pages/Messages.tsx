
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";

const Messages = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="p-4">
          <div className="space-y-4">
            <Input placeholder="Search messages..." />
            <div className="space-y-2">
              {/* Placeholder conversations */}
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Mathematics 101
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Science Class
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col h-[600px]">
            <div className="flex-1">
              {/* Placeholder for messages */}
              <div className="text-center text-gray-400 mt-10">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-700">
              <Input placeholder="Type a message..." />
              <Button>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
