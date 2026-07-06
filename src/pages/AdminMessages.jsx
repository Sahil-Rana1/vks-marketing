import React, { useState, useEffect } from 'react';
import { FiMail, FiMessageSquare, FiX, FiCheck } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { TableSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const MOCK_MESSAGES = [
  { _id: 'mock_m1', name: 'Alok Mishra', email: 'alok@example.com', subject: 'Inquiry about customized soap dispenser volumes', message: 'I need to purchase 50 units for my hotel rooms. Can I get a bulk discount?', status: 'Pending', createdAt: new Date() }
];

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reply modal states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { showToast } = useToast();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get('/contacts');
      if (res.data.success && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        setMessages(MOCK_MESSAGES);
      }
    } catch (err) {
      console.error(err);
      setMessages(MOCK_MESSAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleOpenReply = (msg) => {
    setSelectedMsg(msg);
    setReplyMessage('');
    setIsOpen(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setSending(true);
      const res = await API.post(`/contacts/${selectedMsg._id}/reply`, { replyMessage });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIsOpen(false);
        loadMessages();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 select-none text-left">
      <div>
        <h2 className="text-2xl font-black text-secondary dark:text-white">Customer Inquiries</h2>
        <p className="text-xs text-customGray font-semibold mt-1">Review contact forms submissions and send support emails</p>
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={5} />
      ) : (
        <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-customGray-light dark:border-white/5 text-customGray font-bold uppercase bg-customGray-light/10 dark:bg-black/20 select-none">
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Sender</th>
                <th className="p-4 font-bold">Subject</th>
                <th className="p-4 font-bold">Message</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id} className="border-b border-customGray-light dark:border-white/5 last:border-0 hover:bg-customGray-light/20 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-customGray">
                    {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <p className="font-bold">{msg.name}</p>
                    <p className="text-[10px] text-customGray font-semibold">{msg.email}</p>
                  </td>
                  <td className="p-4 font-bold">{msg.subject}</td>
                  <td className="p-4 text-customGray max-w-xs truncate font-medium">{msg.message}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      msg.status === 'Replied' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {msg.status === 'Pending' ? (
                      <button onClick={() => handleOpenReply(msg)} className="px-3 py-1.5 bg-primary text-black font-bold rounded-xl shadow-sm text-[10px] hover:bg-primary/95 transition-all">Reply</button>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-center gap-1"><FiCheck /> Handled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reply Modal */}
      {isOpen && selectedMsg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/60" />
          
          <div className="relative max-w-md w-full bg-white dark:bg-customGray-dark rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3 select-none">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5"><FiMessageSquare className="text-primary" /> Reply to Customer</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-customGray-light dark:hover:bg-black/35"><FiX /></button>
            </div>

            <div className="text-xs text-left font-semibold text-customGray border-b pb-4">
              <p><span className="text-secondary dark:text-white font-bold block mb-0.5">Customer Name</span> {selectedMsg.name} ({selectedMsg.email})</p>
              <p className="mt-3"><span className="text-secondary dark:text-white font-bold block mb-0.5">Original message</span> "{selectedMsg.message}"</p>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-4 text-xs font-semibold text-customGray text-left">
              <div>
                <label className="block mb-1 text-[10px] font-bold uppercase">Your Reply Email Body</label>
                <textarea
                  rows="5"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response email details here..."
                  className="w-full bg-customGray-light dark:bg-black/30 p-3 rounded-xl border border-transparent focus:outline-none focus:border-primary/50"
                  required
                ></textarea>
              </div>

              <div className="pt-4 border-t flex gap-2 select-none">
                <button type="button" onClick={() => setIsOpen(false)} className="w-1/2 py-2.5 border rounded-xl font-bold text-center">Cancel</button>
                <button type="submit" disabled={sending} className="w-1/2 py-2.5 bg-primary text-black font-extrabold rounded-xl shadow text-center flex items-center justify-center gap-1">
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMessages;
