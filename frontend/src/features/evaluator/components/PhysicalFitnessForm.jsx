import React from "react";
import { useAuth } from "../../../app/providers/AuthProvider.jsx";

export function PhysicalFitnessForm({
  formData,
  handleChange,
  handleSubmit,
  titles,
}) {
  const { currentUser, authLoading } = useAuth();

  if (authLoading && !currentUser) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        Loading evaluator information...
      </div>
    );
  }

  const isOtherTitle = formData.title === "Other";

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div>
        <label>Year:</label>
        <input name="year" type="number" placeholder="Year" value={formData.year} onChange={handleChange} required />
      </div>

      <div>
        <label>Full Name:</label>
        <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
      </div>

      <div>
        <label>Title:</label>
        <select name="title" value={formData.title} onChange={handleChange} required>
          <option value="">Select Title</option>
          {titles.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
        {isOtherTitle && (
          <input
            name="otherTitle"
            type="text"
            placeholder="Enter title"
            value={formData.otherTitle || ""}
            onChange={handleChange}
            required
            style={{ marginTop: "8px" }}
          />
        )}
      </div>

      <div>
        <label>Participant ID (returning participant):</label>
        <input
          name="participantId"
          type="text"
          placeholder="Leave blank for a new participant"
          value={formData.participantId || ""}
          onChange={handleChange}
        />
        <small style={{ display: "block", marginTop: "6px", color: "#666" }}>
          Leave blank to create a new participant and receive an automatically generated ID. Enter an existing Participant ID to add a new yearly evaluation to that participant.
        </small>
      </div>

      <div>
        <label>Unit / Organization:</label>
        <input name="unit" type="text" placeholder="Enter unit or organization" value={formData.unit} onChange={handleChange} required />
      </div>

      <div>
        <label>Date:</label>
        <input name="date" type="date" value={formData.date} onChange={handleChange} required />
      </div>

      <div>
        <label>Appointment / Occupation:</label>
        <input name="appointment" type="text" placeholder="Enter appointment or occupation" value={formData.appointment} onChange={handleChange} required />
      </div>

      <div>
        <label>Height (m):</label>
        <input name="height" type="number" step="0.01" placeholder="Height (m)" value={formData.height} onChange={handleChange} required />
      </div>

      <div>
        <label>Weight (kg):</label>
        <input name="weight" type="number" step="0.01" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />
      </div>

      <div>
        <label>Email:</label>
        <input name="email" type="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} required />
      </div>

      <div>
        <label>Age:</label>
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
      </div>

      <div>
        <label>Sex:</label>
        <select name="sex" value={formData.sex} onChange={handleChange} required>
          <option value="">Select Sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label>Cardio Cage:</label>
        <select name="cardioCage" value={formData.cardioCage} onChange={handleChange} required>
          <option value="">Select Cage</option>
          <option value="1">Cage 1</option>
          <option value="2">Cage 2</option>
          <option value="3">Cage 3</option>
        </select>
      </div>

      <div><label>3-Minute Step-Up:</label><input name="stepUp" type="number" placeholder="3 Minutes Step-Up" value={formData.stepUp} onChange={handleChange} required /></div>
      <div><label>1-Minute Push-Up:</label><input name="pushUp" type="number" placeholder="1 Minute Push-Up" value={formData.pushUp} onChange={handleChange} required /></div>
      <div><label>1-Minute Sit-Up:</label><input name="sitUp" type="number" placeholder="1 Minute Sit-Up" value={formData.sitUp} onChange={handleChange} required /></div>
      <div><label>Chin-Up:</label><input name="chinUp" type="number" placeholder="Chin-Up" value={formData.chinUp} onChange={handleChange} required /></div>
      <div><label>Sit & Reach (cm):</label><input name="sitReach" type="number" placeholder="Sit and Reach (cm)" value={formData.sitReach} onChange={handleChange} required /></div>

      <div>
        <label>Evaluator Name:</label>
        <input type="text" value={currentUser?.full_name || ""} readOnly style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed", color: "#333" }} />
      </div>

      <div>
        <label>Evaluator Title:</label>
        <input type="text" value={currentUser?.title || ""} readOnly style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed", color: "#333" }} />
      </div>

      <button type="submit" className="submit-btn">Submit Form</button>
    </form>
  );
}
