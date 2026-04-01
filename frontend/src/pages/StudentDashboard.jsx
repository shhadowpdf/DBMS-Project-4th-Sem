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
import UpdateProfileDialog from "@/components/UpdateProfileDialog";

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
    unapplyJob,
    fetchMyInterviews,
    updateStudentProfile,
  } = usePlacement();
  const navigate = useNavigate();
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

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
    const status = (s || "").toString().toLowerCase();
    switch (status) {
      case "applied":
      case "pending":
        return "secondary";
      case "selected":
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

  const canUnapply = (status) => {
    const normalized = (status || "").toString().toLowerCase();
    return normalized === "applied" || normalized === "pending";
  };

  const statusClassName = (status) => {
    const normalized = (status || "").toString().toLowerCase();
    if (normalized === "applied" || normalized === "pending") return "status-pending";
    if (normalized === "selected" || normalized === "shortlisted") return "status-progress";
    if (normalized === "accepted") return "status-success";
    if (normalized === "rejected") return "status-danger";
    return "";
  };

  const pendingApplications = applications.filter((a) => canUnapply(a.status)).length;
  const interviewCount = interviews.length;

  return (
    <div className="dashboard-shell min-h-screen bg-background">
      <header className="dashboard-header border-b border-white/50 shadow-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold font-heading text-foreground">
            PlaceMe
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileDialogOpen(true)}
              title="Update Profile"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="w-4 h-4" />
              {studentProfile?.name || user?.email}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {studentProfile && (
          <Card className="dashboard-panel shadow-card mb-6 border-white/60">
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

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card className="metric-card metric-purple rounded-2xl">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-slate-600">Applications In Progress</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{pendingApplications}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-indigo-500" />
            </CardContent>
          </Card>
          <Card className="metric-card metric-blue rounded-2xl">
            <CardContent className="flex items-center justify-between py-5">
              <div>
                <p className="text-sm text-slate-600">Upcoming Interviews</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{interviewCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-sky-600" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="dashboard-tabs grid h-auto w-full max-w-lg grid-cols-3 rounded-2xl p-1.5">
            <TabsTrigger value="jobs" className="dashboard-tab-trigger gap-1 rounded-xl py-2.5">
              <Briefcase className="w-4 h-4" /> Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="dashboard-tab-trigger gap-1 rounded-xl py-2.5">
              <ClipboardList className="w-4 h-4" /> My Applications
            </TabsTrigger>
            <TabsTrigger value="interviews" className="dashboard-tab-trigger gap-1 rounded-xl py-2.5">
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
                <Card key={j.id} className="dashboard-panel shadow-card border-white/60">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {j.company_name}
                        </p>
                        <p className="font-medium text-foreground">{j.role}</p>
                        <p className="text-sm text-muted-foreground">
                          CTC: ₹{j.ctc} LPA • Min CGPA: {j.min_cgpa} • Eligible
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
              <Card key={a.id} className="dashboard-panel shadow-card border-white/60">
                <CardContent className="py-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {a.company_name}
                    </p>
                    <p className="font-medium text-foreground">{a.role}</p>
                    <p className="text-sm text-muted-foreground">
                      CTC: ₹{a.ctc} LPA • Min CGPA: {a.min_cgpa}
                    </p>
                    {a.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(a.status)} className={`status-pill capitalize ${statusClassName(a.status)}`}>
                      {a.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!canUnapply(a.status)}
                      onClick={async () => {
                        const result = await unapplyJob(a.job_id);
                        if (result.success) {
                          setAppliedJobIds((prev) => {
                            const next = new Set(prev);
                            next.delete(a.job_id);
                            return next;
                          });
                          toast.success(result.message);
                        } else {
                          toast.error(result.message);
                        }
                      }}
                    >
                      Unapply
                    </Button>
                  </div>
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
              <Card key={i.id} className="dashboard-panel shadow-card border-white/60">
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {/* Company & Position Header */}
                    <div className="border-b border-sky-100 pb-3">
                      <p className="text-lg font-bold text-foreground">{i.company_name}</p>
                      <p className="font-medium text-foreground">{i.role}</p>
                      <p className="mt-1 text-sm text-sky-700">
                        CTC: ₹{i.ctc} LPA
                      </p>
                    </div>

                    {/* Interview Round & Application Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Interview Round</p>
                        <p className="text-lg font-bold text-foreground">{i.interview_round}</p>
                      </div>
                      <Badge
                        variant={statusColor(i.application_status)}
                        className={`status-pill capitalize ${statusClassName(i.application_status)}`}
                      >
                        {i.application_status}
                      </Badge>
                    </div>

                    {/* Date/Time & Meeting Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Date & Time</p>
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
                          <p className="text-sm font-medium text-muted-foreground mb-1">Meeting Link</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 w-full justify-center border-sky-200 bg-white/80 text-sky-700 hover:bg-sky-50"
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

      <UpdateProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        studentProfile={studentProfile}
        onUpdate={updateStudentProfile}
      />
    </div>
  );
};

export default StudentDashboard;
