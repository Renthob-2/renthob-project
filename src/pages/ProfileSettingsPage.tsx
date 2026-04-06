import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, User, Lock, Phone, Shield } from "lucide-react";
import { NotificationPreferencesCard } from "@/components/settings/NotificationPreferencesCard";
import { AffiliateSignupCard } from "@/components/settings/AffiliateSignupCard";

const roleMeta: Record<string, { label: string; className: string }> = {
  tenant: { label: "Tenant", className: "bg-blue-100 text-blue-700" },
  landlord: { label: "Landlord", className: "bg-green-100 text-green-700" },
  agent: { label: "Agent", className: "bg-purple-100 text-purple-700" },
  admin: { label: "Admin", className: "bg-red-100 text-red-700" },
};

export default function ProfileSettingsPage() {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const checkUsernameAvailability = async (value: string) => {
    if (!value.trim()) { setUsernameError(""); return; }
    if (value === profile?.username) { setUsernameError(""); return; }
    setCheckingUsername(true);
    const { data } = await supabase
      .rpc("is_username_taken", { check_username: value.trim().toLowerCase(), current_user_id: user?.id || "" });
    setCheckingUsername(false);
    if (data) {
      setUsernameError("This username is already taken.");
    } else {
      setUsernameError("");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (usernameError) return;
    setSavingProfile(true);
    try {
      const updateData: Record<string, any> = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        username: username.trim().toLowerCase() || null,
      };
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);
      if (error) {
        if (error.message?.includes("unique") || error.code === "23505") {
          setUsernameError("This username is already taken.");
          throw new Error("Username is already taken.");
        }
        throw error;
      }
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({ title: "Verification sent", description: "Check your new email for a confirmation link." });
      setNewEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const meta = role ? roleMeta[role] : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <BackButton />
      <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account details</p>

      <div className="space-y-6">
        {/* Account Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Type
            </CardTitle>
            <CardDescription>Your role on Renthob</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {meta ? (
                <Badge className={meta.className + " text-sm px-3 py-1"}>
                  {meta.label}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-3 py-1">Unknown</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {role === "tenant" && "You can browse, save, and apply for rental properties."}
                {role === "landlord" && "You can list and manage your rental properties."}
                {role === "agent" && "You can manage listings and connect renters with landlords."}
                {role === "admin" && "You have full platform management access."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your name, username, and phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9._-]/g, "");
                  setUsername(val);
                  setUsernameError("");
                }}
                onBlur={() => checkUsernameAvailability(username)}
                placeholder="e.g. johndoe"
              />
              {checkingUsername && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                </p>
              )}
              {usernameError && (
                <p className="text-xs text-destructive">{usernameError}</p>
              )}
              {username && !usernameError && !checkingUsername && username !== profile?.username && (
                <p className="text-xs text-green-600">Username is available!</p>
              )}
              <p className="text-xs text-muted-foreground">
                Others can find you by your username. Only letters, numbers, dots, hyphens, and underscores.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." />
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile || !!usernameError} className="w-full">
              {savingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Email Address
            </CardTitle>
            <CardDescription>Current: {profile?.email || user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="newemail@example.com" />
            </div>
            <Button onClick={handleChangeEmail} disabled={savingEmail || !newEmail.trim()} className="w-full">
              {savingEmail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Email
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <NotificationPreferencesCard />

        {/* Affiliate Program */}
        <AffiliateSignupCard />

        <Separator />

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword} className="w-full">
              {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
