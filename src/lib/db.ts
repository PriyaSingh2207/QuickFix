import { supabase } from './supabase';
import { getAvatarUrl } from './avatars';

// --- Utilities ---
async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000,
    backoff = 2
): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        // Don't retry if the user aborted the request (navigation, etc.)
        if (error.name === 'AbortError') {
            throw error;
        }

        // For Supabase lock errors or network jitters, we retry.
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * backoff, backoff);
    }
}




export interface Profile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    city: string;
    status: string;
    points: number;
    reports_count: number;
    resolved_count: number;
    avatar_url?: string;
    area_id?: string;
    language?: string;
    notification_preferences?: any;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
}

export interface UserSettings {
    user_id: string;
    notifications_enabled: boolean;
    emergency_alerts: boolean;
    event_updates: boolean;
    dark_mode: boolean;
    updated_at: string;
}

export interface CivicEvent {
    id: string;
    image: string;
    title: string;
    organizer: string;
    date: string;
    time: string;
    location: string;
    description: string;
    lat: number;
    lng: number;
    participant_count: number;
    status: 'live' | 'upcoming';
    category: string;
}

export interface ComplaintData {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    lat?: number;
    lng?: number;
    images: string[];
    status: string;
    priority: string;
    created_at: string;
    supports_count?: number;
    reposts_count?: number;
    comments_count?: number;
    user_has_supported?: boolean;
    user_has_reposted?: boolean;
    profiles?: {
        name: string;
        role: string;
    };
}

