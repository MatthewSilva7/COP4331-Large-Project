import React, { useState, useEffect } from "react";
import { Search, Plus, User as UserIcon, LogOut, Calendar, Users } from "lucide-react";
import StudyGroupCard from "../components/StudyGroupCard";
import { StudyGroup } from "../types";
import HostGroupModal from "../components/HostGroupModal";
import JoinGroupModal from "../components/JoinGroupModal";
import LeaveGroupModal from "../components/LeaveGroupModal";
import { sessionService } from "../services/sessionService";

interface DashboardProps {
  onLogout: () => void;
}

type TabType = "available" | "scheduled";

export default function DashboardPage({ onLogout }: DashboardProps) {
  const [availableGroups, setAvailableGroups] = useState<StudyGroup[]>([]);
  const [scheduledGroups, setScheduledGroups] = useState<StudyGroup[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("available");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);

  // 1. LOAD DATA FROM BACKEND ON MOUNT
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await sessionService.getSessions();
        // MongoDB uses _id, so we map it to id for your UI logic
        const formattedData = data.map((g: any) => ({ ...g, id: g._id }));
        setAvailableGroups(formattedData);
      } catch (err) {
        console.error("Could not load study groups", err);
      }
    };
    fetchGroups();
  }, []);

  // 2. SAVE NEW GROUP TO BACKEND
  const handleHostGroup = async (newGroupData: any) => {
    try {
      const result = await sessionService.createSession(newGroupData);
      // Add the new session from the DB to our state
      const newGroup = { ...result.session, id: result.session._id };
      setAvailableGroups([newGroup, ...availableGroups]);
      setIsHostModalOpen(false);
    } catch (err) {
      alert("Error creating study group. Please try again.");
    }
  };

  // UI Filtering Logic (remains the same as your AI Studio version)
  const handleJoinClick = (group: StudyGroup) => {
    setSelectedGroup(group);
    setIsJoinModalOpen(true);
  };

  const handleLeaveClick = (group: StudyGroup) => {
    setSelectedGroup(group);
    setIsLeaveModalOpen(true);
  };

  const confirmJoin = (userName: string) => {
    if (selectedGroup) {
      setAvailableGroups(availableGroups.filter(g => g.id !== selectedGroup.id));
      setScheduledGroups([...scheduledGroups, selectedGroup]);
      setIsJoinModalOpen(false);
      setSelectedGroup(null);
    }
  };

  const confirmLeave = () => {
    if (selectedGroup) {
      setScheduledGroups(scheduledGroups.filter(g => g.id !== selectedGroup.id));
      setAvailableGroups([...availableGroups, selectedGroup]);
      setIsLeaveModalOpen(false);
      setSelectedGroup(null);
    }
  };

  const currentGroups = activeTab === "available" ? availableGroups : scheduledGroups;
  const filteredGroups = currentGroups.filter(group => 
    group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.hostName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fdfcf8] font-sans">
      <header className="bg-white border-b border-[#e5e5e0] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => setIsHostModalOpen(true)}
            className="flex items-center gap-2 bg-[#5A5A40] text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:bg-[#4a4a34] transition-all transform active:scale-95 text-sm"
          >
            <Plus className="h-4 w-4" />
            Host a study group
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center border border-[#5A5A40]/20">
              <UserIcon className="h-5 w-5 text-[#5A5A40]" />
            </div>
            <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#e5e5e0] rounded-2xl shadow-sm focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full border border-[#e5e5e0] shadow-sm flex gap-1">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "available" ? "bg-[#5A5A40] text-white shadow-md" : "text-gray-500"}`}
            >
              Study Groups
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "scheduled" ? "bg-[#5A5A40] text-white shadow-md" : "text-gray-500"}`}
            >
              Scheduled ({scheduledGroups.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <StudyGroupCard 
              key={group.id} 
              group={group} 
              actionType={activeTab === "available" ? "join" : "leave"}
              onAction={activeTab === "available" ? handleJoinClick : handleLeaveClick}
            />
          ))}
        </div>
      </main>

      <HostGroupModal isOpen={isHostModalOpen} onClose={() => setIsHostModalOpen(false)} onHost={handleHostGroup} />
      <JoinGroupModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onConfirm={confirmJoin} subject={selectedGroup?.subject || ""} />
      <LeaveGroupModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} onConfirm={confirmLeave} subject={selectedGroup?.subject || ""} />
    </div>
  );
}