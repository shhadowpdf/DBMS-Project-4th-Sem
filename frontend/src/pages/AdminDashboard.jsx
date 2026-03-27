import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Briefcase, Calendar, LogOut, Plus, X } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const {
    jobs,
    applications,
    interviews,
    loading,
    fetchJobs,
    fetchApplicants,
    createCompany,
    fetchCompanies,
    createJob,
    updateApplicationStatus,
    scheduleInterview,
    fetchAdminInterviews,
  } = usePlacement();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [companyForm, setCompanyForm] = useState({ name: "", description: "" });
  const [jobForm, setJobForm] = useState({
    company_id: "",
    role: "",
    ctc: "",
    min_cgpa: "",
    description: "",
    eligible_branches: "",
  });
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isInterviewFormOpen, setIsInterviewFormOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    application_id: null,
    interview_round: "",
    interview_date: "",
    interview_time: "",
    interview_link: "",
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchJobs();
      setCompanies((await fetchCompanies()) || []);
      await fetchAdminInterviews();
    };
    loadData();
  }, []);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name) {
      toast.error("Company name is required");
      return;
    }
    const result = await createCompany(companyForm);
    if (result.success) {
      toast.success(result.message);
      setCompanyForm({ name: "", description: "" });
    } else {
      toast.error(result.message);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!jobForm.company_id || !jobForm.role || !jobForm.ctc || !jobForm.min_cgpa) {
      toast.error("All required fields must be filled");
      return;
    }
    const payload = {
      ...jobForm,
      ctc: Number(jobForm.ctc),
      min_cgpa: Number(jobForm.min_cgpa),
      eligible_branches: jobForm.eligible_branches
        ? jobForm.eligible_branches.split(",").map((b) => b.trim()).filter(b => b.length > 0)
        : [],
    };
    const result = await createJob(payload);
    if (result.success) {
      toast.success(result.message);
      setJobForm({
        company_id: "",
        role: "",
        ctc: "",
        min_cgpa: "",
        description: "",
        eligible_branches: "",
      });
      await fetchJobs();
    } else {
      toast.error(result.message);
    }
  };

  const handleViewApplicants = async (jobId, jobRole) => {
    setSelectedJobId(jobId);
    setSelectedJobRole(jobRole);
    setIsApplicantsOpen(true);
    const applicants = await fetchApplicants(jobId);
    setJobApplicants(applicants);
  };

  const handleUpdateStatus = async (applicationId, status) => {
    const result = await updateApplicationStatus(applicationId, status);
    if (result.success) {
      toast.success(result.message);
      if (selectedJobId) {
        const updated = await fetchApplicants(selectedJobId);
        setJobApplicants(updated);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleScheduleInterview = async (applicant) => {
    setSelectedApplicant(applicant);
    setInterviewForm({
      application_id: applicant.id,
      interview_round: "",
      interview_date: "",
      interview_time: "",
      interview_link: "",
    });
    setIsInterviewFormOpen(true);
  };

  const handleSubmitInterview = async (e) => {
    e.preventDefault();
    if (!interviewForm.interview_round || !interviewForm.interview_date || !interviewForm.interview_time) {
      toast.error("All required fields must be filled");
      return;
    }
    const result = await scheduleInterview(interviewForm);
    if (result.success) {
      toast.success(result.message);
      setIsInterviewFormOpen(false);
      setInterviewForm({
        application_id: null,
        interview_round: "",
        interview_date: "",
        interview_time: "",
        interview_link: "",
      });
      if (selectedJobId) {
        const updated = await fetchApplicants(selectedJobId);
        setJobApplicants(updated);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
          <h1 className="text-lg font-bold font-heading text-foreground">PlaceMe Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="companies" className="gap-1">
              <Building2 className="w-4 h-4" /> Companies
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1">
              <Briefcase className="w-4 h-4" /> Jobs
            </TabsTrigger>
            <TabsTrigger value="interviews" className="gap-1">
              <Calendar className="w-4 h-4" /> Interviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <div className="grid gap-3">
              {loading && <p className="text-muted-foreground text-center py-8">Loading companies...</p>}
              {!loading && companies.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">No companies yet. Add one below.</p>
              )}
              {companies.map((c) => (
                <Card key={c.id} className="shadow-card">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Company ID: {c.id}</p>
                        
                      <p className="font-medium text-foreground text-lg">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.description || "No description"}</p>
                    </div>
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCompany} className="space-y-3">
                  <div>
                    <Label className="text-xs">Company Name *</Label>
                    <Input
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      placeholder="Google"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={companyForm.description}
                      onChange={(e) =>
                        setCompanyForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Company description..."
                    />
                  </div>
                  <Button type="submit" className="gradient-primary text-primary-foreground w-full">
                    Create Company
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Create Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddJob} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Company ID *</Label>
                      <Input
                        type="number"
                        value={jobForm.company_id}
                        onChange={(e) =>
                          setJobForm((f) => ({ ...f, company_id: e.target.value }))
                        }
                        required
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Job Title/Role *</Label>
                      <Input
                        value={jobForm.role}
                        onChange={(e) =>
                          setJobForm((f) => ({ ...f, role: e.target.value }))
                        }
                        required
                        placeholder="Senior Developer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={jobForm.description}
                      onChange={(e) =>
                        setJobForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Job description..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">CTC (in LPA) *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={jobForm.ctc}
                        onChange={(e) =>
                          setJobForm((f) => ({ ...f, ctc: e.target.value }))
                        }
                        required
                        placeholder="12.5"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min CGPA *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={jobForm.min_cgpa}
                        onChange={(e) =>
                          setJobForm((f) => ({ ...f, min_cgpa: e.target.value }))
                        }
                        required
                        placeholder="7.0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Eligible Branches (comma-separated)</Label>
                      <Input
                        value={jobForm.eligible_branches}
                        onChange={(e) =>
                          setJobForm((f) => ({ ...f, eligible_branches: e.target.value }))
                        }
                        placeholder="CSE,ECE,EEE"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                    Create Job
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="grid gap-3">
              {loading && <p className="text-muted-foreground text-center py-8">Loading jobs...</p>}
              {!loading && jobs.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">No jobs yet.</p>
              )}
              {jobs.map((j) => (
                <Card key={j.id} className="shadow-card">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{j.role}</p>
                        <p className="text-sm text-muted-foreground">
                          CTC: ₹{j.ctc} LPA • Min CGPA: {j.min_cgpa}
                        </p>
                        {j.description && (
                          <p className="text-sm text-muted-foreground mt-1">{j.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewApplicants(j.id, j.role)}
                      >
                        View Applicants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-4">
            <div className="grid gap-3">
              {loading && <p className="text-muted-foreground text-center py-8">Loading interviews...</p>}
              {!loading && interviews.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">No interviews scheduled yet.</p>
              )}
              {interviews.map((i) => (
                <Card key={i.id} className="shadow-card">
                  <CardContent className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">Round: {i.interview_round}</p>
                          <p className="text-sm text-muted-foreground">
                            Student: {i.student_name} ({i.roll_no})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Branch: {i.branch}
                          </p>
                        </div>
                        <Badge variant="default" className="capitalize">
                          {i.interview_round}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Date & Time</p>
                          <p className="font-medium">{new Date(i.interview_date).toLocaleDateString()} {i.interview_time}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Link</p>
                          <p className="font-medium text-xs break-all">{i.interview_link || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isApplicantsOpen} onOpenChange={setIsApplicantsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Applicants for {selectedJobRole && `"${selectedJobRole}"`} (Job ID: {selectedJobId})
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {loading && <p className="text-center py-8">Loading applicants...</p>}
              {!loading && jobApplicants.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No applicants for this job yet.
                </p>
              )}
              {jobApplicants.map((a) => (
                <Card key={a.id} className="shadow-card">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Student Details
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Roll No: {a.roll_no}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Name: {a.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CGPA: {a.cgpa}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Branch: {a.branch}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied: {new Date(a.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusColor(a.status)} className="capitalize">
                            {a.status}
                          </Badge>
                          <Select
                            value={a.status}
                            onValueChange={(v) => handleUpdateStatus(a.id, v)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {a.status === "accepted" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleScheduleInterview(a)}
                            className="gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            Schedule Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isInterviewFormOpen} onOpenChange={setIsInterviewFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Schedule Interview for {selectedApplicant?.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitInterview} className="space-y-3">
              <div>
                <Label className="text-xs">Interview Round *</Label>
                <Select
                  value={interviewForm.interview_round}
                  onValueChange={(v) => setInterviewForm({ ...interviewForm, interview_round: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical Round 1">Technical Round 1</SelectItem>
                    <SelectItem value="Technical Round 2">Technical Round 2</SelectItem>
                    <SelectItem value="HR Round">HR Round</SelectItem>
                    <SelectItem value="Final Round">Final Round</SelectItem>
                    <SelectItem value="Group Discussion">Group Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Interview Date *</Label>
                <Input
                  type="date"
                  value={interviewForm.interview_date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Interview Time *</Label>
                <Input
                  type="time"
                  value={interviewForm.interview_time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interview_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Interview Link</Label>
                <Input
                  type="text"
                  value={interviewForm.interview_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interview_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 gradient-primary text-primary-foreground"
                >
                  Schedule
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInterviewFormOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;
