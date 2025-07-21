import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProblemList } from "./components/ProblemList";
import { ProblemView } from "./components/ProblemView";
import { UserProfile } from "./components/UserProfile";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [currentView, setCurrentView] = useState<"problems" | "profile">("problems");
  const [selectedProblemId, setSelectedProblemId] = useState<Id<"problems"> | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
              onClick={() => {
                setCurrentView("problems");
                setSelectedProblemId(null);
              }}
            >
              CodeStriver
            </h1>
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => {
                  setCurrentView("problems");
                  setSelectedProblemId(null);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "problems" && !selectedProblemId
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Problems
              </button>
              <Authenticated>
                <button
                  onClick={() => setCurrentView("profile")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "profile"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Profile
                </button>
              </Authenticated>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <SignOutButton />
            </Authenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Authenticated>
          <Content 
            currentView={currentView}
            selectedProblemId={selectedProblemId}
            setSelectedProblemId={setSelectedProblemId}
            setCurrentView={setCurrentView}
          />
        </Authenticated>
        <Unauthenticated>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CodeStriver</h2>
                <p className="text-gray-600">Master coding interviews with the complete Striver A2Z sheet</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      <Toaster />
    </div>
  );
}

function Content({ 
  currentView, 
  selectedProblemId, 
  setSelectedProblemId, 
  setCurrentView 
}: {
  currentView: "problems" | "profile";
  selectedProblemId: Id<"problems"> | null;
  setSelectedProblemId: (id: Id<"problems"> | null) => void;
  setCurrentView: (view: "problems" | "profile") => void;
}) {
  if (selectedProblemId) {
    return (
      <ProblemView 
        problemId={selectedProblemId}
        onBack={() => setSelectedProblemId(null)}
      />
    );
  }

  if (currentView === "profile") {
    return <UserProfile />;
  }

  return (
    <ProblemList 
      onSelectProblem={setSelectedProblemId}
    />
  );
}
