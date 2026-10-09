import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Award, Edit2, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyComplaintsList } from "@/components/profile/MyComplaintsList";
import { MyRepostsList } from "@/components/profile/MyRepostsList";
import { AVATAR_LIST, getAvatarUrl } from "@/lib/avatars";

export default function ProfilePage() {
    const { profile, refreshProfile, updateProfile, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    // Edit Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: "",
        avatar_url: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone: profile.phone || "",
                city: profile.city || "",
                avatar_url: profile.avatar_url || ""
            });
        }
    }, [profile]);

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                avatar_url: formData.avatar_url
            });
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    if (!profile) return <div className="p-8 text-center">Profile not found. Please log in again.</div>;


    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="w-full md:w-1/3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
                    <CardHeader className="text-center relative z-10 pt-12">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                            <AvatarImage src={getAvatarUrl(profile.avatar_url, profile.name)} />
                            <AvatarFallback>{profile.name[0]}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl">{profile.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 text-slate-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{profile.city || "Indore"}</span>
                        </div>
                        <Badge className="mt-4 mx-auto w-fit px-3 py-1" variant="secondary">{profile.role.toUpperCase()}</Badge>

                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="mt-6 w-full gap-2">
                                    <Edit2 className="h-4 w-4" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[540px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your personal details and choose your character avatar.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    {/* Avatar Picker */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold">Profile Avatar (30 Characters)</Label>
                                            <span className="text-[11px] text-muted-foreground">Select one below</span>
                                        </div>
                                        <div className="grid grid-cols-6 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
                                            {AVATAR_LIST.map((url, idx) => {
                                                const currentSelected = formData.avatar_url || getAvatarUrl(profile.avatar_url, profile.name);
                                                const isSelected = currentSelected === url;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={url}
                                                        onClick={() => setFormData({ ...formData, avatar_url: url })}
                                                        className={`relative aspect-square rounded-xl p-1 cursor-pointer transition-all hover:scale-105 flex items-center justify-center border-2 ${
                                                            isSelected
                                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-400/40'
                                                                : 'border-transparent bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <img src={url} alt={`Avatar ${idx + 1}`} className="h-full w-full object-contain" />
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-blue-600 rounded-full border border-white flex items-center justify-center">
                                                                <Check className="h-2.5 w-2.5 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="city" className="text-right">
                                            City
                                        </Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-right">
                                            Phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="col-span-3"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleSave} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                </Card>

                <div className="flex-1 min-w-0 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold text-indigo-600 mb-1">{profile.reports_count}</div>
                                <p className="text-sm font-medium text-slate-600">Reports Submitted</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">{profile.resolved_count}</div>
                                <p className="text-sm font-medium text-slate-600">Issues Resolved</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
                            <CardContent className="pt-6 text-center flex flex-col items-center">
                                <div className="flex items-center gap-2 text-3xl font-bold text-orange-500 mb-1">
                                    <Award className="h-6 w-6" /> {profile.points}
                                </div>
                                <p className="text-sm font-medium text-slate-600">Impact Points</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">
                                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                                Active citizen contributing to the safety and cleanliness of {profile.city || 'Indore'}.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tabs for Content */}
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
                            <TabsTrigger value="complaints" className="text-xs sm:text-sm">Complaints</TabsTrigger>
                            <TabsTrigger value="reposts" className="text-xs sm:text-sm">Reposts</TabsTrigger>
                            <TabsTrigger value="events" className="text-xs sm:text-sm">Events</TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ActivityFeed userId={profile.id} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="complaints" className="mt-4">
                            <MyComplaintsList userId={profile.id} />
                        </TabsContent>

                        <TabsContent value="reposts" className="mt-4">
                            <MyRepostsList userId={profile.id} />
                        </TabsContent>

                        <TabsContent value="events" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registered Events</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <UserEventsList userId={profile.id} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function UserEventsList({ userId }: { userId: string }) {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const fetchUserEvents = async () => {
            try {
                const data = await db.getUserRegistrations(userId);
                if (isActive) {
                    setRegistrations(data);
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                console.error(err);
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchUserEvents();

        return () => {
            isActive = false;
        };
    }, [userId]);

    if (loading) return <Loader2 className="h-5 w-5 animate-spin mx-auto my-4" />;
    if (registrations.length === 0) return <p className="text-sm text-slate-500 italic py-4">No events registered yet.</p>;

    return (
        <div className="space-y-3">
            {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="h-12 w-12 rounded bg-slate-200 overflow-hidden shrink-0">
                        <img src={reg.events?.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{reg.events?.title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-xs text-slate-500">{reg.events?.date}</span>
                            <span className="text-xs text-slate-500">{reg.events?.time}</span>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200">
                        Registered
                    </Badge>
                </div>
            ))}
        </div>
    );
}
