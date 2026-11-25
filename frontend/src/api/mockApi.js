const API_BASE_URL = "http://localhost:5000/api";
const MOCK_MODE = true; // Change to false once Member 1 & Member 2 backend APIs are running

export const apiService = {
  // 1. Student Dashboard Analytics (Connects to Member 1 & 2)
  getStudentDashboard: async () => {
    if (MOCK_MODE) {
      return {
        student: { name: "Rashmi G K", usn: "1CR24IS001", cgpa: 8.6, readinessScore: 82 },
        skillMetrics: [
          { topic: "Arrays & Strings", score: 88 },
          { topic: "Linked Lists", score: 75 },
          { topic: "Trees & Graphs", score: 68 },
          { topic: "Aptitude & Quant", score: 85 },
          { topic: "DBMS & SQL", score: 90 },
        ],
        recentSubmissions: [
          { id: 101, problem: "Two Sum", status: "Accepted", language: "Python", date: "2026-11-12" },
          { id: 102, problem: "Detect Cycle in Linked List", status: "Accepted", language: "C++", date: "2026-11-11" },
          { id: 103, problem: "Dijkstra Shortest Path", status: "Wrong Answer", language: "Java", date: "2026-11-10" },
        ],
      };
    }
    const res = await fetch(`${API_BASE_URL}/student/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.json();
  },

  // 2. Judge0 Code Compiler Execution (Connects to Member 2)
  runCodeSubmission: async ({ problemId, languageId, sourceCode, customInput }) => {
    if (MOCK_MODE) {
      await new Promise((r) => setTimeout(r, 800));
      return {
        status: "Accepted",
        executionTime: "0.042s",
        memoryUsed: "14.2 MB",
        testCasesPassed: 3,
        totalTestCases: 3,
        stdout: customInput ? `Input: ${customInput}\nOutput: [0, 1]` : "Output: [0, 1]",
        stderr: null,
      };
    }
    const res = await fetch(`${API_BASE_URL}/submissions/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ problemId, languageId, sourceCode, customInput }),
    });
    return res.json();
  },

  // 3. Automated Placement Drive Eligibility (Connects to Member 2)
  getPlacementDrives: async () => {
    if (MOCK_MODE) {
      return [
        {
          id: "DRV-01",
          company: "TechCorp Solutions",
          role: "Associate Software Engineer",
          ctc: "8.5 LPA",
          minScoreRequired: 75,
          requiredSkills: ["Python", "SQL", "DSA"],
          isEligible: true,
          eligibilityReason: "Meets minimum readiness score (82 >= 75) & core skills.",
          applied: false,
        },
        {
          id: "DRV-02",
          company: "CloudScale Systems",
          role: "Backend Developer Intern",
          ctc: "6.0 LPA",
          minScoreRequired: 85,
          requiredSkills: ["Java", "Graphs", "OS"],
          isEligible: false,
          eligibilityReason: "Readiness score 82 is below company threshold of 85.",
          applied: false,
        },
      ];
    }
    const res = await fetch(`${API_BASE_URL}/drives/eligible`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.json();
  },
};