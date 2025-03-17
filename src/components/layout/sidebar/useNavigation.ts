
import { useNavigate, useLocation } from "react-router-dom";

export interface NavItem {
  name: string;
  href: string;
  icon: string; // Changed from LucideIcon to string
}

export interface NavGroup {
  name: string;
  items: NavItem[];
}

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    console.log("Navigating to:", href);
    // Add a small delay to prevent any potential race conditions
    setTimeout(() => {
      navigate(href);
    }, 10);
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const teacherNavGroups: NavGroup[] = [
    {
      name: "Main",
      items: [
        { name: "Announcements", href: "/dashboard", icon: "Megaphone" },
        { name: "Classes", href: "/classes", icon: "BookOpen" },
      ]
    },
    {
      name: "Teaching",
      items: [
        { name: "Attendance", href: "/attendance", icon: "Calendar" },
      ]
    },
    {
      name: "Rewards",
      items: [
        { name: "Rewards", href: "/rewards", icon: "Award" },
        { name: "NFT Wallet", href: "/wallet", icon: "Wallet" },
      ]
    },
    {
      name: "Communication",
      items: [
        { name: "Messages", href: "/messages", icon: "MessageSquare" },
        { name: "Notifications", href: "/notifications", icon: "Bell" },
      ]
    },
    {
      name: "Analysis",
      items: [
        { name: "Analytics", href: "/analytics", icon: "BarChart" },
        { name: "Settings", href: "/settings", icon: "Settings" },
      ]
    }
  ];

  const studentNavGroups: NavGroup[] = [
    {
      name: "Main",
      items: [
        { name: "Announcements", href: "/dashboard", icon: "Megaphone" },
        { name: "Classes", href: "/classes", icon: "BookOpen" },
      ]
    },
    {
      name: "Learning",
      items: [
        { name: "Progress", href: "/progress", icon: "BarChart" },
      ]
    },
    {
      name: "Rewards",
      items: [
        { name: "My NFTs", href: "/rewards", icon: "Award" },
        { name: "Wallet", href: "/wallet", icon: "Wallet" },
      ]
    },
    {
      name: "Communication",
      items: [
        { name: "Messages", href: "/messages", icon: "MessageSquare" },
        { name: "Notifications", href: "/notifications", icon: "Bell" },
        { name: "Settings", href: "/settings", icon: "Settings" },
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
