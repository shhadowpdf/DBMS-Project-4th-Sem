import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, ClipboardList, Calendar, LogOut, User, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const {
    jobs,
    applications,
    interviews,
    studentProfile,
    loading,
    fetchJobs,
    fetchStudentProfile,
    fetchMyApplications,
    applyToJob,
    fetchMyInterviews,
  } = usePlacement();
  const navigate = useNavigate();
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    // Load data on mount
    const loadData = async () => {
      await fetchJobs();
      await fetchStudentProfile();
      const apps = await fetchMyApplications();
      if (apps?.length > 0) {
        setAppliedJobIds(new Set(apps.map((a) => a.job_id)));
      }
      await fetchMyInterviews();
    };
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleApply = async (jobId) => {
    const result = await applyToJob(jobId);
    if (result.success) {
      setAppliedJobIds(new Set([...appliedJobIds, jobId]));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case "pending":
        return "secondary";
      case "shortlisted":
        return "default";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold font-heading text-foreground">
            PlaceMe
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {studentProfile?.name || user?.email}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {studentProfile && (
          <Card className="shadow-card mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm flex-1">
                  {studentProfile.roll_no && (
                    <span>
                      <strong className="text-foreground">Roll:</strong>{" "}
                      <span className="text-muted-foreground">
                        {studentProfile.roll_no}
                      </span>
                    </span>
                  )}
                  {studentProfile.branch && (
                    <span>
                      <strong className="text-foreground">Branch:</strong>{" "}
                      <span className="text-muted-foreground">
                        {studentProfile.branch}
                      </span>
                    </span>
                  )}
                  {studentProfile.cgpa && (
                    <span>
                      <strong className="text-foreground">CGPA:</strong>{" "}
                      <span className="text-muted-foreground">
                        {studentProfile.cgpa}
                      </span>
                    </span>
                  )}
                  {studentProfile.skills && (
                    <span>
                      <strong className="text-foreground">Skills:</strong>{" "}
                      <span className="text-muted-foreground">
                        {studentProfile.skills}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="jobs" className="gap-1">
              <Briefcase className="w-4 h-4" /> Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-1">
              <ClipboardList className="w-4 h-4" /> My Applications
            </TabsTrigger>
            <TabsTrigger value="interviews" className="gap-1">
              <Calendar className="w-4 h-4" /> Interviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-3">
            
            {loading && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Loading jobs...
              </p>
            )}
            {!loading && jobs.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                No jobs posted yet.
              </p>
            )}
            {jobs.map((j) => {
              const applied = appliedJobIds.has(j.id);
              return (
                <Card key={j.id} className="shadow-card">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {j.company_name}
                        </p>
                        <p className="font-medium text-foreground">{j.role}</p>
                        <p className="text-sm text-muted-foreground">
                          CTC: ₹{j.ctc} • Min CGPA: {j.min_cgpa} • Eligible
                          Branches: {j.eligible_branches}
                        </p>
                        {j.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {j.description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        disabled={applied}
                        onClick={() => handleApply(j.id)}
                        className={
                          applied
                            ? ""
                            : "gradient-primary text-primary-foreground"
                        }
                        variant={applied ? "secondary" : "default"}
                      >
                        {applied ? (
                          "Applied"
                        ) : (
                          <>
                            <Send className="w-3 h-3 mr-1" /> Apply
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="applications" className="space-y-3">
            {loading && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Loading applications...
              </p>
            )}
            {!loading && applications.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                You haven't applied to any jobs yet.
              </p>
            )}
            {applications.map((a) => (
              <Card key={a.id} className="shadow-card">
                <CardContent className="py-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {a.company_name}
                    </p>
                    <p className="font-medium text-foreground">{a.role}</p>
                    <p className="text-sm text-muted-foreground">
                      CTC: ₹{a.ctc} • Min CGPA: {a.min_cgpa}
                    </p>
                    {a.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusColor(a.status)} className="capitalize">
                    {a.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="interviews" className="space-y-3">
            {loading && (
              <p className="text-muted-foreground text-sm text-center py-8">
                Loading interviews...
              </p>
            )}
            {!loading && interviews.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">
                No interviews scheduled yet.
              </p>
            )}
            {interviews.map((i) => (
              <Card key={i.id} className="shadow-card">
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {/* Company & Position Header */}
                    <div className="border-b border-border pb-3">
                      <p className="text-lg font-bold text-foreground">{i.company_name}</p>
                      <p className="font-medium text-foreground">{i.role}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        💰 CTC: ₹{i.ctc} LPA
                      </p>
                    </div>

                    {/* Interview Round & Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Interview Round</p>
                        <p className="text-lg font-bold text-foreground">{i.interview_round}</p>
                      </div>
                      <Badge variant="default" className="capitalize">
                        Scheduled
                      </Badge>
                    </div>

                    {/* Date/Time & Meeting Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">📅 Date & Time</p>
                        <p className="font-medium text-foreground">
                          {new Date(i.interview_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{i.interview_time}</p>
                      </div>

                      {i.interview_link && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">🔗 Meeting Link</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 w-full justify-center"
                            onClick={() => window.open(i.interview_link, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Join Interview
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
