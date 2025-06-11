import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import homepageImage from "@/assets/Homepage.png";
import pulseLogo from "@/assets/Pulse_logo.png";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("signup-email") as string;
    const confirmEmail = formData.get("confirm-email") as string;
    const password = formData.get("signup-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;

    if (email !== confirmEmail) {
      toast.error("Emails do not match. Please check your entries.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please check your entries.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: firstName,
            lastName: lastName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Account created successfully! You can now sign in.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row w-full max-w-4xl items-center justify-center gap-12">
        {/* Left side: Header and Image */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <img
            src={pulseLogo}
            alt="Pulse AI Logo"
            className="w-[500px] h-[500px] object-contain mb-4"
          />
          <div className="w-full flex flex-col items-start md:pl-16">
            <h2 className="mt-[-100px] text-5xl font-extrabold text-gray-900 text-left">
              Progress Pulse
            </h2>
            <p className="mt-2 text-lg text-gray-600 w-full flex justify-start relative overflow-hidden">
              <span className="animate-slidein block whitespace-nowrap">
                Your AI assistant to track progress, so you don't have to
              </span>
            </p>
          </div>
          <img
            src={homepageImage}
            alt="Progress Pulse Homepage"
            className="mt-6 w-72 max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        {/* Right side: Sign Up button and Auth Card */}
        <div className="flex-1 flex flex-col items-center w-full max-w-md">
          <Card className="w-full">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="signin-email"
                        type="email"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        name="signin-password"
                        type="password"
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>
                      Sign up to start tracking your progress
                    </CardDescription>
                    {/* First/Last Name side by side */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="space-y-2 w-full">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          name="first-name"
                          type="text"
                          required
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          name="last-name"
                          type="text"
                          required
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    {/* Email/Confirm Email side by side */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="space-y-2 w-full">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          name="signup-email"
                          type="email"
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="space-y-2 w-full">
                        <Label htmlFor="confirm-email">Confirm Email</Label>
                        <Input
                          id="confirm-email"
                          name="confirm-email"
                          type="email"
                          required
                          placeholder="Re-enter your email"
                        />
                      </div>
                    </div>
                    {/* Password/Confirm Password side by side */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="space-y-2 w-full relative">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          name="signup-password"
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Create a password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-8 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="space-y-2 w-full relative">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          name="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          placeholder="Re-enter your password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-8 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
