import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Book, Lock, Calendar as CalendarIcon, Home, PenTool, Link as LinkIcon, FileText, ChevronRight, User, Quote, ImageIcon } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const supabase = createClient('https://psdrakjfbumzmwbpzwkd.supabase.co', 'sb_publishable_IWQriti-EmIH4ekLRuLfmg_16fLyZY0');

function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const CORRECT_PASSWORD = "5557";

  const [posts, setPosts] = useState([]);
  const [essays, setEssays] = useState([]);
  const [events, setEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({ title: '', author: '', image_url: '', region: 'NY' });
  const [newComment, setNewComment] = useState({ author: '', content: '', rating: 5 });
  const [essayForm, setEssayForm] = useState({ title: '', book_title: '', author: '', content: '' });
  const [newEvent, setNewEvent] = useState({ title: '', start: '', description: '', region: 'NY', image_url: '' });

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
      fetchEvents();
      fetchEssays();
    }
  }, [isLoggedIn]);

  async function fetchPosts() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  async function fetchEssays() {
    const { data } = await supabase.from('essays').select('*').order('created_at', { ascending: false });
    if (data) setEssays(data);
  }

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*');
    if (data) {
      const formatted = data.map(ev => ({
        id: ev.id,
        title: ev.title,
        start: ev.start,
        extendedProps: { ...ev },
        backgroundColor: ev.region === 'NY' ? '#722F37' : '#4A5D4E',
        borderColor: 'transparent'
      }));
      setEvents(formatted);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) setIsLoggedIn(true);
    else { alert("비밀번호를 확인해주세요."); setPasswordInput(""); }
  };

  const NavBar = () => (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-[200] px-8 h-16 flex items-center justify-between font-['Noto_Serif_KR']">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('HOME')}>
        <img src="/logo.png" className="w-8 h-8 object-contain" alt="mini-logo" />
        <h1 className="text-base font-black tracking-tight text-stone-900 uppercase">NJ·NY <span className="text-[#722F37] font-light italic">Book club</span></h1>
      </div>
      <div className="flex gap-8 text-[13px] font-bold tracking-tight uppercase text-stone-500">
        {['HOME', 'REVIEW', 'LINKS'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`hover:text-stone-900 transition-colors ${activeTab === tab ? 'text-[#722F37] border-b-2 border-[#722F37] pb-1' : ''}`}>
            {tab === 'HOME' ? 'Library' : tab === 'REVIEW' ? 'Archive' : 'Form'}
          </button>
        ))}
      </div>
    </nav>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-4 font-['Noto_Serif_KR']">
        <div className="bg-white p-12 rounded-sm shadow-2xl max-w-sm w-full border border-stone-200 text-center">
          <img src="/logo.png" className="w-16 h-16 mx-auto mb-6 object-contain" alt="logo" />
          <h1 className="text-2xl font-black mb-3 text-stone-800 tracking-tight">뉴욕·뉴저지 북클럽</h1>
          <p className="text-[13px] text-stone-500 font-medium mb-10">멤버 확인을 위하여 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="Passcode" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full pb-2 bg-transparent border-b border-stone-300 outline-none text-center text-lg font-bold" />
            <button type="submit" className="w-full bg-stone-800 text-stone-100 py-4 font-bold tracking-widest hover:bg-stone-700 transition-all">ENTER</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-stone-800 font-['Noto_Serif_KR'] selection:bg-stone-200">
      <NavBar />

      {activeTab === 'HOME' && (
        <div className="pt-24 animate-in fade-in duration-1000">
          <header className="flex flex-col items-center py-16 px-4 text-center">
            <div className="relative mb-10">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100 overflow-hidden">
                <img src="/logo.png" alt="로고" className="w-[85%] h-[85%] object-contain opacity-90" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#F9F7F2] p-2 rounded-full border border-stone-100 shadow-sm">
                <Book size={16} className="text-[#722F37]" />
              </div>
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight mb-4 leading-tight">
                뉴욕·뉴저지 북클럽
              </h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-8 h-[1px] bg-stone-300"></div>
                <p className="text-[#722F37] text-sm font-bold tracking-widest uppercase">Est. 2024</p>
                <div className="w-8 h-[1px] bg-stone-300"></div>
              </div>
              <p className="text-stone-500 italic text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                "마음이 머무는 문장을 기록합니다"
              </p>
            </div>
            
            <div className="flex gap-6 mt-16 border-y border-stone-200 py-5">
              {['ALL', 'NY', 'NJ'].map(loc => (
                <button key={loc} onClick={() => setFilter(loc)} className={`text-[12px] font-bold tracking-wider transition-all px-4 py-1 rounded-full ${filter === loc ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-600'}`}>
                  {loc === 'ALL' ? 'COLLECTION' : loc === 'NY' ? '🍎 NEW YORK' : '🌳 NEW JERSEY'}
                </button>
              ))}
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 mb-40 text-left">
            <div className="flex justify-between items-center mb-16">
              <h3 className="text-2xl font-bold italic text-stone-500 tracking-tight">01. Our Library</h3>
              <button onClick={() => setIsModalOpen(true)} className="text-[12px] font-bold tracking-wider text-[#722F37] uppercase border-2 border-[#722F37]/20 px-6 py-2 rounded-full hover:bg-[#722F37] hover:text-white transition-all">+ Register</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
              {(filter === 'ALL' ? posts : posts.filter(p => p.region === filter)).map(post => (
                <div key={post.id} onClick={async () => { setSelectedPost(post); const {data} = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true }); setComments(data || []); }} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] mb-5 overflow-hidden shadow-xl border border-stone-200 bg-white">
                    <img src={post.image_url} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="cover" />
                  </div>
                  <h4 className="font-bold text-lg mb-1 leading-tight text-stone-900 group-hover:text-[#722F37] transition-colors">{post.title}</h4>
                  <p className="text-[14px] text-stone-500 font-medium italic">{post.author}</p>
                </div>
              ))}
            </div>
          </main>

          <section className="max-w-5xl mx-auto px-6 pb-40 text-left">
             <h3 className="text-2xl font-bold italic text-stone-500 tracking-tight mb-12">02. Monthly Calendar</h3>
             <div className="bg-white p-4 md:p-10 rounded-sm shadow-2xl border border-stone-100">
                <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" events={events} locale="ko" height="auto"
                    dateClick={(arg) => { setNewEvent({...newEvent, start: arg.dateStr}); setIsEventModalOpen(true); }}
                    eventClick={(info) => setSelectedEvent({ ...info.event.extendedProps, title: info.event.title, start: info.event.startStr })}
                    eventContent={(eventInfo) => (
                      <div className="flex flex-col w-full p-1 cursor-pointer">
                        {eventInfo.event.extendedProps.image_url && (
                            <img src={eventInfo.event.extendedProps.image_url} className="w-full h-12 object-cover rounded-sm mb-1 shadow-sm" />
                        )}
                        <div className="text-[10px] font-bold truncate text-white px-1 py-0.5 rounded-sm bg-stone-800/20">
                            {eventInfo.event.extendedProps.region === 'NY' ? '🍎' : '🌳'} {eventInfo.event.title}
                        </div>
                      </div>
                    )}
                />
            </div>
          </section>
        </div>
      )}

      {activeTab === 'REVIEW' && (
        <div className="pt-32 max-w-6xl mx-auto px-6 pb-40 animate-in slide-in-from-bottom-4 duration-1000 text-left">
          <div className="grid lg:grid-cols-5 gap-20">
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-black mb-4 text-stone-900 uppercase tracking-tight">Archive</h2>
                <p className="text-stone-500 mb-12 text-[15px] font-medium italic leading-relaxed">"나만의 문장을 기록합니다."</p>
                <form onSubmit={async (e) => { e.preventDefault(); const {error} = await supabase.from('essays').insert([essayForm]); if(!error){ alert("등록되었습니다."); setEssayForm({title:'', book_title:'', author:'', content:''}); fetchEssays(); } }} className="space-y-6 bg-white p-10 border border-stone-200 shadow-xl">
                    <input type="text" placeholder="제목" required className="w-full bg-transparent border-b border-stone-300 py-3 outline-none focus:border-[#722F37] transition-colors font-bold text-lg" value={essayForm.title} onChange={e => setEssayForm({...essayForm, title: e.target.value})} />
                    <input type="text" placeholder="도서명" required className="w-full bg-transparent border-b border-stone-300 py-3 outline-none font-medium" value={essayForm.book_title} onChange={e => setEssayForm({...essayForm, book_title: e.target.value})} />
                    <input type="text" placeholder="작성자" required className="w-full bg-transparent border-b border-stone-300 py-3 outline-none font-medium" value={essayForm.author} onChange={e => setEssayForm({...essayForm, author: e.target.value})} />
                    <textarea placeholder="생각의 조각들을 남겨주세요..." required className="w-full bg-[#FBFBF9] p-6 h-[450px] outline-none border border-stone-200 focus:bg-white transition-all resize-none leading-[1.8] text-stone-800 text-[16px]" value={essayForm.content} onChange={e => setEssayForm({...essayForm, content: e.target.value})} />
                    <button type="submit" className="w-full bg-stone-900 text-stone-100 py-5 font-bold tracking-widest uppercase hover:bg-stone-800 shadow-lg">Submit</button>
                </form>
            </div>
            <div className="lg:col-span-3">
                <h3 className="text-[12px] font-black tracking-[0.3em] text-stone-400 mb-12 uppercase italic">Collected Memories</h3>
                <div className="space-y-16 max-h-[120vh] overflow-y-auto pr-6 custom-scrollbar pb-20">
                    {essays.map(essay => (
                        <article key={essay.id} className="bg-white p-12 border border-stone-200 shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:border-stone-400 transition-colors">
                            <span className="text-[12px] font-bold text-[#722F37] tracking-widest block mb-4 italic uppercase">Reference: {essay.book_title}</span>
                            <h4 className="text-2xl md:text-3xl font-black mb-8 text-stone-900 leading-tight">{essay.title}</h4>
                            <p className="text-stone-700 leading-[2.1] text-[17px] font-light mb-12 whitespace-pre-wrap">{essay.content}</p>
                            
                            {/* 작성자 정보 시인성 강화 부분 */}
                            <div className="flex justify-between items-center text-[13px] font-bold text-stone-600 tracking-tight pt-8 border-t border-stone-200">
                                <span className="flex items-center gap-4">
                                  <div className="w-10 h-[2px] bg-[#722F37]"></div>
                                  <span className="text-stone-900 font-black">Author: {essay.author}</span>
                                </span>
                                <span className="text-stone-400 font-medium">{new Date(essay.created_at).toLocaleDateString()}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LINKS' && (
        <div className="pt-40 max-w-2xl mx-auto px-6 pb-40 animate-in fade-in duration-1000 text-center">
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase text-stone-900">Forms</h2>
            <p className="text-stone-500 text-lg italic mb-20">"책과 토론 주제들을 언제든지 자유롭게 신청해주세요"</p>
            <div className="space-y-6">
                {[
                  { title: "NJ 책 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLScfhAqUdgJiPqWiFeZZ5rItQJlfNNxp7fmIqL2bK4PfzG8XGQ/viewform" },
                  { title: "NJ 토론 주제 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSeohPLIwspJ5AbE_xAO8CfeNXWTKc8KtS7AHd-4e7igwd2Mxw/viewform" },
                  { title: "NY 책 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSexvlkL-IC6WhLygkDIofNIvusPH5srwsaY8VU3b7B8ut8jQQ/viewform" },
                  { title: "NY 토론 주제 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSfwcCGjpdr3lwjWMC_26pUGuHnATdhFlnkA87rKTMah9xegfA/viewform" }
                ].map((form, idx) => (
                  <div key={idx} onClick={() => window.open(form.url)} className="p-10 bg-white border border-stone-200 shadow-md hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer flex justify-between items-center group">
                    <div className="text-left">
                      <h3 className="font-black text-xl mb-1 group-hover:text-[#722F37] transition-colors">{form.title}</h3>
                      <p className="text-stone-500 text-[13px] font-bold uppercase tracking-wider">Application Form</p>
                    </div>
                    <ChevronRight size={22} className="text-stone-300 group-hover:text-[#722F37] transition-colors" />
                  </div>
                ))}
            </div>
        </div>
      )}

      {/* --- 모달 (가독성 보강) --- */}
      {selectedPost && (
        <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-10 z-[300]" onClick={() => setSelectedPost(null)}>
          <div className="bg-white w-full max-w-6xl h-full md:h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in duration-500" onClick={e => e.stopPropagation()}>
            <div className="h-[40%] md:h-full md:w-1/2 bg-stone-100 flex items-center justify-center p-16 border-r border-stone-200">
              <img src={selectedPost.image_url} className="h-full object-contain shadow-[20px_20px_50px_rgba(0,0,0,0.15)]" alt="cover" />
            </div>
            <div className="h-[60%] md:h-full md:w-1/2 p-12 md:p-20 flex flex-col bg-white relative text-left">
              <button onClick={() => setSelectedPost(null)} className="absolute top-10 right-10 text-stone-400 hover:text-stone-900 transition-colors"><X/></button>
              <h2 className="text-4xl font-black mb-4 leading-tight text-stone-900">{selectedPost.title}</h2>
              <p className="text-2xl text-stone-400 font-light italic mb-12 border-b border-stone-200 pb-8">Written by {selectedPost.author}</p>
              
              <div className="flex-1 overflow-y-auto space-y-10 mb-12 pr-4 custom-scrollbar">
                {comments.map(c => (
                  <div key={c.id} className="relative pl-8 border-l-2 border-[#722F37]/20">
                    <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-[#722F37] -translate-x-1/2"></div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-black text-[13px] tracking-tight text-stone-900 uppercase">{c.author}</span>
                      <div className="flex text-[10px] text-[#722F37]">{"★".repeat(c.rating || 5)}</div>
                    </div>
                    <p className="text-stone-700 font-medium italic text-[17px] leading-relaxed">"{c.content}"</p>
                  </div>
                ))}
              </div>

              <form onSubmit={async (e) => { e.preventDefault(); const {error}=await supabase.from('comments').insert([{post_id:selectedPost.id,...newComment}]); if(!error){ setNewComment({author:'',content:'',rating:5}); const {data}=await supabase.from('comments').select('*').eq('post_id',selectedPost.id).order('created_at',{ascending:true}); setComments(data||[]); } }} className="space-y-6 pt-8 border-t border-stone-200">
                <div className="flex justify-between items-center">
                  <input type="text" placeholder="Name" required value={newComment.author} onChange={e => setNewComment({...newComment, author: e.target.value})} className="bg-transparent font-black text-[13px] uppercase outline-none border-b-2 border-stone-200 w-32 py-1 focus:border-[#722F37] transition-colors" />
                  <div className="flex gap-2">{[1,2,3,4,5].map(num => (<button key={num} type="button" onClick={() => setNewComment({...newComment, rating: num})} className={`text-xl ${newComment.rating >= num ? 'text-[#722F37]' : 'text-stone-200'}`}>★</button>))}</div>
                </div>
                <div className="flex gap-4">
                  <textarea placeholder="Leave a trace..." required value={newComment.content} onChange={e => setNewComment({...newComment, content: e.target.value})} className="flex-1 p-5 bg-stone-50 rounded-sm text-[15px] h-20 outline-none resize-none font-medium border border-stone-100" />
                  <button type="submit" className="bg-stone-900 text-stone-100 px-10 rounded-sm font-black text-[12px] tracking-widest uppercase hover:bg-black transition-colors">Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-stone-900/95 flex items-center justify-center p-4 z-[500]" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl relative text-left overflow-hidden" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-colors"><X size={20}/></button>
            {selectedEvent.image_url && <img src={selectedEvent.image_url} className="w-full h-72 object-cover shadow-inner" alt="event" />}
            <div className="p-12">
                <span className="text-[12px] font-black tracking-widest text-[#722F37] mb-4 block uppercase italic border-b-2 border-[#722F37]/10 pb-2">
                    {selectedEvent.region === 'NY' ? '🍎 Apple NY' : '🌳 Forest NJ'} — {selectedEvent.start}
                </span>
                <h3 className="text-3xl font-black mb-8 leading-tight text-stone-900 tracking-tight">{selectedEvent.title}</h3>
                <p className="text-stone-700 font-medium leading-[1.8] text-[17px] italic border-l-4 border-stone-300 pl-6">{selectedEvent.description || "상세 내용 없음"}</p>
                <button onClick={() => setSelectedEvent(null)} className="w-full mt-12 bg-stone-900 text-white py-5 text-[12px] font-black tracking-widest uppercase hover:bg-black transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 일정/책 추가 모달 */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[450]" onClick={() => setIsEventModalOpen(false)}>
          <div className="bg-white p-12 w-full max-w-lg shadow-2xl relative text-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEventModalOpen(false)} className="absolute top-8 right-8 text-stone-400"><X size={20}/></button>
            <h3 className="text-[14px] font-black tracking-[0.3em] text-stone-400 mb-12 text-center uppercase border-b-2 border-stone-100 pb-4">Schedule Entry</h3>
            <form onSubmit={async (e) => { e.preventDefault(); const {error}=await supabase.from('events').insert([newEvent]); if(!error){ setIsEventModalOpen(false); setNewEvent({title:'',start:'',description:'',region:'NY',image_url:''}); fetchEvents(); } }} className="space-y-8">
              <div className="flex gap-12 justify-center mb-8">
                {['NY', 'NJ'].map(r => (<button key={r} type="button" onClick={() => setNewEvent({...newEvent, region: r})} className={`text-[13px] font-black tracking-widest transition-all ${newEvent.region === r ? 'text-[#722F37] border-b-4 border-[#722F37] pb-1' : 'text-stone-300'}`}>{r === 'NY' ? '🍎 NY' : '🌳 NJ'}</button>))}
              </div>
              <input type="text" placeholder="Title" required className="w-full bg-transparent border-b-2 border-stone-200 py-3 outline-none font-black text-lg focus:border-stone-800" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea placeholder="Description" className="w-full bg-[#FBFBF9] p-5 h-40 outline-none font-medium text-[15px] border border-stone-200" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <input type="text" placeholder="Image Link" className="w-full bg-transparent border-b-2 border-stone-200 py-3 outline-none font-medium" value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
              <button type="submit" className="w-full bg-stone-900 text-white py-5 text-[13px] font-black tracking-widest uppercase hover:bg-black">Save Schedule</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[400]" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-16 w-full max-w-lg shadow-2xl relative text-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-stone-400"><X size={20}/></button>
            <h3 className="text-[14px] font-black tracking-[0.3em] text-stone-400 mb-12 text-center uppercase border-b-2 border-stone-100 pb-4">New Entry</h3>
            <form onSubmit={async (e) => { e.preventDefault(); const {error}=await supabase.from('reviews').insert([formData]); if(!error){ setIsModalOpen(false); setFormData({title:'',author:'',image_url:'',region:'NY'}); fetchPosts(); } }} className="space-y-8">
              <div className="flex gap-12 justify-center mb-8">
                {['NY', 'NJ'].map(r => (<button key={r} type="button" onClick={() => setFormData({...formData, region: r})} className={`text-[13px] font-black tracking-widest transition-all ${formData.region === r ? 'text-[#722F37] border-b-4 border-[#722F37] pb-1' : 'text-stone-300'}`}>{r === 'NY' ? '🍎 NY' : '🌳 NJ'}</button>))}
              </div>
              <input type="text" placeholder="Book Title" required className="w-full bg-transparent border-b-2 border-stone-200 py-3 outline-none font-black text-lg focus:border-stone-800" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="Author" required className="w-full bg-transparent border-b-2 border-stone-200 py-3 outline-none font-medium" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
              <input type="text" placeholder="Cover Image URL" required className="w-full bg-transparent border-b-2 border-stone-200 py-3 outline-none font-medium" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <button type="submit" className="w-full bg-stone-900 text-white py-5 text-[13px] font-black tracking-widest uppercase hover:bg-black">Register Book</button>
            </form>
          </div>
        </div>
      )}
    {/* --- Footer Section: Copyright Disclaimer --- */}
    <footer className="max-w-6xl mx-auto px-6 py-24 border-t border-stone-200 text-center font-['Noto_Serif_KR']">
      <div className="flex justify-center mb-10">
        <img src="/logo.png" className="w-12 h-12 object-contain grayscale opacity-20" alt="footer-logo" />
      </div>
      
      <div className="space-y-4 mb-12">
        <p className="text-[12px] text-stone-600 font-black tracking-[0.2em] uppercase">
          Copyright Disclaimer
        </p>
        <p className="text-[14px] text-stone-500 leading-relaxed max-w-2xl mx-auto font-light italic">
          This website is a non-profit community for book lovers. <br />
          All book covers and images are the property of their respective copyright owners. <br />
          We will <span className="text-stone-800 font-bold underline decoration-stone-200">promptly remove</span> any content upon request from the original holders.
        </p>
        
        {/* 이메일 강조 부분 */}
        <div className="flex items-center justify-center gap-2 mt-6 py-2 px-4 bg-stone-100/50 w-fit mx-auto rounded-full">
          <span className="text-[11px] font-black text-stone-400 uppercase tracking-widest">Inquiry:</span>
          <a 
            href="mailto:your-email@example.com" 
            className="text-[14px] text-[#722F37] font-black hover:underline transition-all underline-offset-4"
          >
            yaboo99mung@gmail.com
          </a>
        </div>
      </div>

      <p className="text-[10px] tracking-[0.4em] text-stone-300 uppercase font-black">
        © 2025 NJ·NY Book Club. All rights reserved.
      </p>
    </footer>
    </div>
  );
}

export default App;