

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { ChecklistAnimation } from "@/components/ChecklistAnimation";

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
    <div className="min-h-screen" style={{ backgroundColor: '#B19CD9' }}>
      {/* Header */}
      <header className="border-b bg-white/10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-black hover:text-black/70 transition-colors">
            Progress Pulse
          </Link>
          <Link to="/" className="text-black hover:text-black/70 transition-colors">
            <Button variant="outline" size="sm" className="border-black/20 text-black hover:bg-black/10">
              Your Tasks
            </Button>
          </Link>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        {/* Centered Main Title and Subtitle */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-black mb-6">
          Progress Pulse
        </h1>
        <div className="overflow-hidden">
          <p className="text-2xl text-black animate-[slide-in-left_2s_ease-out]">
            Your AI assistant to track progress, so you don't have to
          </p>
        </div>
      </div>

      {/* Images Section */}
      <div className="max-w-7xl mx-auto flex items-end justify-center gap-12 mb-8">
        {/* Left Image - Pulse AI Notifications */}
        <div className="flex-shrink-0 -translate-x-8">
          <img 
            src="/lovable-uploads/863df263-7457-40b9-a624-16ca691f1dbe.png"
            alt="Pulse AI Assistant Notifications"
            className="rounded-lg shadow-lg w-80 h-auto object-cover"
          />
        </div>

        {/* Middle Image - Athlete/Hiker */}
        <div className="flex-shrink-0">
          <img 
            src="/lovable-uploads/7bcebda3-6793-4d6a-9e98-73ba99fcf0a8.png"
            alt="Person hiking with gear"
            className="rounded-lg shadow-lg h-80 w-auto object-cover"
          />
        </div>

        {/* Right Image - Woman with Dog */}
        <div className="flex-shrink-0 translate-x-8">
          <img 
            src="/lovable-uploads/075ae1f4-9120-4fcc-b661-ae7e62ef3fc3.png"
            alt="Woman receiving notifications while walking dog"
            className="rounded-lg shadow-lg w-80 h-auto object-cover"
          />
        </div>
      </div>

      {/* Text Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold text-black leading-relaxed">
          How does it work? Simple. Give me your tasks to complete, how long each task will take, and their deadlines. I'll create a plan for completing each task with scheduled reminders, so you don't burn out or feel like you forgot to do something!
        </h2>
      </div>

      {/* Authentication Section with Checklist */}
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-12">
        {/* Animated Checklist */}
        <div className="flex-shrink-0">
          <ChecklistAnimation />
        </div>

        {/* Authentication Form */}
        <div className="w-96">
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
    </div>
  );
}

