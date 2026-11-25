import { useState } from "react";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: "A train 120m long passes a pole in 12 seconds. What is its speed in km/hr?",
    options: ["30 km/hr", "36 km/hr", "40 km/hr", "45 km/hr"],
    answer: "36 km/hr",
  },
  {
    id: 2,
    question: "What is the time complexity of binary search on a sorted array of size n?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: "O(log n)",
  },
];

export default function AptitudeQuiz() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = SAMPLE_QUESTIONS.reduce(
    (acc, q) => (answers[q.id] === q.answer ? acc + 1 : acc),
    0
  );

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-slate-200 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">Quantitative & Technical Aptitude Test</h2>
        {submitted && (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-full text-sm">
            Score: {score} / {SAMPLE_QUESTIONS.length}
          </span>
        )}
      </div>

      {SAMPLE_QUESTIONS.map((q, idx) => (
        <div key={q.id} className="space-y-3">
          <p className="font-medium text-slate-800">{idx + 1}. {q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                disabled={submitted}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                className={`p-3 text-left text-sm rounded-lg border transition ${
                  answers[q.id] === opt
                    ? "border-indigo-600 bg-indigo-50 text-indigo-800 font-medium"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
        >
          Submit Assessment
        </button>
      )}
    </div>
  );
}