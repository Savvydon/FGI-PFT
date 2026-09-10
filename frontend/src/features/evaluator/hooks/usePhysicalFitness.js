import { PERSON_TITLES } from "../../../constants/titles.js";
import React from "react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { computeFitness } from "../../../services/api.js";

export function usePhysicalFitness() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    fullName: "",
    title: "",
    otherTitle: "",
    participantId: "",
    unit: "",
    email: "",
    appointment: "",
    age: "",
    sex: "",
    date: new Date().toISOString().split("T")[0],
    height: "",
    weight: "",
    cardioCage: "",
    stepUp: "",
    pushUp: "",
    sitUp: "",
    chinUp: "",
    sitReach: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "participantId") {
      setFormData((prev) => ({ ...prev, participantId: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const parseNumber = useCallback((val) => {
    if (val === "" || val == null) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const year = parseNumber(formData.year);

        const payload = {
          year,
          participant_id: (formData.participantId || "").trim() || null,
          full_name: (formData.fullName || "").trim(),
          title:
            formData.title === "Other"
              ? (formData.otherTitle || "").trim()
              : formData.title || "",
          unit: (formData.unit || "").trim(),
          email: (formData.email || "").trim(),
          appointment: (formData.appointment || "").trim(),
          age: parseNumber(formData.age),
          sex: (formData.sex || "").toLowerCase(),
          date: formData.date || "",
          height: parseNumber(formData.height),
          weight: parseNumber(formData.weight),
          cardio_cage: parseNumber(formData.cardioCage),
          step_up: parseNumber(formData.stepUp) ?? 0,
          push_up: parseNumber(formData.pushUp) ?? 0,
          sit_up: parseNumber(formData.sitUp) ?? 0,
          chin_up: parseNumber(formData.chinUp) ?? 0,
          sit_reach: parseNumber(formData.sitReach) ?? 0,
        };

        const result = await computeFitness(payload);

        sessionStorage.setItem("naf_pft_result", JSON.stringify(result));
        navigate("/results", { state: result });
      } catch (error) {
        console.error("Submission error:", error);
        alert(error.message || "Failed to submit. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, navigate, isSubmitting, parseNumber],
  );

  return {
    formData,
    handleChange,
    handleSubmit,
    titles: PERSON_TITLES,
    isSubmitting,
  };
}
