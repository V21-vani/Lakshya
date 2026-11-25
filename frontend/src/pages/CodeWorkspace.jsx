import { useState } from "react";
import { Play, Send } from "lucide-react";
import { apiService } from "../api/mockApi";

const LANGUAGE_MAP = {
  python: { id: 71, name: "Python 3", starter: "def solve(nums, target):\n    # Write your code here\n    pass" },
  cpp: { id: 54, name: "C++ (GCC 9.2)", starter: "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}" },
  java: { id: 62, name: "Java (OpenJDK 13)", starter: "public class Main {\n    public static void main(String[] args) {\n        \n    }\n}" },
};

export default function CodeWorkspace() {
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(LANGUAGE_MAP.python.starter);
  const [customInput, setCustomInput] = useState("[2, 7, 11, 15], 9");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setCode(LANGUAGE_MAP[newLang].starter);
  };

  const handleExecute = async () => {
    setLoading(true);
    const response = await apiService.runCodeSubmission({
      problemId: "PROB-01",
      languageId: LANGUAGE_MAP[lang].id,
      sourceCode: code,
      customInput,
    });
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel: Problem Statement */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">1. Two Sum</h2>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Easy</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Given an array of integers <code className="bg-slate-100 px-1 rounded">nums</code> and an integer{" "}
          <code className="bg-slate-100 px-1 rounded">target</code>, return indices of the two numbers such that
          they add up to <code className="bg-slate-100 px-1 rounded">target</code>.
        </p>
        <div className="bg-slate-50 p-4 rounded-lg border text-xs font-mono space-y-1">
          <p><strong>Input:</strong> nums = [2,7,11,15], target = 9</p>
          <p><strong>Output:</strong> [0,1]</p>
        </div>
      </div>

      {/* Right Panel: Code Editor & Judge0 Output */}
      <div className="flex flex-col bg-slate-900 rounded-xl overflow-hidden text-white">
        <div className="p-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
          <select
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-700 text-sm px-3 py-1.5 rounded border border-slate-600 focus:outline-none"
          >
            {Object.entries(LANGUAGE_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
            >
              <Play className="w-4 h-4" /> {loading ? "Running..." : "Run Code"}
            </button>
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-medium"
            >
              <Send className="w-4 h-4" /> Submit
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          className="flex-1 w-full p-4 bg-slate-900 font-mono text-sm text-emerald-300 focus:outline-none resize-none"
        />

        {/* Console / Judge0 Output Box */}
        <div className="h-44 bg-slate-950 p-4 border-t border-slate-800 overflow-y-auto text-xs font-mono">
          <div className="mb-2">
            <span className="text-slate-400">Custom Stdin: </span>
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-200 w-64"
            />
          </div>
          {result ? (
            <div className="space-y-1 mt-2">
              <p className="text-emerald-400 font-bold">
                Status: {result.status} ({result.testCasesPassed}/{result.totalTestCases} Test Cases Passed)
              </p>
              <p className="text-slate-400">Time: {result.executionTime} | Memory: {result.memoryUsed}</p>
              <pre className="text-slate-200 mt-1">{result.stdout}</pre>
            </div>
          ) : (
            <p className="text-slate-500">Click "Run Code" to evaluate against Judge0 sandbox...</p>
          )}
        </div>
      </div>
    </div>
  );
}