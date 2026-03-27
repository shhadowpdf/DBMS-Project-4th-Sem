import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const UpdateProfileDialog = ({
  open,
  onOpenChange,
  studentProfile,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    branch: "",
    cgpa: "",
    skills: "",
    resume_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (studentProfile) {
      setFormData({
        name: studentProfile.name || "",
        roll_no: studentProfile.roll_no || "",
        branch: studentProfile.branch || "",
        cgpa: studentProfile.cgpa || "",
        skills: studentProfile.skills || "",
        resume_url: studentProfile.resume_url || "",
      });
    }
  }, [studentProfile, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.roll_no || !formData.cgpa || !formData.branch) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onUpdate(formData);
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roll_no">Roll No *</Label>
            <Input
              id="roll_no"
              name="roll_no"
              value={formData.roll_no}
              onChange={handleChange}
              placeholder="Enter your roll number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch *</Label>
            <Input
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Enter your branch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cgpa">CGPA *</Label>
            <Input
              id="cgpa"
              name="cgpa"
              type="number"
              step="0.01"
              value={formData.cgpa}
              onChange={handleChange}
              placeholder="Enter your CGPA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Java, Python, React"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_url">Resume URL</Label>
            <Input
              id="resume_url"
              name="resume_url"
              type="url"
              value={formData.resume_url}
              onChange={handleChange}
              placeholder="https://example.com/resume.pdf"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary text-primary-foreground"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
