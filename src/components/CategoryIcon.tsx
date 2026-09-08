import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Zap,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Smile,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  Coins,
  DollarSign
} from 'lucide-react';

interface Props {
  iconName: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<Props> = ({ iconName, className = 'w-5 h-5', size = 20 }) => {
  switch (iconName) {
    case 'Utensils': return <Utensils className={className} size={size} />;
    case 'Car': return <Car className={className} size={size} />;
    case 'Home': return <Home className={className} size={size} />;
    case 'Zap': return <Zap className={className} size={size} />;
    case 'ShoppingBag': return <ShoppingBag className={className} size={size} />;
    case 'Film': return <Film className={className} size={size} />;
    case 'HeartPulse': return <HeartPulse className={className} size={size} />;
    case 'GraduationCap': return <GraduationCap className={className} size={size} />;
    case 'Smile': return <Smile className={className} size={size} />;
    case 'Briefcase': return <Briefcase className={className} size={size} />;
    case 'Laptop': return <Laptop className={className} size={size} />;
    case 'Store': return <Store className={className} size={size} />;
    case 'TrendingUp': return <TrendingUp className={className} size={size} />;
    case 'Gift': return <Gift className={className} size={size} />;
    case 'Coins': return <Coins className={className} size={size} />;
    case 'MoreHorizontal':
    default:
      return <DollarSign className={className} size={size} />;
  }
};
