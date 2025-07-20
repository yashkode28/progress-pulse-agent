import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const tasks = [
  "Create your first task",
  "Set a deadline",
  "Get AI reminders",
  "Complete with confidence",
  "Track your progress"
];

export const ChecklistAnimation = () => {
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < tasks.length) {
        setCheckedTasks(prev => [...prev, currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        // Reset animation
        setCheckedTasks([]);
        setCurrentIndex(0);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="w-80 p-6">
      <h3 className="text-2xl font-bold text-black mb-6 text-center">
        Get Started in Minutes
      </h3>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 transition-all duration-500 ${
              checkedTasks.includes(index) ? "opacity-100" : "opacity-50"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                checkedTasks.includes(index)
                  ? "bg-green-500 border-green-500 scale-110"
                  : "border-black/30"
              }`}
            >
              {checkedTasks.includes(index) && (
                <Check className="w-4 h-4 text-white animate-scale-in" />
              )}
            </div>
            <span
              className={`text-lg transition-all duration-300 ${
                checkedTasks.includes(index)
                  ? "text-black font-medium line-through"
                  : "text-black/70"
              }`}
            >
              {task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};