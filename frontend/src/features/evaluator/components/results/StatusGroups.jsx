import React from "react";

export default function StatusGroups({ state }) {
  return (
    <>
      {/* ================= BODY WEIGHT ================= */}
      <h3>Body Weight Status</h3>
      <div className="status-info">
        <p>
          <b>Current Weight:</b> {state.weight_current ?? "NIL"} kg
        </p>
        <p>
          <b>Ideal Weight:</b> {state.weight_ideal ?? "NIL"} kg
        </p>
        <p>
          <b>Excess Weight:</b> {state.weight_excess ?? 0} kg
        </p>
        <p>
          <b>Weight Deficit:</b> {state.weight_deficit ?? 0} kg
        </p>
      </div>

      {/* ================= BMI ================= */}
      <h3>Body Mass Index (BMI) Status</h3>
      <div className="status-info">
        <p>
          <b>Current BMI:</b> {state.bmi_current ?? "NIL"}
        </p>
        <p>
          <b>Ideal BMI Range:</b> {"18-24.9"}
        </p>
        <p>
          <b>Excess BMI:</b> {state.bmi_excess ?? 0}
        </p>
        <p>
          <b>BMI Deficit:</b> {state.bmi_deficit ?? 0}
        </p>
        <p>
          <b>Status:</b> {state.bmi_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.bmi_points ?? 0}
        </p>
      </div>

      {/* ================= CARDIO (CAGE-BASED) ================= */}
      <h3>Cardiovascular Endurance (Cage-Based)</h3>
      <div className="status-info">
        <p>
          <b>Cardio Type:</b> {state.cardio_type ?? "NIL"}
        </p>
        <p>
          <b>Cage Achieved:</b> {state.cardio_cage ?? "NIL"}
        </p>
        <p>
          <b>Status:</b> {state.cardio_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.cardio_points ?? 0}
        </p>
      </div>

      {/* ================= STEP-UP ================= */}
      <h3>Cardiovascular Endurance (Step-Up)</h3>
      <div className="status-info">
        <p>
          <b>Repetitions:</b> {state.step_up_value ?? "NIL"}
        </p>
        <p>
          <b>Ideal:</b> {state.step_up_ideal ?? "NIL"}
        </p>
        <p>
          <b>Deficit:</b> {state.step_up_deficit ?? 0}
        </p>
        <p>
          <b>Excess:</b> {state.step_up_excess ?? 0}
        </p>
        <p>
          <b>Status:</b> {state.step_up_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.step_up_points ?? 0}
        </p>
      </div>

      {/* ================= PUSH-UP ================= */}
      <h3>Muscular Strength (Push-Up)</h3>
      <div className="status-info">
        <p>
          <b>Repetitions:</b> {state.push_up_value ?? "NIL"}
        </p>
        <p>
          <b>Ideal:</b> {state.push_up_ideal ?? "NIL"}
        </p>
        <p>
          <b>Deficit:</b> {state.push_up_deficit ?? 0}
        </p>
        <p>
          <b>Excess:</b> {state.push_up_excess ?? 0}
        </p>
        <p>
          <b>Status:</b> {state.push_up_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.push_up_points ?? 0}
        </p>
      </div>

      {/* ================= SIT-UP ================= */}
      <h3>Muscular Endurance (Sit-Up)</h3>
      <div className="status-info">
        <p>
          <b>Repetitions:</b> {state.sit_up_value ?? "NIL"}
        </p>
        <p>
          <b>Ideal:</b> {state.sit_up_ideal ?? "NIL"}
        </p>
        <p>
          <b>Deficit:</b> {state.sit_up_deficit ?? 0}
        </p>
        <p>
          <b>Excess:</b> {state.sit_up_excess ?? 0}
        </p>
        <p>
          <b>Status:</b> {state.sit_up_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.sit_up_points ?? 0}
        </p>
      </div>

      {/* ================= CHIN-UP ================= */}
      <h3>Muscular Endurance (Chin-Up)</h3>
      <div className="status-info">
        <p>
          <b>Repetitions:</b> {state.chin_up_value ?? "NIL"}
        </p>
        <p>
          <b>Ideal:</b> {state.chin_up_ideal ?? "NIL"}
        </p>
        <p>
          <b>Deficit:</b> {state.chin_up_deficit ?? 0}
        </p>
        <p>
          <b>Excess:</b> {state.chin_up_excess ?? 0}
        </p>
        <p>
          <b>Status:</b> {state.chin_up_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.chin_up_points ?? 0}
        </p>
      </div>

      {/* ================= SIT & REACH ================= */}
      <h3>Flexibility (Sit & Reach)</h3>
      <div className="status-info">
        <p>
          <b>Reach:</b> {state.sit_reach_value ?? "NIL"} cm
        </p>
        <p>
          <b>Ideal:</b> {state.sit_reach_ideal ?? "NIL"}
        </p>
        <p>
          <b>Deficit:</b> {state.sit_reach_deficit ?? 0}
        </p>
        <p>
          <b>Excess:</b> {state.sit_reach_excess ?? 0}
        </p>
        <p>
          <b>Status:</b> {state.sit_reach_status ?? "NIL"}
        </p>
        <p>
          <b>Points:</b> {state.sit_reach_points ?? 0}
        </p>
      </div>

      {/* ================= PERFORMANCE ================= */}
      <h3>Performance Summary</h3>
      <div className="personal-info">
        <p>
          <b>Aggregate Score:</b> {state.aggregate ?? "NIL"}
        </p>
        <p>
          <b>Grade:</b> {state.grade ?? "NIL"}
        </p>
      </div>

      {/* ================= PRESCRIPTION ================= */}
      <h3>Prescription</h3>
      <div className="personal-info">
        <p>
          <b>Recommended Duration:</b> {state.prescription_duration ?? "NIL"}
        </p>
        <p>
          <b>Recommended Days:</b> {state.prescription_days ?? "NIL"}
        </p>
      </div>
      <p>
        <b>Recommended Activity:</b> {state.recommended_activity ?? "NIL"}
      </p>
    </>
  );
}
