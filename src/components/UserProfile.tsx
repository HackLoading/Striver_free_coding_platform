import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserProfile() {
  const user = useQuery(api.auth.loggedInUser);
  const stats = useQuery(api.users.getUserStats);
  const progress = useQuery(api.users.getUserProgress);

  if (!user || !stats || !progress) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalProblems = 8; // This would be dynamic in a real app
  const solvedPercentage = Math.round((stats.totalSolved / totalProblems) * 100);

  const recentlySolved = progress
    .filter(p => p.status === "solved")
    .sort((a, b) => b.lastAttempted - a.lastAttempted)
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile</h2>
        <p className="text-gray-600">Track your coding progress and achievements</p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.name || "Anonymous User"}
            </h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSolved}</div>
          <div className="text-gray-600">Problems Solved</div>
          <div className="text-sm text-gray-500 mt-1">{solvedPercentage}% Complete</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.easySolved}</div>
          <div className="text-gray-600">Easy</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.mediumSolved}</div>
          <div className="text-gray-600">Medium</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.hardSolved}</div>
          <div className="text-gray-600">Hard</div>
        </div>
      </div>

      {/* Streak Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Streak</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
              <div className="text-gray-600">Current Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.maxStreak}</div>
              <div className="text-gray-600">Max Streak</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{solvedPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${solvedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Solved */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recently Solved</h3>
        {recentlySolved.length > 0 ? (
          <div className="space-y-3">
            {recentlySolved.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <div>
                    <div className="font-medium">{item.problem?.title}</div>
                    <div className="text-sm text-gray-600">{item.problem?.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    item.problem?.difficulty === "Easy" ? "text-green-600 bg-green-50" :
                    item.problem?.difficulty === "Medium" ? "text-yellow-600 bg-yellow-50" :
                    "text-red-600 bg-red-50"
                  }`}>
                    {item.problem?.difficulty}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.lastAttempted).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No problems solved yet. Start coding!</p>
        )}
      </div>
    </div>
  );
}
