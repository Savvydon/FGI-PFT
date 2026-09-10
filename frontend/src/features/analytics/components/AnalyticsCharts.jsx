import React from "react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../../../styles/Analytics.css";

const COLORS = {
  excellent: "#27ae60",
  good: "#3498db",
  marginal: "#f39c12",
  poor: "#e74c3c",
  male: "#2980b9",
  female: "#e91e63",
  underweight: "#3498db",
  normal: "#27ae60",
  overweight: "#e74c3c",
  cardio: "#9b59b6",
  stepUp: "#1abc9c",
  pushUp: "#34495e",
  sitUp: "#16a085",
  chinUp: "#d35400",
  sitReach: "#8e44ad",
};

export default function AnalyticsChart({ data, userRole = "admin" }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      calculateStats(data);
    }
  }, [data]);

  const calculateStats = (records) => {
    const total = records.length;

    // Gender distribution
    const male = records.filter((r) => r.sex?.toLowerCase() === "male").length;
    const female = records.filter(
      (r) => r.sex?.toLowerCase() === "female",
    ).length;

    // Performance grades
    const excellent = records.filter((r) => r.grade === "Excellent").length;
    const good = records.filter((r) => r.grade === "Good").length;
    const marginal = records.filter((r) => r.grade === "Marginal").length;
    const poor = records.filter((r) => r.grade === "Poor").length;

    // BMI/Weight status
    const underweight = records.filter((r) =>
      r.bmi_status?.toLowerCase().includes("under"),
    ).length;
    const normal = records.filter(
      (r) =>
        r.bmi_status?.toLowerCase() === "normal" ||
        r.bmi_status?.toLowerCase().includes("healthy"),
    ).length;
    const overweight = records.filter(
      (r) =>
        r.bmi_status?.toLowerCase().includes("over") ||
        r.bmi_status?.toLowerCase().includes("obese"),
    ).length;

    // Exercise performance - Good performers (excess >= 0 or status is good/excellent)
    const goodCardio = records.filter(
      (r) =>
        r.cardio_status?.toLowerCase() === "excellent" || r.cardio_cage === 1,
    ).length;
    const goodStepUp = records.filter(
      (r) =>
        (r.step_up_excess || 0) > 0 ||
        r.step_up_status?.toLowerCase().includes("excellent"),
    ).length;
    const goodPushUp = records.filter(
      (r) =>
        (r.push_up_excess || 0) > 0 ||
        r.push_up_status?.toLowerCase().includes("excellent"),
    ).length;
    const goodSitUp = records.filter(
      (r) =>
        (r.sit_up_excess || 0) > 0 ||
        r.sit_up_status?.toLowerCase().includes("good"),
    ).length;
    const goodChinUp = records.filter(
      (r) =>
        (r.chin_up_excess || 0) > 0 ||
        r.chin_up_status?.toLowerCase().includes("good"),
    ).length;
    const goodSitReach = records.filter(
      (r) =>
        (r.sit_reach_excess || 0) > 0 ||
        r.sit_reach_status?.toLowerCase().includes("good"),
    ).length;

    setStats({
      total,
      gender: [
        { name: "Male", value: male, color: COLORS.male },
        { name: "Female", value: female, color: COLORS.female },
      ],
      performance: [
        { name: "Excellent", value: excellent, color: COLORS.excellent },
        { name: "Good", value: good, color: COLORS.good },
        { name: "Marginal", value: marginal, color: COLORS.marginal },
        { name: "Poor", value: poor, color: COLORS.poor },
      ],
      bmiStatus: [
        { name: "Underweight", value: underweight, color: COLORS.underweight },
        { name: "Normal", value: normal, color: COLORS.normal },
        { name: "Overweight", value: overweight, color: COLORS.overweight },
      ],
      goodExercises: [
        { name: "Cardio", value: goodCardio, fill: COLORS.cardio },
        { name: "Step Up", value: goodStepUp, fill: COLORS.stepUp },
        { name: "Push Up", value: goodPushUp, fill: COLORS.pushUp },
        { name: "Sit Up", value: goodSitUp, fill: COLORS.sitUp },
        { name: "Chin Up", value: goodChinUp, fill: COLORS.chinUp },
        { name: "Sit & Reach", value: goodSitReach, fill: COLORS.sitReach },
      ],
    });
  };

  if (!stats) {
    return (
      <div className="analytics-loading">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Role indicator banner */}
      <div className={`role-banner ${userRole}`}>
        <span>
          {userRole === "super_admin"
            ? " System-Wide Analytics (Super Admin)"
            : " Admin Analytics Dashboard"}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <h4>Total Evaluated</h4>
          <span className="number">{stats.total}</span>
          <p>Personnel Records</p>
        </div>
        <div className="summary-card male">
          <h4>Male Personnel</h4>
          <span className="number">{stats.gender[0].value}</span>
          <p>
            {stats.total > 0
              ? ((stats.gender[0].value / stats.total) * 100).toFixed(1)
              : 0}
            % of total
          </p>
        </div>
        <div className="summary-card female">
          <h4>Female Personnel</h4>
          <span className="number">{stats.gender[1].value}</span>
          <p>
            {stats.total > 0
              ? ((stats.gender[1].value / stats.total) * 100).toFixed(1)
              : 0}
            % of total
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Performance Summary */}
        <div className="chart-card">
          <h3>Performance Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.performance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.performance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            Distribution of personnel by performance grade
          </div>
        </div>

        {/* BMI/Weight Status */}
        <div className="chart-card">
          <h3>Body Weight Status Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.bmiStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {stats.bmiStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            BMI classification: Underweight, Normal, Overweight
          </div>
        </div>

        {/* Poor Performance Exercises
        <div className="chart-card full-width">
          <h3>Exercise Overview: Most Poorly Performed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.poorExercises}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            Number of personnel with poor performance in each exercise category
          </div>
        </div> */}

        {/* Good Performance Exercises */}
        <div className="chart-card full-width">
          <h3>Exercise Overview: Most Well Performed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.goodExercises}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#27ae60" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            Number of personnel with excellent/good performance in each exercise
            category
          </div>
        </div>
      </div>
    </div>
  );
}
