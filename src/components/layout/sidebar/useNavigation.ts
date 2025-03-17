
import { useNavigate, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  name: string;
  items: NavItem[];
}

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const teacherNavGroups: NavGroup[] = [
    {
      name: "Main",
      items: [
        { name: "Announcements", href: "/dashboard", icon: "Megaphone" as any },
        { name: "Classes", href: "/classes", icon: "BookOpen" as any },
      ]
    },
    {
      name: "Teaching",
      items: [
        { name: "Attendance", href: "/attendance", icon: "Calendar" as any },
      ]
    },
    {
      name: "Rewards",
      items: [
        { name: "Rewards", href: "/rewards", icon: "Award" as any },
        { name: "NFT Wallet", href: "/wallet", icon: "Wallet" as any },
      ]
    },
    {
      name: "Communication",
      items: [
        { name: "Messages", href: "/messages", icon: "MessageSquare" as any },
        { name: "Notifications", href: "/notifications", icon: "Bell" as any },
      ]
    },
    {
      name: "Analysis",
      items: [
        { name: "Analytics", href: "/analytics", icon: "BarChart" as any },
        { name: "Settings", href: "/settings", icon: "Settings" as any },
      ]
    }
  ];

  const studentNavGroups: NavGroup[] = [
    {
      name: "Main",
      items: [
        { name: "Announcements", href: "/dashboard", icon: "Megaphone" as any },
        { name: "Classes", href: "/classes", icon: "BookOpen" as any },
      ]
    },
    {
      name: "Learning",
      items: [
        { name: "Progress", href: "/progress", icon: "ChartBar" as any },
      ]
    },
    {
      name: "Rewards",
      items: [
        { name: "My NFTs", href: "/rewards", icon: "Award" as any },
        { name: "Wallet", href: "/wallet", icon: "Wallet" as any },
      ]
    },
    {
      name: "Communication",
      items: [
        { name: "Messages", href: "/messages", icon: "MessageSquare" as any },
        { name: "Notifications", href: "/notifications", icon: "Bell" as any },
        { name: "Settings", href: "/settings", icon: "Settings" as any },
      ]
    }
  ];

  return {
    handleNavigation,
    isActiveRoute,
    teacherNavGroups,
    studentNavGroups
  };
};
