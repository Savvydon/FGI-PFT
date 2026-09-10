import React from "react";
export default function PersonalInfo({ state }) {
  const cageLabel = (cage) => {
    if (cage === 1) return "Cage 1 (Excellent)";
    if (cage === 2) return "Cage 2 (Good)";
    if (cage === 3) return "Cage 3 (Poor)";
    return "NIL";
  };

  return (
    <div className="personal-info">
      <p><b>Year:</b> {state.year ?? "NIL"}</p>
      <p><b>Full Name:</b> {state.full_name ?? "NIL"}</p>
      <p><b>Title:</b> {state.title ?? "NIL"}</p>
      <p><b>Participant ID:</b> {state.participant_id ?? "NIL"}</p>
      <p><b>Unit:</b> {state.unit ?? "NIL"}</p>
      <p><b>Email:</b> {state.email ?? "NIL"}</p>
      <p><b>Appointment:</b> {state.appointment ?? "NIL"}</p>
      <p><b>Age:</b> {state.age ?? "NIL"}</p>
      <p><b>Sex:</b> {state.sex ?? "NIL"}</p>
      <p><b>Date:</b> {state.date ?? "NIL"}</p>
      <p><b>Height:</b> {state.height ? `${state.height} m` : "NIL"}</p>
      <p><b>Cardio Type:</b> {state.cardio_type ?? "NIL"}</p>
    </div>
  );
}
