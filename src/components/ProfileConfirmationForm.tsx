"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  updateProfile,
  setProfileComplete,
} from "@/store/interview/interviewSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, CheckCircle, Loader2 } from "lucide-react";

export function ProfileConfirmationForm() {
  const dispatch = useDispatch<AppDispatch>();
  const activeCandidate = useSelector(
    (state: RootState) => state.interview.activeCandidate
  );

  const [formData, setFormData] = useState({
    name: activeCandidate?.profile.name || "",
    email: activeCandidate?.profile.email || "",
    phone: activeCandidate?.profile.phone || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeCandidate) return null;

  const validate = () => {
    const phoneRegex = /^[\s()+-]*([0-9][\s()+-]*){10,18}$/;

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      alert("Please enter a valid email address (e.g., example@domain.com).");
      return false;
    }
    if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
      alert(
        "Please enter a valid phone number (min 10 digits, international format acceptable)."
      );
      return false;
    }
    return true;
  };

  const handleSaveAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    dispatch(updateProfile(formData));

    dispatch(setProfileComplete(true));

    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  const handleInputChange = (
    field: "name" | "email" | "phone",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="h-5 w-5" />
          Review and Confirm Contact Details
        </CardTitle>
        <CardDescription>
          Your resume has been analyzed. Please verify and correct the extracted
          information before starting the timed interview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveAndStart} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name (Extracted)
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address (Extracted)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number (Extracted)
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm and Start Interview
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
