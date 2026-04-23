"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import { Button } from "@/components/crm/ui/button";
import { Textarea } from "@/components/crm/ui/textarea";
import { Badge } from "@/components/crm/ui/badge";
import { Avatar, AvatarFallback } from "@/components/crm/ui/avatar";
import { Send } from "lucide-react";

const TEST_CUSTOMER = {
  name: "Patrick Riley",
  phone: "+13109685158",
  initials: "PR",
  stage: "waitlist",
};

interface Message {
  id: string;
  body: string;
  direction: "outbound";
  status: string;
  timestamp: string;
}

export default function MessagesPage() {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!body.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/crm/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: TEST_CUSTOMER.phone, body: body.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.sid,
          body: body.trim(),
          direction: "outbound",
          status: data.status,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left — Contact list */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {TEST_CUSTOMER.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{TEST_CUSTOMER.name}</p>
              <p className="text-xs text-muted-foreground">{TEST_CUSTOMER.phone}</p>
            </div>
            <Badge variant="outline" className="text-xs">Test</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Right — Thread */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {TEST_CUSTOMER.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-medium">{TEST_CUSTOMER.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{TEST_CUSTOMER.phone}</p>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Send a test SMS below
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[70%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                <p className="text-sm">{msg.body}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp} &middot; {msg.status}
                </p>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Composer */}
        <div className="border-t p-4">
          {error && (
            <p className="text-sm text-destructive mb-2">{error}</p>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Type a message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !body.trim()}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {body.length}/160 characters
          </p>
        </div>
      </Card>
    </div>
  );
}
