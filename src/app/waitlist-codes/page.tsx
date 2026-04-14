"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InviteCode {
  code: string;
  description: string;
  created: string;
  signups: number;
}

export default function WaitlistCodes() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState<InviteCode | null>(null);

  const fetchCodes = async () => {
    try {
      const response = await fetch("/api/codes");
      const data = await response.json();
      setCodes(data.codes || []);
    } catch (error) {
      console.error("Failed to fetch codes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      const result = await response.json();
      if (result.success && result.code) {
        setNewCode(result.code);
        setShowModal(true);
        setDescription("");
        await fetchCodes(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to create code:", error);
    } finally {
      setCreating(false);
    }
  };

  const copyInviteUrl = (code: string) => {
    const url = `https://wonder.dog?invite=${code}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here if desired
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#003A45] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#003A45] text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Invite Codes</h1>
            <p className="text-white/70">
              Manage waitlist invite codes for attribution tracking.
            </p>
          </div>

          {/* Create New Code Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Code</h2>
            <form onSubmit={handleCreateCode} className="flex gap-4">
              <input
                type="text"
                placeholder="Description (e.g., 'Pat's friend Danny')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 h-12 rounded-xl bg-white/15 border border-white/20 px-4 text-white placeholder:text-white/60 outline-none focus:border-white/40 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={creating || !description.trim()}
                className="h-12 px-6 rounded-xl bg-[#D9FF66] text-[#003A45] font-semibold hover:bg-[#e5ff8a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Code"}
              </button>
            </form>
          </div>

          {/* Codes Table */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      Signups
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {codes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-white/60"
                      >
                        No invite codes created yet.
                      </td>
                    </tr>
                  ) : (
                    codes.map((code) => (
                      <tr key={code.code} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <span className="font-mono text-lg font-bold text-[#D9FF66]">
                            {code.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/90">
                          {code.description}
                        </td>
                        <td className="px-6 py-4 text-white/70">
                          {formatDate(code.created)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D9FF66]/20 text-[#D9FF66]">
                            {code.signups}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => copyInviteUrl(code.code)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-white/15 text-white rounded-lg hover:bg-white/25 transition-colors"
                          >
                            Copy
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && newCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#003A45] border border-white/20 rounded-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D9FF66]/20 rounded-full mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Code Created!
                  </h2>
                  <p className="text-white/70 mb-6">
                    Your invite code <span className="font-mono text-[#D9FF66] font-bold">{newCode.code}</span> has been generated.
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <p className="text-sm text-white/60 mb-2">Full invite URL:</p>
                  <p className="font-mono text-sm bg-white/10 rounded px-3 py-2 break-all">
                    https://wonder.dog?invite={newCode.code}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-12 rounded-xl bg-white/15 text-white font-semibold hover:bg-white/25 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      copyInviteUrl(newCode.code);
                      setShowModal(false);
                    }}
                    className="flex-1 h-12 rounded-xl bg-[#D9FF66] text-[#003A45] font-semibold hover:bg-[#e5ff8a] transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}