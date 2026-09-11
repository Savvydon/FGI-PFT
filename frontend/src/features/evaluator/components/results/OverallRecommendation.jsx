import "../../../../styles/Recommendation.css";
import React from "react";

export default function OverallRecommendation({ state }) {
  return (
    <section className="recommendations">
      <h3 className="section-title">Overall Recommendations</h3>

      <ol className="recommendation-list">
        <li>
          <strong>Stress Reduction:</strong> Prioritize stress management
          techniques like meditation, deep breathing, or progressive muscle
          relaxation.
        </li>
        <li>
          <strong>Medical Evaluation:</strong> Kindly consider consulting a
          healthcare professional to assess overall health and identify
          potential underlying issues.
        </li>
        <li>
          <strong>Gradual Exercise Adjustment:</strong> Maintain efficient
          exercise intensity to avoid overtraining and burnout.
        </li>
        <li>
          <strong>Nutrition Optimization:</strong> Focus on a balanced diet rich
          in antioxidants and anti-inflammatory foods.
        </li>
        <li>
          <strong>Sleep Prioritization:</strong> Ensure adequate sleep to
          support physical and mental recovery.
        </li>
        <li>
          <strong>Strong Support System:</strong> Lean on trusted friends or
          family for emotional support.
        </li>
        <li>
          <strong>Professional Help:</strong> Consider seeking therapy or
          counseling to manage stress and emotional well-being.
        </li>
        <li>
          <strong>Lifestyle Evaluation:</strong> Identify potential lifestyle changes.
        </li>
      </ol>

      <h3 className="section-title">Exercise Programme</h3>

      <div className="exercise-programme">
        <p>
          <strong>Prioritize recovery:</strong> Focus on low-impact activities
          like swimming, yoga, or walking.
        </p>
        <p>
          <strong>Reduce intensity:</strong> Lower the intensity of workouts to
          allow for physical and mental recovery.
        </p>

        <p>
          <strong>Listen to your body:</strong> Personnel are to pay close
          attention to signs of overtraining and adjust accordingly.
        </p>

        <p>
          <strong>Incorporate rest days:</strong> Schedule regular rest days to
          prevent burnout.
        </p>
      </div>

      <div className="personal-info">
        <p>
          <strong>Evaluator Title:</strong> {state.evaluator_title || "NIL"}
        </p>
        <p>
          <strong>Evaluator name:</strong> {state.evaluator_name || "NIL"}
        </p>
        
      </div>
      {/* //Not needed again for now */}
      {/* <p>
        <strong>Signature:</strong> .............................
      </p> */}
    </section>
  );
}
