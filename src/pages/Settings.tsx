import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, type UserSettings } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, User, Bell, Monitor, Shield, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/common/LanguageSelector";

export default function Settings() {
    const { profile, user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Account state
    const [accountData, setAccountData] = useState({
        name: "",
        phone: "",
        avatar_url: ""
    });

    // Avatar Presets (Using Dicebear seeds)
    const avatarSeeds = ["Felix", "Aneka", "Molly", "Garfield", "Tinkerbell", "Bandit", "Shadow", "Coco"];

    // App/Notification state
    const [settings, setSettings] = useState<UserSettings | null>(null);

    useEffect(() => {
        if (profile && user) {
            setAccountData({
                name: profile.name,
                phone: profile.phone || "",
                avatar_url: profile.avatar_url || ""
            });
            fetchSettings();
        }
    }, [profile, user]);

    // ... existing fetchSettings ...

    // Cleanup: Removed unused isMounted declaration.
    // relying on AbortError check below.

    const fetchSettings = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const data = await db.getSettings(user.id);
            setSettings(data);
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error("Failed to fetch settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAccount = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await db.updateProfile(user.id, {
                name: accountData.name,
                phone: accountData.phone,
                avatar_url: accountData.avatar_url // Save selected avatar
            });
            // Force refresh profile context
            await refreshProfile();
            toast.success("Account updated successfully");
        } catch (error) {
            toast.error("Failed to update account");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = async (key: keyof UserSettings, value: boolean) => {
        if (!user || !settings) return;
        try {
            // Optimistic update
            setSettings({ ...settings, [key]: value });
            const updated = await db.updateSettings(user.id, { [key]: value });
            setSettings(updated);
            toast.success("Settings updated");
        } catch (error) {
            toast.error("Failed to update settings");
            fetchSettings(); // Revert on error
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            </div>

            {/* Account Section */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                        <User className="h-5 w-5 text-teal-600" />
                        Account Settings
                    </CardTitle>
                    <CardDescription>Manage your personal information and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Avatar Selection */}
                    <div className="space-y-3">
                        <Label>Choose Avatar</Label>
                        <div className="flex flex-wrap gap-4">
                            {avatarSeeds.map((seed) => {
                                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                                const isSelected = accountData.avatar_url === url || (!accountData.avatar_url && seed === (profile?.name || 'User'));

                                return (
                                    <div
                                        key={seed}
                                        onClick={() => setAccountData({ ...accountData, avatar_url: url })}
                                        className={`relative h-16 w-16 rounded-full cursor-pointer transition-all hover:scale-110 border-2 ${isSelected ? 'border-teal-600 ring-2 ring-teal-100 ring-offset-2' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <img src={url} alt={seed} className="h-full w-full rounded-full" />
                                        {isSelected && (
                                            <div className="absolute bottom-0 right-0 h-5 w-5 bg-teal-600 rounded-full border-2 border-white flex items-center justify-center">
                                                <div className="h-2 w-2 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {/* Keep the user's current name-based avatar as an option if not in list? 
                                 Actually, it's better to stick to presets for simplicity as requested. */}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="s-name">Full Name</Label>
                        <Input
                            id="s-name"
                            value={accountData.name}
                            onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                            className="dark:bg-slate-950 dark:border-slate-800"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="s-phone">Phone Number</Label>
                        <Input
                            id="s-phone"
                            type="tel"
                            value={accountData.phone}
                            onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                            className="dark:bg-slate-950 dark:border-slate-800"
                        />
                    </div>
                    <Button onClick={handleSaveAccount} disabled={saving} className="w-full md:w-auto bg-slate-900 dark:bg-teal-600 dark:hover:bg-teal-700 text-white">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Account Changes
                    </Button>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                        <Bell className="h-5 w-5 text-orange-500" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Configure how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Emergency Alerts</Label>
                            <p className="text-xs text-muted-foreground">Receive critical civil safety warnings</p>
                        </div>
                        <Switch
                            checked={settings?.emergency_alerts || false}
                            onCheckedChange={(val: boolean) => updateSetting("emergency_alerts", val)}
                        />
                    </div>
                    {/* ... other switches fixed similarly to handle potential nulls ... */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Event Updates</Label>
                            <p className="text-xs text-muted-foreground">Stay notified about registered events</p>
                        </div>
                        <Switch
                            checked={settings?.event_updates || false}
                            onCheckedChange={(val: boolean) => updateSetting("event_updates", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Complaint Tracking</Label>
                            <p className="text-xs text-muted-foreground">Get status updates on your reports</p>
                        </div>
                        <Switch
                            checked={settings?.notifications_enabled || false}
                            onCheckedChange={(val: boolean) => updateSetting("notifications_enabled", val)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* App Preferences */}
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-slate-100">
                        <Monitor className="h-5 w-5 text-blue-500" />
                        App Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2 text-base">
                                <Languages className="h-4 w-4 text-blue-600" />
                                Preferred Language (Sarvam AI)
                            </Label>
                            <p className="text-xs text-muted-foreground">Select your regional Indian language or English</p>
                        </div>
                        <LanguageSelector />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2 text-base">
                                <Shield className="h-4 w-4 text-emerald-600" />
                                Location Permissions
                            </Label>
                            <p className="text-xs text-muted-foreground">Required for maps and SOS features</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            Active
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
