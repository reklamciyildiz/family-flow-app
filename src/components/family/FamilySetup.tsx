import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, UserPlus } from "lucide-react";

interface FamilySetupProps {
  onComplete: () => void;
  userId: string;
}

export const FamilySetup = ({ onComplete, userId }: FamilySetupProps) => {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInviteCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      toast.error("Please enter a family name");
      return;
    }

    setLoading(true);
    try {
      const code = generateInviteCode();
      
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert({ name: familyName, invite_code: code })
        .select()
        .single();

      if (familyError) throw familyError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ family_id: family.id, role: "parent" })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("Family created successfully!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to create family");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setLoading(true);
    try {
      const { data: family, error: familyError } = await supabase
        .from("families")
        .select()
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (familyError) throw new Error("Invalid invite code");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ family_id: family.id })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("Joined family successfully!");
      onComplete();
    } catch (error: any) {
      toast.error(error.message || "Failed to join family");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "choose") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome! Let's set up your family</CardTitle>
            <CardDescription>
              Create a new family or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full h-20"
              variant="outline"
              onClick={() => setMode("create")}
            >
              <Users className="mr-2 h-5 w-5" />
              Create New Family
            </Button>
            <Button
              className="w-full h-20"
              variant="outline"
              onClick={() => setMode("join")}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Join Existing Family
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Create Your Family</CardTitle>
            <CardDescription>
              Choose a name for your family
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Smiths"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateFamily}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Family"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Join a Family</CardTitle>
          <CardDescription>
            Enter the invite code you received
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMode("choose")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleJoinFamily}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Joining..." : "Join Family"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