export const db = {
    // Profiles
    async getOrCreateProfile(user: any, role: string = 'citizen') {
        return withRetry(async () => {
            try {
                // 1. Try to fetch existing profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error) {
                    if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                        console.warn('[db.getOrCreateProfile] Supabase profiles table not found in schema cache. Using fallback profile.');
                        return {
                            id: user.id,
                            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Citizen',
                            email: user.email,
                            role: role,
                            city: user.user_metadata?.city || 'Indore',
                            status: 'active',
                            points: 150,
                            reports_count: 0,
                            resolved_count: 0
                        };
                    }
                    if (!error.message?.includes('AbortError')) {
                        console.error("Profile fetch error:", error);
                    }
                    throw error;
                }

                // 2. If profile exists, return it
                if (data) return data;

                // 3. If not found, create new profile (using upsert to handle race conditions)
                console.log("Creating new profile for user:", user.email);

                const newProfileData = {
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Citizen',
                    email: user.email,
                    phone: user.phone || null,
                    role: role,
                    city: user.user_metadata?.city || 'Indore',
                    status: 'active',
                    points: 0,
                    reports_count: 0,
                    resolved_count: 0
                };

                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .upsert([newProfileData])
                    .select()
                    .single();

                if (insertError) {
                    if (insertError.code === '42P01' || insertError.code === 'PGRST205' || insertError.message?.includes('schema cache') || insertError.message?.includes('Could not find')) {
                        return newProfileData;
                    }
                    if (!insertError.message?.includes('AbortError')) {
                        console.error("Profile creation error:", insertError);
                    }
                    throw insertError;
                }

                return newProfile;
            } catch (err: any) {
                if (err.code === '42P01' || err.code === 'PGRST205' || err.message?.includes('schema cache') || err.message?.includes('Could not find')) {
                    return {
                        id: user.id,
                        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Citizen',
                        email: user.email,
                        role: role,
                        city: 'Indore',
                        status: 'active',
                        points: 150,
                        reports_count: 0,
                        resolved_count: 0
                    };
                }
                throw err;
            }
        });
    },

    async getProfile(userId: string) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                    return {
                        id: userId,
                        name: 'Citizen',
                        email: 'citizen@quickfix.gov',
                        role: 'citizen',
                        city: 'Indore',
                        status: 'active',
                        points: 150,
                        reports_count: 0,
                        resolved_count: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    } as Profile;
                }
                throw error;
            }
            return data as Profile;
        });
    },

    async updateProfile(userId: string, updates: Partial<Profile>) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                    return { id: userId, ...updates } as Profile;
                }
                throw error;
            }
            return data as Profile;
        } catch {
            return { id: userId, ...updates } as Profile;
        }
    },

    // Complaints
    async getComplaints(filter: 'trending' | 'latest' | 'critical' | 'near_me' = 'latest', userLat?: number, userLng?: number) {
        return withRetry(async () => {
            let query = supabase
                .from('complaints')
                .select(`
                *,
                profiles:user_id (name, role),
                complaint_supports!left (user_id),
                complaint_reposts!left (user_id),
                complaint_comments!left (id)
            `)
                .order('created_at', { ascending: false });

            if (filter === 'critical') {
                query = query.in('priority', ['High', 'Critical']);
            }

            const { data, error } = await query;
            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                    return []; // Table doesn't exist yet in Supabase
                }
                throw error;
            }

            const currentUserId = (await supabase.auth.getUser()).data.user?.id;

            let processed = (data || []).map((c: any) => ({
                ...c,
                supports_count: c.complaint_supports?.length || 0,
                reposts_count: c.complaint_reposts?.length || 0,
                comments_count: c.complaint_comments?.length || 0,
                user_has_supported: c.complaint_supports?.some((s: any) => s.user_id === currentUserId),
                user_has_reposted: c.complaint_reposts?.some((r: any) => r.user_id === currentUserId),
                author: {
                    name: c.profiles?.name || 'Anonymous',
                    role: c.profiles?.role || 'Citizen',
                    avatar: getAvatarUrl(c.profiles?.avatar_url, c.profiles?.name || c.user_id)
                }
            }));

            if (filter === 'trending') {
                processed.sort((a, b) => {
                    if (b.reposts_count !== a.reposts_count) return b.reposts_count - a.reposts_count;
                    return b.supports_count - a.supports_count;
                });
            } else if (filter === 'near_me' && userLat && userLng) {
                processed.sort((a, b) => {
                    const distA = getDistance(userLat, userLng, a.lat || 0, a.lng || 0);
                    const distB = getDistance(userLat, userLng, b.lat || 0, b.lng || 0);
                    return distA - distB;
                });
                processed = processed.filter(p => p.lat && p.lng && getDistance(userLat, userLng, p.lat, p.lng) <= 10);
            }

            return processed;
        });
    },

    async uploadImage(file: File, bucket: string = 'complaint-images') {
        try {
            return await withRetry(async () => {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(fileName);

                return data.publicUrl;
            }, 1);
        } catch (err) {
            console.warn('[uploadImage] Supabase Storage upload failed or bucket not initialized, generating local preview:', err);
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(URL.createObjectURL(file));
                reader.readAsDataURL(file);
            });
        }
    },

    async createComplaint(complaint: {
        title: string;
        category: string;
        description: string;
        location: string;
        lat?: number;
        lng?: number;
        images: string[];
        user_id: string;
    }) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('complaints')
                .insert([complaint])
                .select()
                .single();

            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                    console.warn('[createComplaint] Supabase table missing, saving locally.');
                    return { id: crypto.randomUUID(), ...complaint, created_at: new Date().toISOString() };
                }
                throw error;
            }
            return data;
        });
    },




    // Squad Requests
    async createSquadRequest(request: {
        user_id: string;
        experience: string;
        motivation: string;
        skills: string;
    }) {
        const { data, error } = await supabase
            .from('squad_requests')
            .insert([request])
            .select()
            .single();

        if (error) throw error;
        return data;
    },



    // Missing Reports (Production Schema)
    async getMissingReports() {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('missing_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    const { data: legacy } = await supabase.from('missing_items').select('*').order('created_at', { ascending: false });
                    return legacy || [];
                }
                throw error;
            }
            return data;
        });
    },

    async createMissingReport(report: {
        user_id: string;
        person_name: string;
        age: number;
        last_seen_location: string;
        description: string;
        image_url?: string;
        contact_phone: string;
    }) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('missing_reports')
                .insert([report])
                .select()
                .single();

            if (error) {
                if (error.code === '42P01') {
                    // Fallback to missing_items
                    return await supabase.from('missing_items').insert([{
                        user_id: report.user_id,
                        name: report.person_name,
                        category: 'Person',
                        date_lost: new Date().toISOString(),
                        description: report.description,
                        location: report.last_seen_location,
                        contact_name: 'Reporter',
                        contact_phone: report.contact_phone,
                        image_url: report.image_url
                    }]).select().single();
                }
                throw error;
            }
            return data;
        });
    },

    // Announcements
    async getAnnouncements() {
        const { data, error } = await supabase
            .from('announcements')
            .select(`
                *,
                profiles:created_by (name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            // If table missing, return empty array
            if (error.code === '42P01') return [];
            throw error;
        }
        return data.map((a: any) => ({
            ...a,
            author_name: a.profiles?.name || 'Admin'
        }));
    },

    // Activities
    async getRecentActivities(userId: string) {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            if (error.code === '42P01') return [];
            throw error;
        }
        return data;
    },

    // Legacy Missing Items (Keep for compatibility until full migration)
    async getMissingItems() {
        const { data, error } = await supabase
            .from('missing_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01') return []; // If neither table exists
            throw error;
        }
        return data;
    },

    async createMissingItem(item: any) {
        const { data, error } = await supabase
            .from('missing_items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Unified Comments
    async getComments(parentId: string) {
        const { data, error } = await supabase
            .from('u_comments')
            .select(`
                id,
                message,
                created_at,
                profiles:user_id (name)
            `)
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });

        if (error) {
            // Safe fallback if table doesn't exist yet
            if (error.code === '42P01') return [];
            throw error;
        }

        return data.map((c: any) => ({
            id: c.id,
            message: c.message,
            created_at: c.created_at,
            author_name: c.profiles?.name || 'Anonymous'
        }));
    },

    async createComment(comment: {
        user_id: string;
        parent_id: string;
        parent_type: 'complaint' | 'missing_report';
        message: string;
    }) {
        const { data, error } = await supabase
            .from('u_comments')
            .insert([comment])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Volunteer System
    async getVolunteerStatus(userId: string) {
        const { data, error } = await supabase
            .from('volunteer_requests')
            .select('status, created_at')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            return null;
        }
        return data;
    },

    async createVolunteerRequest(request: {
        user_id: string,
        full_name: string,
        phone: string,
        area: string,
        skills: string[],
        availability: string,
        is_emergency_trained: boolean,
        reason: string
    }) {
        const { data, error } = await supabase
            .from('volunteer_requests')
            .insert([request])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Notifications
    async getNotifications(userId: string) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            if (error.code === '42P01') return [];
            throw error;
        }
        return data;
    },

    async markNotificationRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) throw error;
    },

    // User Settings
    async getSettings(userId: string) {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            // Create default settings if not exists
            const { data: newData, error: createError } = await supabase
                .from('user_settings')
                .insert([{ user_id: userId }])
                .select()
                .single();
            if (createError) throw createError;
            return newData as UserSettings;
        }

        return data as UserSettings;
    },

    async updateSettings(userId: string, updates: Partial<UserSettings>) {
        const { data, error } = await supabase
            .from('user_settings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        return data as UserSettings;
    },

    // Events
    async getEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01') return [];
            throw error;
        }
        return data as CivicEvent[];
    },

    async registerForEvent(eventId: string, userId: string) {
        const { error } = await supabase
            .from('event_registrations')
            .insert([{ event_id: eventId, user_id: userId }]);

        if (error) throw error;
        return true;
    },

    async isRegisteredForEvent(eventId: string, userId: string) {
        const { data, error } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) return false;
        return !!data;
    },

    async getUserRegistrations(userId: string) {
        const { data, error } = await supabase
            .from('event_registrations')
            .select('*, events (*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    // Leaderboard
    async getHeroes(limit = 10) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, city, points, reports_count, resolved_count')
                .order('points', { ascending: false })
                .limit(limit);

            if (error) {
                if (error.code === '42P01') return []; // Table doesn't exist
                throw error;
            }

            return data.map((p: any) => ({
                id: p.id,
                name: p.name || 'Citizen',
                avatar_url: getAvatarUrl(p.avatar_url, p.name || p.id),
                city: p.city || 'Indore',
                points: p.points || 0,
                reports_count: p.reports_count || 0,
                resolved_count: p.resolved_count || 0,
                rank_change: 'same' as const
            }));
        });
    },

    async getHeroesSimple(limit = 10) {
        return this.getHeroes(limit); // Already optimized column selection
    },

    async getAnnouncementsSimple() {
        const { data, error } = await supabase
            .from('announcements')
            .select('id, title, message, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42P01') return [];
            throw error;
        }
        return data; // No author join
    },

    async getComplaintsFeed(limit = 20) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('complaints')
                .select(`
                    id, title, category, location, status, priority, created_at,
                    complaint_supports!left (user_id)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                if (error.code === '42P01') return [];
                throw error;
            }

            return data.map((c: any) => ({
                ...c,
                supports_count: c.complaint_supports?.length || 0
            }));
        });
    },

    // Civic Feed Upgrades (Comments & Reposts)
    async getComplaintComments(complaintId: string) {
        const { data, error } = await supabase
            .from('complaint_comments')
            .select(`
                id,
                comment,
                created_at,
                profiles:user_id (name)
            `)
            .eq('complaint_id', complaintId)
            .order('created_at', { ascending: true });

        if (error) {
            if (error.code === '42P01') return [];
            throw error;
        }

        return data.map((c: any) => ({
            id: c.id,
            message: c.comment,
            created_at: c.created_at,
            author_name: c.profiles?.name || 'Anonymous'
        }));
    },

    async createComplaintComment(commentData: {
        user_id: string;
        complaint_id: string;
        comment: string;
    }) {
        const { data, error } = await supabase
            .from('complaint_comments')
            .insert([commentData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getUserComplaints(userId: string) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('complaints')
                .select(`
                    *,
                    profiles:user_id (name, role),
                    complaint_supports!left (user_id),
                    complaint_reposts!left (user_id),
                    complaint_comments!left (id)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const currentUserId = (await supabase.auth.getUser()).data.user?.id;

            return data.map((c: any) => ({
                ...c,
                supports_count: c.complaint_supports?.length || 0,
                reposts_count: c.complaint_reposts?.length || 0,
                comments_count: c.complaint_comments?.length || 0,
                user_has_supported: c.complaint_supports?.some((s: any) => s.user_id === currentUserId),
                user_has_reposted: c.complaint_reposts?.some((r: any) => r.user_id === currentUserId),
                author: {
                    name: c.profiles?.name || 'Anonymous',
                    role: c.profiles?.role || 'Citizen',
                    avatar: getAvatarUrl(c.profiles?.avatar_url, c.profiles?.name || c.user_id)
                }
            }));
        });
    },

    async getUserReposts(userId: string) {
        return withRetry(async () => {
            // 1. Get IDs of reposted complaints
            const { data: reposts, error: repostError } = await supabase
                .from('complaint_reposts')
                .select('complaint_id')
                .eq('user_id', userId);

            if (repostError) throw repostError;
            const ids = reposts.map(r => r.complaint_id);

            if (ids.length === 0) return [];

            // 2. Fetch complaints details
            const { data, error } = await supabase
                .from('complaints')
                .select(`
                    *,
                    profiles:user_id (name, role),
                    complaint_supports!left (user_id),
                    complaint_reposts!left (user_id),
                    complaint_comments!left (id)
                `)
                .in('id', ids)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const currentUserId = (await supabase.auth.getUser()).data.user?.id;

            return data.map((c: any) => ({
                ...c,
                supports_count: c.complaint_supports?.length || 0,
                reposts_count: c.complaint_reposts?.length || 0,
                comments_count: c.complaint_comments?.length || 0,
                user_has_supported: c.complaint_supports?.some((s: any) => s.user_id === currentUserId),
                user_has_reposted: c.complaint_reposts?.some((r: any) => r.user_id === currentUserId),
                author: {
                    name: c.profiles?.name || 'Anonymous',
                    role: c.profiles?.role || 'Citizen',
                    avatar: getAvatarUrl(c.profiles?.avatar_url, c.profiles?.name || c.user_id)
                }
            }));
        });
    },

    async toggleRepost(complaintId: string, userId: string): Promise<boolean> {
        return withRetry(async () => {
            const { data: existing, error: fetchError } = await supabase
                .from('complaint_reposts')
                .select('id')
                .eq('complaint_id', complaintId)
                .eq('user_id', userId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing) {
                // remove repost
                const { error } = await supabase
                    .from('complaint_reposts')
                    .delete()
                    .eq('complaint_id', complaintId)
                    .eq('user_id', userId);
                if (error) throw error;
                return false;
            } else {
                // add repost
                const { error } = await supabase
                    .from('complaint_reposts')
                    .insert([{ complaint_id: complaintId, user_id: userId }]);
                if (error) throw error;
                return true;
            }
        });
    },

    // Actions
    async toggleSupport(complaintId: string, userId: string): Promise<boolean> {
        return withRetry(async () => {
            // check if already supported
            const { data: existing, error: fetchError } = await supabase
                .from('complaint_supports')
                .select('id')
                .eq('complaint_id', complaintId)
                .eq('user_id', userId)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing) {
                // remove support
                const { error } = await supabase
                    .from('complaint_supports')
                    .delete()
                    .eq('complaint_id', complaintId)
                    .eq('user_id', userId);
                if (error) throw error;
                return false; // removed
            } else {
                // add support
                const { error } = await supabase
                    .from('complaint_supports')
                    .insert([{ complaint_id: complaintId, user_id: userId }]);
                if (error) throw error;
                return true; // added
            }
        });
    }
};

// Helper for Haversine Distance (in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}
