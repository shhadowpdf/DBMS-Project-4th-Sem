import React, { createContext, useContext, useState } from "react";
import api from "@/api/tokenHandler";

const PlacementContext = createContext(null);

export const usePlacement = () => {
  const ctx = useContext(PlacementContext);
  if (!ctx) throw new Error("usePlacement must be inside PlacementProvider");
  return ctx;
};

export const PlacementProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📚 STUDENT METHODS
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/student/jobs");
      setJobs(response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch jobs error:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get("/student/get-profile");
      setStudentProfile(response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch profile error:", error);
      return null;
    }
  };

  const updateStudentProfile = async (profileData) => {
    try {
      const response = await api.put("/student/update", profileData);
      await fetchStudentProfile();
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const response = await api.post("/student/apply", { jobId });
      await fetchMyApplications();
      return { success: true, message: "Applied successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to apply",
      };
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await api.get("/student/my");
      setApplications(response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch applications error:", error);
      return [];
    }
  };

  const fetchMyInterviews = async () => {
    try {
      const response = await api.get("/student/get-interviews");
      setInterviews(response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch interviews error:", error);
      return [];
    }
  };

  // 👨‍💼 ADMIN METHODS
  const fetchCompanies = async () => {
    try{
        const response = await api.get("/admin/get-company");
        setCompanies(response.data);
        return response.data;
    } catch(error) {
        console.error("Fetch companies error:", error);
        return [];
    }
  }

  const createCompany = async (companyData) => {
    try {
      const response = await api.post("/admin/company", companyData);
      return { success: true, message: "Company created successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create company",
      };
    }
  };

  const createJob = async (jobData) => {
    try {
      const response = await api.post("/admin/job", jobData);
      await fetchJobs();
      return { success: true, message: "Job created successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create job",
      };
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      const response = await api.get(`/admin/applicants/${jobId}`);
      setApplicants(response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch applicants error:", error);
      return [];
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await api.put("/admin/status", {
        applicationId,
        status,
      });
      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update status",
      };
    }
  };

  const fetchAdminInterviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/interviews");
      setInterviews(response.data);
      return response.data;
    } catch (error) {
      console.error("Fetch admin interviews error:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async (interviewData) => {
    try {
      const response = await api.post("/admin/schedule-interview", interviewData);
      await fetchAdminInterviews();
      return { success: true, message: "Interview scheduled successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to schedule interview",
      };
    }
  };

  

  return (
    <PlacementContext.Provider
      value={{
        // State
        companies,
        jobs,
        applications,
        interviews,
        studentProfile,
        applicants,
        loading,
        // Student methods
        fetchJobs,
        fetchStudentProfile,
        updateStudentProfile,
        applyToJob,
        fetchMyApplications,
        fetchMyInterviews,
        // Admin methods
        createCompany,
        fetchCompanies,
        createJob,
        fetchApplicants,
        updateApplicationStatus,
        fetchAdminInterviews,
        scheduleInterview,
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
};
