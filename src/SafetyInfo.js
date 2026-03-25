import React, { useState, useEffect } from "react";

function SafetyInfo() {
  const [area, setArea] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [result, setResult] = useState(null);
  const [report, setReport] = useState("");
  const [reportsByArea, setReportsByArea] = useState({});
  const [currentTimeRisk, setCurrentTimeRisk] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 18) {
      setCurrentTimeRisk("Low Risk (Day Time)");
    } else if (hour >= 18 && hour < 21) {
      setCurrentTimeRisk("Medium Risk (Evening)");
    } else {
      setCurrentTimeRisk("High Risk (Night)");
    }
  }, []);

  const areaData = {
    dharapuram: {
      rating: 7,
      harassmentCount: 5,
      safePlaces: [
        { name: "Police Station", distance: "0.8 km" },
        { name: "Government Hospital", distance: "1.2 km" },
        { name: "Bus Stand", distance: "0.5 km" },
      ],
      crimeTrend: [3, 4, 2, 5, 6, 4],
    },
  };

  const handleSearch = () => {
    const normalized = area.trim().toLowerCase();
    if (!normalized) return;

    setSelectedArea(normalized);

    if (areaData[normalized]) {
      setResult(areaData[normalized]);
    } else {
      setResult({
        rating: 5,
        harassmentCount: 8,
        safePlaces: [
          { name: "Nearby Police Station", distance: "1 km" },
          { name: "Nearby Hospital", distance: "1.5 km" },
        ],
        crimeTrend: [5, 6, 7, 5, 6, 8],
      });
    }

    setReport("");
  };

  const handleReport = () => {
    if (!selectedArea || report.trim() === "") return;

    setReportsByArea((prev) => ({
      ...prev,
      [selectedArea]: [...(prev[selectedArea] || []), report.trim()],
    }));

    setReport("");
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "green";
    if (rating >= 5) return "orange";
    return "red";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Area Safety Information</h2>

      <input
        type="text"
        placeholder="Enter area name"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
      <button onClick={handleSearch}>Check Safety</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: getRatingColor(result.rating) }}>
            Safety Rating: {result.rating}/10
          </h3>

          <p>Harassment Cases: {result.harassmentCount}</p>

          <h4>Current Time Risk: {currentTimeRisk}</h4>

          <h4>Nearby Safe Places:</h4>
          <ul>
            {result.safePlaces.map((place, index) => (
              <li key={index}>
                {place.name} - {place.distance}
              </li>
            ))}
          </ul>

          <h4>Crime Trend (Last 6 Months)</h4>
          <div style={{ display: "flex", gap: 10 }}>
            {result.crimeTrend.map((value, index) => (
              <div
                key={index}
                style={{
                  width: 30,
                  height: value * 20,
                  backgroundColor: "red",
                }}
              ></div>
            ))}
          </div>

          <h4>Report Unsafe Area</h4>
          <input
            type="text"
            placeholder="Describe issue..."
            value={report}
            onChange={(e) => setReport(e.target.value)}
          />
          <button onClick={handleReport}>Submit Report</button>

          <ul>
            {(reportsByArea[selectedArea] || []).map((r, index) => (
              <li key={index}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SafetyInfo;