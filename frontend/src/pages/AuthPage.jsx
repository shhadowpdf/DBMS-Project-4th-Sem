import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [profile, setProfile] = useState({
    roll_no: "",
    name: "",
    cgpa: "",
    branch: "",
    skills: "",
    resume_url: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // 🔐 LOGIN
        const result = await login(email, password);

        if (result.success) {
          toast.success("Logged in successfully!");
          navigate(result.role === "admin" ? "/admin" : "/student");
        } else {
          toast.error(result.message);
        }
      } else {
        // 📝 REGISTER

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        if (role === "student" && (!profile.roll_no || !profile.name || !profile.branch || !profile.cgpa)) {
          toast.error("All student fields are required");
          return;
        }

        const result = await register(email, password, role, profile);

        if (result.success) {
          toast.success("Registered! Please login.");
          setIsLogin(true);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setProfile({
            roll_no: "",
            name: "",
            cgpa: "",
            branch: "",
            skills: "",
            resume_url: "",
          });
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-4">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            PlaceMe
          </h1>
          <p className="text-muted-foreground mt-1">
            Placement Management System
          </p>
        </div>

        <Card className="shadow-elevated border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading">
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Login to your account" : "Register a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              }

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
              )}

              {!isLogin && role === "student" && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground pt-2">
                    Student Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Roll No *</Label>
                      <Input
                        value={profile.roll_no}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, roll_no: e.target.value }))
                        }
                        required
                        placeholder="21CS001"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Name *</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, name: e.target.value }))
                        }
                        required
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">CGPA</Label>
                      <Input
                        value={profile.cgpa}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, cgpa: e.target.value }))
                        }
                        placeholder="8.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Branch *</Label>
                      <Input
                        value={profile.branch}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, branch: e.target.value }))
                        }
                        required
                        placeholder="CSE"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Skills</Label>
                    <Input
                      value={profile.skills}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, skills: e.target.value }))
                      }
                      placeholder="React, Node.js, Python"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Resume URL</Label>
                    <Input
                      value={profile.resume_url}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          resume_url: e.target.value,
                        }))
                      }
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>Loading...</>
                ) : isLogin ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
