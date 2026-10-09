
import { Ticket, Train, Coffee, ShoppingBag, Utensils, Music, Laptop } from 'lucide-react';

export type RewardCategory = 'All' | 'Transport' | 'Food' | 'Events' | 'Essentials';

export interface Reward {
    id: string;
    title: string;
    brand: string;
    description: string;
    points: number;
    category: RewardCategory;
    image: string;
    icon: any;
    available: boolean;
    expiry?: string;
}

export interface Redemption {
    id: string;
    reward_id: string;
    code: string;
    redeemed_at: string;
    image: string;
    title: string;
    brand: string;
    expiry: string;
}

export const REWARDS: Reward[] = [
    {
        id: 'r1',
        title: 'Unlimited Metro Day Pass',
        brand: 'Indore Metro',
        description: 'Travel anywhere in the city for free for one day.',
        points: 500,
        category: 'Transport',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop',
        icon: Train,
        available: true
    },
    {
        id: 'r2',
        title: '20% Off Starbucks',
        brand: 'Starbucks',
        description: 'Get 20% off on any beverage of your choice.',
        points: 150,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop',
        icon: Coffee,
        available: true
    },
    {
        id: 'r3',
        title: 'VIP Concert Ticket',
        brand: 'Sunburn Arena',
        description: 'Exclusive VIP access to the upcoming weekend concert.',
        points: 1200,
        category: 'Events',
        image: 'https://images.unsplash.com/photo-1459749411177-0473ef716175?w=500&auto=format&fit=crop',
        icon: Music,
        available: false // Locked example
    },
    {
        id: 'r4',
        title: 'Grocery Discount Voucher',
        brand: 'BigBasket',
        description: 'Flat ₹200 off on grocery orders above ₹1000.',
        points: 300,
        category: 'Essentials',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
        icon: ShoppingBag,
        available: true
    },
    {
        id: 'r5',
        title: 'Movie Night for Two',
        brand: 'PVR Cinemas',
        description: 'Two tickets to any show + Popcorn combo.',
        points: 800,
        category: 'Events',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop',
        icon: Ticket,
        available: true
    },
    {
        id: 'r6',
        title: 'Free Burger Meal',
        brand: 'Burger King',
        description: 'One Whopper meal free with any purchase.',
        points: 250,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop',
        icon: Utensils,
        available: true
    },
    {
        id: 'r7',
        title: 'Tech Accessories',
        brand: 'Croma',
        description: '15% Discount on headphones and accessories.',
        points: 400,
        category: 'Essentials',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop',
        icon: Laptop,
        available: true
    }
];
