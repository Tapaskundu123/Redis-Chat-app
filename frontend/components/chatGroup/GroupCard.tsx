import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GroupCardProps {
    title: string;
    passcode: string;
    created_at?: string;
}

const GroupCard: React.FC<GroupCardProps> = ({ title, passcode, created_at }) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <Card className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="relative z-10 pb-2">
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    {title}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                    {created_at ? new Date(created_at).toDateString() : "Active Now"}
                </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-0">
                <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border/50 backdrop-blur-md flex items-center justify-between group-hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="font-mono tracking-wider">{passcode}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={() => copyToClipboard(passcode)}
                        title="Copy Passcode"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default GroupCard;
