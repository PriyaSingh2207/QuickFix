import { useQuery } from '@tanstack/react-query';
import { CloudLightning, Construction, AlertTriangle, Zap, Info, Newspaper } from 'lucide-react';

// Types
export type AlertType = 'Emergency' | 'Traffic' | 'Weather' | 'Utility' | 'News';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
    id: string;
    type: AlertType;
    title: string;
    desc: string;
    location: string;
    time: string;
    timestamp: number;
    severity: Severity;
    icon: any;
    link?: string;
    imageUrl?: string;
}

// 1. Real Weather API (OpenMeteo)
async function fetchWeatherAlerts(): Promise<Alert[]> {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=22.7196&longitude=75.8577&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto');
        const data = await res.json();

        const current = data.current;
        const code = current.weather_code;
        const alerts: Alert[] = [];
        const now = Date.now();

        if (code >= 95) {
            alerts.push({
                id: `wx-storm-${now}`,
                type: 'Weather',
                title: 'Severe Thunderstorm',
                desc: `Heavy storm detected. Wind: ${current.wind_speed_10m} km/h. Seek shelter.`,
                location: 'Indore',
                time: 'Live',
                timestamp: now,
                severity: 'critical',
                icon: CloudLightning
            });
        } else if (code >= 61 || (current.precipitation > 2)) {
            alerts.push({
                id: `wx-rain-${now}`,
                type: 'Weather',
                title: 'Heavy Rain Alert',
                desc: `Precipitation: ${current.precipitation}mm. Roads may be slippery.`,
                location: 'Indore',
                time: '10m ago',
                timestamp: now - 600000,
                severity: 'medium',
                icon: CloudLightning
            });
        }

        return alerts;
    } catch (e) {
        console.error("Weather Fetch Error", e);
        return [];
    }
}

// 2. Real News API (Google News RSS -> JSON)
async function fetchNewsAlerts(): Promise<Alert[]> {
    try {
        // Query for Indore specific topics: Traffic, Police, Accident, Nagar Nigam, Power
        const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=Indore+when:2d&hl=en-IN&gl=IN&ceid=IN:en');
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await res.json();

        if (data.status !== 'ok') return [];

        return data.items.slice(0, 6).map((item: any) => {
            const title = item.title;
            const now = Date.now();
            const pubDate = new Date(item.pubDate).getTime();

            // Categorize based on keywords
            let type: AlertType = 'News';
            let severity: Severity = 'low';
            let icon = Newspaper;

            const t = title.toLowerCase();
            if (t.includes('accident') || t.includes('crash') || t.includes('fire') || t.includes('dead') || t.includes('injured')) {
                type = 'Emergency';
                severity = 'critical';
                icon = AlertTriangle;
            } else if (t.includes('traffic') || t.includes('jam') || t.includes('road') || t.includes('bridge') || t.includes('route')) {
                type = 'Traffic';
                severity = 'medium';
                icon = Construction;
            } else if (t.includes('power') || t.includes('electric') || t.includes('water') || t.includes('supply') || t.includes('shutdown')) {
                type = 'Utility';
                severity = 'medium';
                icon = Zap;
            } else if (t.includes('rain') || t.includes('storm') || t.includes('weather') || t.includes('flood')) {
                type = 'Weather';
                severity = 'high';
                icon = CloudLightning;
            }

            // Calculate relative time string
            const diff = now - pubDate;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const timeStr = hours === 0 ? 'Just now' : `${hours}h ago`;

            return {
                id: `news-${item.guid || Math.random()}`,
                type,
                title: title,
                desc: item.description?.replace(/<[^>]*>/g, '').slice(0, 80) + '...' || 'Click to read full report.',
                location: 'Indore',
                time: timeStr,
                timestamp: pubDate,
                severity,
                icon,
                link: item.link
            };
        });

    } catch (e) {
        console.error("News Fetch Error", e);
        return [];
    }
}

export function useCityAlerts() {

    const { data: alerts = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['city-alerts'],
        queryFn: async () => {
            const [weather, news] = await Promise.all([
                fetchWeatherAlerts(),
                fetchNewsAlerts()
            ]);

            // Combine and sort by newest
            const combined = [...weather, ...news].sort((a, b) => b.timestamp - a.timestamp);

            // If empty (APIs failed), fall back to one static welcome alert
            if (combined.length === 0) {
                combined.push({
                    id: 'default-1',
                    type: 'News',
                    title: 'Indore City Monitor Active',
                    desc: 'Real-time alerts will appear here as reported by local authorities and news.',
                    location: 'System',
                    time: 'Now',
                    timestamp: Date.now(),
                    severity: 'low',
                    icon: Info
                });
            }
            return combined;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return { alerts, loading, refresh: () => refetch() };
}

