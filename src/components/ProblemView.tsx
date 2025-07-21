import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { CodeEditor } from "./CodeEditor";
import { toast } from "sonner";

interface ProblemViewProps {
  problemId: Id<"problems">;
  onBack: () => void;
}

export function ProblemView({ problemId, onBack }: ProblemViewProps) {
  const problem = useQuery(api.problems.getProblem, { problemId });
  const submissions = useQuery(api.submissions.getSubmissions, { problemId });
  const submitCode = useMutation(api.submissions.submitCode);

  const [selectedLanguage, setSelectedLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCode({
        problemId,
        code,
        language: selectedLanguage,
      });

      setTestResults(result);
      
      if (result.status === "Accepted") {
        toast.success("Accepted! All test cases passed.");
      } else {
        toast.error(`${result.status}: ${result.testCasesPassed}/${result.totalTestCases} test cases passed`);
      }
    } catch (error) {
      toast.error("Failed to submit code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 bg-green-50";
      case "Medium": return "text-yellow-600 bg-yellow-50";
      case "Hard": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Set initial code when problem loads
  if (code === "" && problem.starterCode[selectedLanguage]) {
    setCode(problem.starterCode[selectedLanguage]);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Problems
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{problem.title}</h1>
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="text-gray-600">{problem.category}</span>
              {problem.userStatus && (
                <span className={`text-sm font-medium ${
                  problem.userStatus === "solved" ? "text-green-600" : "text-yellow-600"
                }`}>
                  {problem.userStatus === "solved" ? "✓ Solved" : "○ Attempted"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="prose max-w-none">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <div className="text-gray-700 whitespace-pre-line">{problem.description}</div>
            </div>

            {problem.examples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                {problem.examples.map((example, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-2">
                      <strong>Input:</strong> <code className="bg-gray-200 px-1 rounded">{example.input}</code>
                    </div>
                    <div className="mb-2">
                      <strong>Output:</strong> <code className="bg-gray-200 px-1 rounded">{example.output}</code>
                    </div>
                    {example.explanation && (
                      <div>
                        <strong>Explanation:</strong> {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {problem.constraints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span key={tag} className="inline-flex px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Code Editor</h3>
              <div className="flex items-center gap-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    const newLang = e.target.value as typeof selectedLanguage;
                    setSelectedLanguage(newLang);
                    setCode(problem.starterCode[newLang]);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>

          <div className="h-96">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="p-4 border-t">
              <div className="mb-3">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  testResults.status === "Accepted" 
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {testResults.status}
                </div>
                <span className="ml-3 text-gray-600">
                  {testResults.testCasesPassed}/{testResults.totalTestCases} test cases passed
                </span>
              </div>

              {testResults.details && testResults.details.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {testResults.details.map((detail: any, index: number) => (
                    <div key={index} className={`p-2 rounded text-sm ${
                      detail.passed ? "bg-green-50" : "bg-red-50"
                    }`}>
                      <div className="font-medium">Test Case {index + 1}</div>
                      <div>Input: <code>{detail.input}</code></div>
                      <div>Expected: <code>{detail.expected}</code></div>
                      <div>Actual: <code>{detail.actual}</code></div>
                      {detail.error && <div className="text-red-600">Error: {detail.error}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      {submissions && submissions.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Language</th>
                  <th className="px-4 py-2 text-left">Test Cases</th>
                  <th className="px-4 py-2 text-left">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.slice(0, 10).map((submission) => (
                  <tr key={submission._id}>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 capitalize">{submission.language}</td>
                    <td className="px-4 py-2">{submission.testCasesPassed}/{submission.totalTestCases}</td>
                    <td className="px-4 py-2">{new Date(submission.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
