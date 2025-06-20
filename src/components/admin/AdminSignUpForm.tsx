
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";

interface AdminSignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminSignUpForm = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  fullName,
  setFullName,
  loading,
  onSubmit
}: AdminSignUpFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="full-name" className="text-red-300 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Full Name
        </Label>
        <Input
          id="full-name"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 focus:border-red-500 focus:ring-red-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-red-300 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="admin@blockward.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 focus:border-red-500 focus:ring-red-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-red-300 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 pr-10 focus:border-red-500 focus:ring-red-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-red-300 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 pr-10 focus:border-red-500 focus:ring-red-500/20"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium h-11 shadow-lg shadow-red-900/25"
      >
        {loading ? "Creating Account..." : "Create Admin Account"}
      </Button>
    </form>
  );
};
