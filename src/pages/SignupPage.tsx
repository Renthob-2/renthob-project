import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, Building2, Users, Eye, EyeOff, Loader2, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { normalizePhone } from "@/lib/phone";

type Role = "tenant" | "landlord" | "agent";

const roles: { value: Role; label: string; icon: React.ElementType; description: string }[] = [
  { value: "tenant", label: "Tenant", icon: Home, description: "Looking for a place to rent" },
  { value: "landlord", label: "Landlord", icon: Building2, description: "List and manage properties" },
  { value: "agent", label: "Agent", icon: Users, description: "Help clients find homes" },
];

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const initialRole = (searchParams.get("role") as Role) || "tenant";

  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const referralCode = searchParams.get("ref") || "";
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: referralCode,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      selectedRole,
      formData.referralCode || undefined
    );

    setIsLoading(false);

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }

    setShowEmailSent(true);
    toast({
      title: "Verification email sent",
      description: "Check your email and click the verification link to activate your account.",
    });
  };

  if (showEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center">
              <img src="/logo.png" alt="Renthob" className="h-12" />
            </Link>
          </div>

          <Card className="shadow-soft border-border/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="font-display text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We sent a verification link to <strong>{formData.email}</strong>. Click the link in the email to verify your account and get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setShowEmailSent(false); }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to signup
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary font-medium hover:underline">
                  Already verified? Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <img src="/logo.png" alt="Renthob" className="h-12" />
          </Link>
        </div>

        <Card className="shadow-soft border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Create Your Account</CardTitle>
            <CardDescription>Join Renthob and start your rental journey</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selectedRole === role.value
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        selectedRole === role.value ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        selectedRole === role.value ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {role.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center mb-6">
              {roles.find((r) => r.value === selectedRole)?.description}
              {selectedRole !== "tenant" && (
                <span className="block mt-1 text-primary/80">
                  Landlord and Agent accounts require admin approval after signup.
                </span>
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
