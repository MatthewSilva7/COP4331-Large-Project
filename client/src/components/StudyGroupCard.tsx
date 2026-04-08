import React from "react";
import { Clock, MapPin, User } from "lucide-react";
import { StudyGroup } from "../types";

interface StudyGroupCardProps {
  group: StudyGroup;
  actionType: "join" | "leave";
  onAction: (group: StudyGroup) => void;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ group, actionType, onAction }) => {
  // Helper to format the display time
  const displayTime = group.time || (group.date && group.startTime && group.endTime 
    ? `${new Date(group.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${group.startTime} - ${group.endTime}`
    : "Time TBD");

  return (
    <div className="bg-white border border-[#e5e5e0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-[#1a1a1a] font-serif">{group.subject}</h3>
        <div className="flex items-center text-sm text-[#5A5A40] bg-[#5A5A40]/5 px-3 py-1 rounded-full">
          <Clock className="h-4 w-4 mr-1.5" />
          {displayTime}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-[#5A5A40]" />
          <span className="text-sm">{group.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <User className="h-4 w-4 mr-2 text-[#5A5A40]" />
          <span className="text-sm">
            Hosted by <span className="font-medium text-[#1a1a1a]">{group.hostName}</span>
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => onAction(group)}
          className={`w-full py-2 px-4 border-2 font-semibold rounded-full transition-all text-sm ${
            actionType === "join" 
              ? "bg-white border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white" 
              : "bg-red-50 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          }`}
        >
          {actionType === "join" ? "Join Group" : "Leave Group"}
        </button>
      </div>
    </div>
  );
};

export default StudyGroupCard;
