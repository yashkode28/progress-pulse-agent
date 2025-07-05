
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const name = formData.get("name") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#B19CD9' }}>
      {/* Centered Main Title and Subtitle */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-black mb-6">
          Progress Pulse
        </h1>
        <div className="overflow-hidden">
          <p className="text-2xl text-black animate-[slide-in-right_2s_ease-out]">
            Your AI assistant to track progress, so you don't have to
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-16">
        {/* Full Pulse AI Notifications Image */}
        <div className="flex-shrink-0">
          <img 
            src="/lovable-uploads/863df263-7457-40b9-a624-16ca691f1dbe.png"
            alt="Pulse AI Assistant Notifications"
            className="rounded-lg shadow-lg w-96 h-auto object-cover"
          />
        </div>

        {/* Authentication Form */}
        <div className="max-w-md w-full">
          <Card>
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
                    <CardTitle className="text-black">Welcome back</CardTitle>
                    <CardDescription className="text-black/80">
                      Sign in to your account to continue
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-black">Email</Label>
                      <Input
                        id="signin-email"
                        name="signin-email"
                        type="email"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-black">Password</Label>
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
                    <CardTitle className="text-black">Create account</CardTitle>
                    <CardDescription className="text-black/80">
                      Sign up to start tracking your progress
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-black">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-black">Email</Label>
                      <Input
                        id="signup-email"
                        name="signup-email"
                        type="email"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-black">Password</Label>
                      <Input
                        id="signup-password"
                        name="signup-password"
                        type="password"
                        required
                        placeholder="Create a password"
                        minLength={6}
                      />
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
