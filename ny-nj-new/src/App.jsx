import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Plus, X, Book, Lock, Calendar as CalendarIcon, Home, PenTool, 
  Link as LinkIcon, FileText, ChevronRight, User, Quote, 
  ImageIcon, Mail, Heart, List, AlignLeft, BookOpen, ChevronLeft, Maximize2
} from 'lucide-react';
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

  const [essayComments, setEssayComments] = useState({});
  const [essayLikes, setEssayLikes] = useState({});
  const [essayCommentInputs, setEssayCommentInputs] = useState({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 
  const [isZoomed, setIsZoomed] = useState(false); 
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isEssayModalOpen, setIsEssayModalOpen] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState(null);

  // image_url_3 추가
  const [formData, setFormData] = useState({ title: '', author: '', image_url: '', image_url_2: '', image_url_3: '', region: 'NY', meeting_date: '', season: '1' });
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
    const { data } = await supabase.from('reviews').select('*').order('season', { ascending: true }).order('meeting_date', { ascending: true });
    if (data) setPosts(data);
  }

  async function fetchEssays() {
    const { data } = await supabase.from('essays').select('*').order('created_at', { ascending: false });
    if (data) {
      setEssays(data);
      if (data.length > 0 && !selectedEssay) setSelectedEssay(data[0]);
      data.forEach(essay => fetchEssayExtras(essay.id));
    }
  }

  async function fetchEssayExtras(essayId) {
    const { data: cData } = await supabase.from('essay_comments').select('*').eq('essay_id', essayId).order('created_at', { ascending: true });
    setEssayComments(prev => ({ ...prev, [essayId]: cData || [] }));
    const { count } = await supabase.from('essay_likes').select('*', { count: 'exact', head: true }).eq('essay_id', essayId);
    setEssayLikes(prev => ({ ...prev, [essayId]: count || 0 }));
  }

  async function handleEssayLike(essayId) {
    const { error } = await supabase.from('essay_likes').insert([{ essay_id: essayId }]);
    if (!error) fetchEssayExtras(essayId);
  }

  async function handleEssayCommentSubmit(essayId) {
    const input = essayCommentInputs[essayId];
    if (!input?.author || !input?.content) { alert("이름과 내용을 입력해주세요."); return; }
    const { error } = await supabase.from('essay_comments').insert([{ essay_id: essayId, author: input.author, content: input.content }]);
    if (!error) {
      setEssayCommentInputs(prev => ({ ...prev, [essayId]: { author: '', content: '' } }));
      fetchEssayExtras(essayId);
    }
  }

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*');
    if (data) {
      const formatted = data.map(ev => ({
        id: ev.id, title: ev.title, start: ev.start, extendedProps: { ...ev },
        backgroundColor: ev.region === 'NY' ? '#722F37' : ev.region === 'NJ' ? '#4A5D4E' : '#9A7B4F',
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

  const BookCard = ({ post }) => (
    <div onClick={async () => { 
      setSelectedPost(post); 
      setCurrentImageIndex(0);
      const {data} = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true }); 
      setComments(data || []); 
    }} className="group cursor-pointer active:scale-[0.98] transition-transform">
      <div className="relative aspect-[2/3] mb-4 overflow-hidden shadow-lg border border-stone-200 bg-white">
        <img src={post.image_url} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="cover" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`px-2 py-1 text-[9px] font-black text-white rounded-sm shadow-md flex items-center gap-1 ${post.region === 'NY' ? 'bg-[#722F37]' : 'bg-[#4A5D4E]'}`}>{post.region === 'NY' ? '🍎 NY' : '🌳 NJ'}</span>
          {post.meeting_date && <span className="bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-stone-800 rounded-sm shadow-sm border border-stone-100">{post.meeting_date}</span>}
        </div>
      </div>
      <h4 className="font-bold text-[15px] mb-0.5 leading-tight text-stone-900 group-hover:text-[#722F37] transition-colors line-clamp-1 tracking-tight">{post.title}</h4>
      <p className="text-[12px] text-stone-400 font-medium italic">{post.author}</p>
    </div>
  );

  const NavBar = () => (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-[200] px-4 md:px-8 h-16 flex items-center justify-between font-['Noto_Serif_KR']">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('HOME')}>
        <img src="/logo.png" className="w-8 h-8 object-contain" alt="mini-logo" />
        <h1 className="text-sm md:text-base font-black tracking-tight text-stone-900 uppercase">NY·NJ <span className="text-[#722F37] font-light italic text-xs md:text-sm">Book club</span></h1>
      </div>
      <div className="flex gap-4 md:gap-8 text-[11px] md:text-[13px] font-bold uppercase text-stone-500">
        {['HOME', 'CALENDAR', 'REVIEW', 'LINKS'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`hover:text-stone-900 transition-colors ${activeTab === tab ? 'text-[#722F37] border-b-2 border-[#722F37] pb-1' : ''}`}>
            {tab === 'HOME' ? 'Library' : tab === 'CALENDAR' ? 'Calendar' : tab === 'REVIEW' ? 'Archive' : 'Form'}
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
          <p className="text-[13px] text-stone-500 font-medium mb-10 text-center">멤버 확인을 위하여 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="Passcode" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full pb-2 bg-transparent border-b border-stone-300 outline-none text-center text-lg font-bold" />
            <button type="submit" className="w-full bg-stone-800 text-stone-100 py-4 font-bold tracking-widest hover:bg-stone-700 transition-all">ENTER</button>
          </form>
        </div>
      </div>
    );
  }

  // 슬라이더 사진 배열 생성 (유효한 링크만 필터링)
  const getSelectedPostImages = () => {
    if (!selectedPost) return [];
    return [selectedPost.image_url, selectedPost.image_url_2, selectedPost.image_url_3].filter(url => url && url.trim() !== "");
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-stone-800 font-['Noto_Serif_KR'] selection:bg-stone-200 overflow-x-hidden">
      <NavBar />

      {activeTab === 'HOME' && (
        <div className="pt-24 animate-in fade-in duration-1000 text-center">
          <header className="flex flex-col items-center py-16 px-4">
            <div className="relative mb-10"><div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100 overflow-hidden"><img src="/logo.png" alt="로고" className="w-[85%] h-[85%] object-contain opacity-90" /></div></div>
            <h2 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight mb-4 leading-tight">뉴욕·뉴저지 북클럽</h2>
            <div className="flex items-center justify-center gap-4 mb-6"><div className="w-8 h-[1px] bg-stone-300"></div><p className="text-[#722F37] text-sm font-bold tracking-widest uppercase">Est. 2024</p><div className="w-8 h-[1px] bg-stone-300"></div></div>
            <p className="text-stone-500 italic text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto">"마음이 머무는 문장을 기록합니다"</p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-16 border-y border-stone-200 py-5 px-4">
              {['ALL', 'NY', 'NJ'].map(loc => (
                <button key={loc} onClick={() => setFilter(loc)} className={`text-[10px] md:text-[12px] font-bold tracking-wider transition-all px-4 py-1 rounded-full ${filter === loc ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-600'}`}>
                  {loc === 'ALL' ? 'COLLECTION' : loc === 'NY' ? '🍎 NEW YORK' : '🌳 NEW JERSEY'}
                </button>
              ))}
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 md:px-6 mb-40 text-left">
            <div className="flex justify-between items-center mb-16">
              <h3 className="text-xl md:text-2xl font-bold italic text-stone-500 tracking-tight">01. Our Library</h3>
              <button onClick={() => setIsModalOpen(true)} className="text-[10px] md:text-[12px] font-bold tracking-wider text-[#722F37] uppercase border-2 border-[#722F37]/20 px-4 md:px-6 py-2 rounded-full hover:bg-[#722F37] hover:text-white transition-all">+ Register</button>
            </div>
            {[...new Set(posts.map(p => p.season))].sort((a, b) => a - b).map(season => {
              const seasonPosts = posts.filter(p => p.season === season);
              const nyPosts = seasonPosts.filter(p => p.region === 'NY');
              const njPosts = seasonPosts.filter(p => p.region === 'NJ');
              if ((filter === 'NY' && nyPosts.length === 0) || (filter === 'NJ' && njPosts.length === 0)) return null;
              return (
                <div key={season} className="mb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 mb-12"><h4 className="text-2xl font-black text-stone-900 uppercase tracking-tighter italic text-left">Season {season}</h4><div className="flex-1 h-[1px] bg-stone-200"></div></div>
                  {filter === 'ALL' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                      <div className="space-y-8"><h5 className="text-[10px] font-black tracking-[0.2em] text-[#722F37] uppercase bg-[#722F37]/5 w-fit px-3 py-1.5 rounded-sm">🍎 New York</h5><div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">{nyPosts.map(post => <BookCard key={post.id} post={post} />)}</div></div>
                      <div className="space-y-8 lg:border-l lg:pl-16 border-stone-100"><h5 className="text-[10px] font-black tracking-[0.2em] text-[#4A5D4E] uppercase bg-[#4A5D4E]/5 w-fit px-3 py-1.5 rounded-sm">🌳 New Jersey</h5><div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">{njPosts.map(post => <BookCard key={post.id} post={post} />)}</div></div>
                    </div>
                  ) : <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">{(filter === 'NY' ? nyPosts : njPosts).map(post => <BookCard key={post.id} post={post} />)}</div>}
                </div>
              );
            })}
          </main>
        </div>
      )}

      {activeTab === 'CALENDAR' && (
        <div className="pt-32 max-w-7xl mx-auto px-4 md:px-6 pb-40 text-left animate-in fade-in duration-700 text-left">
            <h3 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3 mb-12">
              <CalendarIcon className="text-[#722F37]" /> MONTHLY CALENDAR
            </h3>
            <div className="bg-white p-2 md:p-10 rounded-sm shadow-2xl border border-stone-100 overflow-hidden text-center text-center">
                <FullCalendar 
                  plugins={[dayGridPlugin, interactionPlugin]} 
                  initialView="dayGridMonth" 
                  events={events} 
                  locale="ko" 
                  height="auto" 
                  aspectRatio={window.innerWidth < 768 ? 0.8 : 1.35}
                  dateClick={(arg) => { setNewEvent({...newEvent, start: arg.dateStr}); setIsEventModalOpen(true); }}
                  eventClick={(info) => setSelectedEvent({ ...info.event.extendedProps, title: info.event.title, start: info.event.startStr })}
                  eventContent={(eventInfo) => (
                    <div className="flex flex-col w-full p-0.5 md:p-1 cursor-pointer overflow-hidden text-left h-full rounded shadow-sm" style={{ backgroundColor: eventInfo.event.backgroundColor }}>
                      {eventInfo.event.extendedProps.image_url && <img src={eventInfo.event.extendedProps.image_url} className="w-full h-20 md:h-28 object-contain bg-white/10 rounded-sm mb-1" />}
                      <div className="text-[8px] md:text-[10px] font-bold truncate text-white px-1">{eventInfo.event.title}</div>
                    </div>
                  )}
                />
            </div>
        </div>
      )}

      {activeTab === 'REVIEW' && (
        <div className="pt-24 max-w-[1500px] mx-auto px-4 md:px-8 pb-20 animate-in fade-in duration-700 min-h-screen flex flex-col font-['Noto_Serif_KR']">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="text-left text-left">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-3"><PenTool size={22} className="text-[#722F37]" /> ARCHIVE</h2>
              <p className="text-stone-500 text-[13px] mt-1 italic">우리의 문장이 머무는 기록의 공간</p>
            </div>
            <button onClick={() => setIsEssayModalOpen(true)} className="px-5 py-2.5 bg-stone-900 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-[#722F37] transition-all shadow-md flex items-center gap-2"><Plus size={14} /> New Essay</button>
          </div>
          <div className="flex flex-col lg:flex-row gap-0 border border-stone-200 bg-white shadow-xl rounded-sm overflow-hidden flex-1 min-h-[650px]">
            <aside className="lg:w-72 border-r border-stone-100 flex flex-col bg-stone-50/30">
              <div className="p-3 bg-stone-100/50 border-b border-stone-100 text-[10px] font-black tracking-widest text-stone-400 uppercase flex items-center gap-2"><AlignLeft size={12}/> Memory Index</div>
              <div className="flex-1 overflow-y-auto custom-scrollbar -webkit-overflow-scrolling-touch text-left">
                {essays.map((essay) => (
                  <div key={essay.id} onClick={() => setSelectedEssay(essay)} className={`p-5 border-b border-stone-100 cursor-pointer transition-all hover:bg-white group text-left ${selectedEssay?.id === essay.id ? 'bg-white border-l-4 border-l-[#722F37]' : ''}`}>
                    <span className="text-[9px] font-bold text-[#722F37] tracking-widest block mb-1.5 uppercase opacity-60">{essay.book_title}</span>
                    <h4 className={`text-[14px] font-black leading-tight group-hover:text-[#722F37] ${selectedEssay?.id === essay.id ? 'text-[#722F37]' : 'text-stone-800'}`}>{essay.title}</h4>
                    <span className="text-[10px] text-stone-400 font-medium italic mt-2.5 block">by {essay.author}</span>
                  </div>
                ))}
              </div>
            </aside>
            <main className="flex-1 bg-white p-6 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar text-left relative text-left">
              {selectedEssay ? (
                <article className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
                  <header className="mb-10 text-left text-left">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#722F37] tracking-[0.2em] uppercase mb-3"><BookOpen size={14} /> <span>Reference: {selectedEssay.book_title}</span></div>
                    <h3 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight tracking-tight mb-6">{selectedEssay.title}</h3>
                    <div className="flex items-center gap-5 py-5 border-y border-stone-100 font-bold text-stone-800 text-left">Author: {selectedEssay.author}<span className="text-[11px] text-stone-400 font-medium italic ml-auto">{new Date(selectedEssay.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                  </header>
                  <p className="text-stone-700 leading-[2.1] text-[15px] md:text-[17px] font-light whitespace-pre-wrap break-keep font-serif mb-20">{selectedEssay.content}</p>
                  <footer className="mt-16 pt-8 border-t border-stone-100">
                    <button onClick={() => handleEssayLike(selectedEssay.id)} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 text-stone-400 mb-8"><Heart size={16} className={essayLikes[selectedEssay.id] > 0 ? "fill-red-500 text-red-500" : ""} /> <span className="text-xs font-bold">{essayLikes[selectedEssay.id] || 0}</span></button>
                    <div className="space-y-4 mb-8">{(essayComments[selectedEssay.id] || []).map(comm => (<div key={comm.id} className="bg-stone-50/50 p-3.5 rounded-sm border-l-2 border-stone-200 text-left"><span className="text-[11px] font-black text-stone-900 uppercase block mb-1">{comm.author}</span><p className="text-[12px] text-stone-600 font-medium leading-relaxed italic">"{comm.content}"</p></div>))}</div>
                    <div className="flex flex-col md:flex-row gap-2 p-2 bg-stone-100/50 rounded-lg text-left">
                      <input type="text" placeholder="성함" className="w-full md:w-24 bg-white px-3 py-2 text-[11px] font-black outline-none border border-stone-200 rounded" value={essayCommentInputs[selectedEssay.id]?.author || ''} onChange={e => setEssayCommentInputs(prev => ({ ...prev, [selectedEssay.id]: { ...prev[selectedEssay.id], author: e.target.value } }))} />
                      <input type="text" placeholder="따뜻한 한마디..." className="flex-1 bg-white px-3 py-2 text-[11px] outline-none border border-stone-200 rounded" value={essayCommentInputs[selectedEssay.id]?.content || ''} onChange={e => setEssayCommentInputs(prev => ({ ...prev, [selectedEssay.id]: { ...prev[selectedEssay.id], content: e.target.value } }))} onKeyPress={e => e.key === 'Enter' && handleEssayCommentSubmit(selectedEssay.id)} />
                      <button onClick={() => handleEssayCommentSubmit(selectedEssay.id)} className="px-5 py-2 bg-stone-900 text-white text-[10px] font-black uppercase hover:bg-[#722F37] transition-all rounded">POST</button>
                    </div>
                  </footer>
                </article>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-200 text-center">
                   <BookOpen size={40} className="mb-4 opacity-10" />
                   <p className="italic text-xs">목록에서 글을 선택해주세요.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {activeTab === 'LINKS' && (
        <div className="pt-40 max-w-2xl mx-auto px-6 pb-40 animate-in fade-in duration-1000 text-center text-center">
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase text-stone-900">Forms</h2>
            <p className="text-stone-500 text-base md:text-lg italic mb-20">"책과 토론 주제들을 언제든지 자유롭게 신청해주세요"</p>
            <div className="space-y-4 text-left text-left">
                {[
                  { title: "NJ 책 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLScfhAqUdgJiPqWiFeZZ5rItQJlfNNxp7fmIqL2bK4PfzG8XGQ/viewform" },
                  { title: "NJ 토론 주제 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSeohPLIwspJ5AbE_xAO8CfeNXWTKc8KtS7AHd-4e7igwd2Mxw/viewform" },
                  { title: "NJ 소모임 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSePt2INF-gJEHdvFED5KVxEuUYMZskDnIPjmb2hFg_dSvq4og/viewform" },
                  { title: "NY 책 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSexvlkL-IC6WhLygkDIofNIvusPH5srwsaY8VU3b7B8ut8jQQ/viewform" },
                  { title: "NY 토론 주제 신청", url: "https://docs.google.com/forms/d/e/1FAIpQLSfwcCGjpdr3lwjWMC_26pUGuHnATdhFlnkA87rKTMah9xegfA/viewform" },
                  { title: "소모임 신청", url: "https://forms.gle/1cUkfwja7R1kiYhz5" }
                ].map((form, idx) => (
                  <div key={idx} onClick={() => window.open(form.url)} className="p-6 md:p-10 bg-white border border-stone-200 shadow-md hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer flex justify-between items-center group rounded-sm text-left text-left text-left">
                    <div><h3 className="font-black text-lg md:text-xl mb-1 group-hover:text-[#722F37] transition-colors">{form.title}</h3><p className="text-stone-500 text-[11px] font-bold uppercase tracking-wider">Application Form</p></div><ChevronRight size={22} className="text-stone-300 group-hover:text-[#722F37]" />
                  </div>
                ))}
            </div>
        </div>
      )}

      {isZoomed && selectedPost && (
        <div 
          className="fixed inset-0 z-[600] bg-stone-900/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <img 
            src={getSelectedPostImages()[currentImageIndex]} 
            className="max-w-full max-h-full object-contain shadow-2xl"
            alt="zoomed-image"
          />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={40} />
          </button>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-10 z-[300]" onClick={() => setSelectedPost(null)}>
          <div className="bg-white w-full max-w-7xl h-full md:h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in duration-500" onClick={e => e.stopPropagation()}>
            <div className="h-[50%] md:h-full md:w-[55%] bg-[#FBFBF9] flex flex-col items-center justify-center p-6 md:p-10 border-r border-stone-100 relative text-center text-center">
                <div className="relative group flex flex-col items-center w-full h-full justify-center">
                  <div className="relative cursor-zoom-in group/img" onClick={() => setIsZoomed(true)}>
                    <img 
                      src={getSelectedPostImages()[currentImageIndex]} 
                      className="max-h-[50vh] md:max-h-[70vh] w-auto object-contain shadow-[20px_40px_80px_rgba(0,0,0,0.3)] transition-all duration-500" 
                      alt="cover" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/5 rounded">
                       <Maximize2 className="text-white" size={32} />
                    </div>
                  </div>
                  
                  {/* 세 장 이상의 슬라이드 로직 지원 */}
                  {getSelectedPostImages().length > 1 && (
                    <div className="flex gap-10 mt-6 mb-2">
                      <button 
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + getSelectedPostImages().length) % getSelectedPostImages().length)} 
                        className="p-2 rounded-full transition-all text-stone-300 hover:text-stone-500 bg-stone-100/50"
                      >
                        <ChevronLeft size={30}/>
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % getSelectedPostImages().length)} 
                        className="p-2 rounded-full transition-all text-stone-300 hover:text-stone-500 bg-stone-100/50"
                      >
                        <ChevronRight size={30}/>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col items-center mt-4 text-center">
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`text-[10px] font-black tracking-[0.2em] px-3 py-1.5 border ${selectedPost.region === 'NY' ? 'border-[#722F37] text-[#722F37]' : 'border-[#4A5D4E] text-[#4A5D4E]'}`}>{selectedPost.region === 'NY' ? 'NEW YORK' : 'NEW JERSEY'}</span>
                      <div className="w-[1px] h-3 bg-stone-300"></div>
                      <span className="text-[10px] font-black tracking-[0.2em] text-stone-400">SEASON {selectedPost.season}</span>
                    </div>
                    {selectedPost.meeting_date && <p className="text-[14px] font-black tracking-[0.1em] text-stone-800 uppercase">{selectedPost.meeting_date}</p>}
                  </div>
                </div>
            </div>
            <div className="h-[50%] md:h-full md:w-[45%] p-8 md:p-12 flex flex-col bg-white relative text-left text-left text-left">
              <button onClick={() => setSelectedPost(null)} className="absolute top-10 right-10 text-stone-300 hover:text-stone-900 transition-colors"><X size={24}/></button>
              <div className="mb-6 text-left">
                <h2 className="text-xl md:text-2xl font-black mb-2 leading-tight">{selectedPost.title}</h2>
                <p className="text-sm text-stone-400 font-light italic border-b pb-4">Written by {selectedPost.author}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar -webkit-overflow-scrolling-touch text-left text-left text-left text-left text-left text-left">
                {comments.length > 0 ? comments.map(c => (
                  <div key={c.id} className="relative pl-6 border-l border-stone-100 text-left">
                    <div className="absolute left-[-1px] top-0 w-[1px] h-6 bg-[#722F37]"></div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-[11px] tracking-tight text-stone-900 uppercase">{c.author}</span>
                        <div className="flex text-[7px] text-[#722F37] gap-0.5">{"★".repeat(c.rating || 5)}</div>
                    </div>
                    <p className="text-stone-600 font-medium italic text-[13px] leading-relaxed break-keep">"{c.content}"</p>
                  </div>
                )) : <div className="h-full flex items-center justify-center text-stone-200 italic text-xs">첫 번째 소감을 남겨주세요.</div>}
              </div>

              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const {error} = await supabase.from('comments').insert([{post_id: selectedPost.id, ...newComment}]); 
                if(!error){ 
                  setNewComment({author:'', content:'', rating:5}); 
                  const {data} = await supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', {ascending:true}); 
                  setComments(data || []); 
                } 
              }} className="space-y-4 pt-6 border-t border-stone-100 text-left">
                <div className="flex justify-between items-center text-left">
                  <input type="text" placeholder="NAME" required value={newComment.author} onChange={e => setNewComment({...newComment, author: e.target.value})} className="bg-transparent font-black text-[10px] tracking-widest outline-none border-b border-stone-200 w-24 py-1 focus:border-[#722F37] text-left" />
                  <div className="flex gap-1">{[1,2,3,4,5].map(num => (<button key={num} type="button" onClick={() => setNewComment({...newComment, rating: num})} className={`text-lg transition-all hover:scale-110 ${newComment.rating >= num ? 'text-[#722F37]' : 'text-stone-200'}`}>★</button>))}</div>
                </div>
                <div className="flex gap-3">
                  <textarea placeholder="생각을 남겨주세요..." required value={newComment.content} onChange={e => setNewComment({...newComment, content: e.target.value})} className="flex-1 p-3 bg-stone-50 rounded-sm text-[13px] h-20 outline-none resize-none font-medium border border-stone-100 focus:bg-white transition-all text-left text-left text-left text-left" />
                  <button type="submit" className="bg-stone-900 text-white px-5 rounded-sm font-black text-[10px] tracking-[0.1em] uppercase hover:bg-black transition-colors">POST</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-stone-900/95 flex items-center justify-center p-4 z-[500]" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl relative text-left overflow-hidden animate-in zoom-in duration-300 text-left text-left text-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 text-white bg-black/40 rounded-full hover:bg-black/60 z-10 transition-colors"><X size={18}/></button>
            {selectedEvent.image_url && <img src={selectedEvent.image_url} className="w-full h-auto max-h-[60vh] object-contain bg-stone-100 shadow-inner" alt="event-cover" />}
            <div className="p-10 text-left text-left text-left">
                <span className="text-[11px] font-black tracking-widest mb-2 block uppercase italic border-b border-stone-100 pb-2" 
                      style={{ color: selectedEvent.region === 'NY' ? '#722F37' : selectedEvent.region === 'NJ' ? '#4A5D4E' : '#9A7B4F' }}>{selectedEvent.region} — {selectedEvent.start}</span>
                <h3 className="text-2xl font-black mb-6 leading-tight text-stone-900">{selectedEvent.title}</h3>
                <p className="text-stone-700 font-medium leading-[1.8] text-[16px] italic border-l-4 border-stone-300 pl-4 bg-stone-50/50 py-2">{selectedEvent.description || "상세 내용 없음"}</p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[400]" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-10 w-full max-w-lg shadow-2xl relative text-left rounded-sm text-left text-left text-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-stone-400"><X size={20}/></button>
            <h3 className="text-[12px] font-black tracking-[0.2em] text-stone-400 mb-8 text-center uppercase border-b border-stone-100 pb-4 text-center text-center text-center text-center">New Book Entry</h3>
            <form onSubmit={async (e) => { e.preventDefault(); const {error}=await supabase.from('reviews').insert([formData]); if(!error){ setIsModalOpen(false); setFormData({title:'',author:'',image_url:'',image_url_2:'',image_url_3:'',region:'NY',meeting_date:'',season:'1'}); fetchPosts(); } }} className="space-y-6">
              <div className="flex gap-8 justify-center mb-6 text-center text-center">{['NY', 'NJ'].map(r => (<button key={r} type="button" onClick={() => setFormData({...formData, region: r})} className={`text-[12px] font-black tracking-widest transition-all ${formData.region === r ? 'text-[#722F37] border-b-2 border-[#722F37] pb-1' : 'text-stone-300'}`}>{r}</button>))}</div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1 text-left text-left text-left text-left text-left"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Season</label><input type="number" className="w-full bg-transparent border-b border-stone-200 py-1 outline-none font-bold text-base text-left" value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} /></div><div className="space-y-1 text-left text-left text-left text-left text-left"><label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Meeting Date</label><input type="date" required className="w-full bg-transparent border-b border-stone-200 py-1 outline-none font-bold text-sm text-left" value={formData.meeting_date} onChange={e => setFormData({...formData, meeting_date: e.target.value})} /></div></div>
              <input type="text" placeholder="Book Title" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-black text-base text-left" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="Author" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-medium text-sm text-left" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
              <input type="text" placeholder="Main Image URL" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-medium text-sm text-left" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <input type="text" placeholder="Second Image URL (Optional)" className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-medium text-sm text-left" value={formData.image_url_2} onChange={e => setFormData({...formData, image_url_2: e.target.value})} />
              <input type="text" placeholder="Third Image URL (Optional)" className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-medium text-sm text-left" value={formData.image_url_3} onChange={e => setFormData({...formData, image_url_3: e.target.value})} />
              <button type="submit" className="w-full bg-stone-900 text-white py-4 text-[12px] font-black tracking-widest uppercase hover:bg-black shadow-lg transition-all">Register</button>
            </form>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[450]" onClick={() => setIsEventModalOpen(false)}>
          <div className="bg-white p-8 w-full max-w-lg shadow-2xl relative text-left rounded-sm text-left text-left text-left text-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEventModalOpen(false)} className="absolute top-6 right-6 text-stone-400"><X size={20}/></button>
            <h3 className="text-[12px] font-black tracking-[0.2em] text-stone-400 mb-8 text-center uppercase border-b border-stone-100 pb-4 text-center text-center text-center text-center text-center">Schedule Entry</h3>
            <form onSubmit={async (e) => { e.preventDefault(); const {error}=await supabase.from('events').insert([newEvent]); if(!error){ setIsEventModalOpen(false); setNewEvent({title:'',start:'',description:'',region:'NY',image_url:''}); fetchEvents(); } }} className="space-y-6">
              <div className="flex gap-6 justify-center mb-6 text-center text-center text-center text-center">
                {['NY', 'NJ', 'GROUP'].map(r => (<button key={r} type="button" onClick={() => setNewEvent({...newEvent, region: r})} className={`text-[11px] font-black tracking-widest px-3 py-1 transition-all ${newEvent.region === r ? 'text-[#722F37] border-b-2 border-[#722F37]' : 'text-stone-300'}`}>{r === 'NY' ? '🍎 NY' : r === 'NJ' ? '🌳 NJ' : '👥 소모임'}</button>))}
              </div>
              <input type="text" placeholder="Title" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-black text-base text-left" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} /><textarea placeholder="Description" className="w-full bg-[#FBFBF9] p-4 h-32 outline-none font-medium text-[14px] border border-stone-200 text-left text-left text-left text-left text-left text-left" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} /><input type="text" placeholder="Image Link" className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-medium text-sm text-left" value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} /><button type="submit" className="w-full bg-stone-900 text-white py-4 text-[12px] font-black tracking-widest uppercase hover:bg-black shadow-lg transition-all">Save</button>
            </form>
          </div>
        </div>
      )}

      {isEssayModalOpen && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[400]" onClick={() => setIsEssayModalOpen(false)}>
          <div className="bg-white p-8 md:p-10 w-full max-w-2xl shadow-2xl relative text-left rounded-sm animate-in zoom-in duration-300 text-left text-left text-left text-left text-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEssayModalOpen(false)} className="absolute top-6 right-6 text-stone-300 hover:text-stone-900"><X size={20}/></button>
            <div className="text-center mb-8 text-center text-center text-center text-center"><PenTool size={24} className="mx-auto text-[#722F37] mb-3" /><h3 className="text-lg font-black tracking-[0.2em] text-stone-800 uppercase text-center text-center text-center text-center text-center text-center text-center">New Essay Entry</h3></div>
            <form onSubmit={async (e) => { e.preventDefault(); const {error} = await supabase.from('essays').insert([essayForm]); if(!error){ alert("등록되었습니다."); setEssayForm({title:'', book_title:'', author:'', content:''}); setIsEssayModalOpen(false); fetchEssays(); } }} className="space-y-5 text-left text-left text-left text-left text-left">
              <input type="text" placeholder="제목" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none font-bold text-lg text-left" value={essayForm.title} onChange={e => setEssayForm({...essayForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="[모임 시즌 / 도서명]" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none text-sm font-medium text-left" value={essayForm.book_title} onChange={e => setEssayForm({...essayForm, book_title: e.target.value})} /><input type="text" placeholder="작성자" required className="w-full bg-transparent border-b border-stone-200 py-2 outline-none text-sm font-medium text-left" value={essayForm.author} onChange={e => setEssayForm({...essayForm, author: e.target.value})} /></div>
              <textarea placeholder="각자의 생각을 기록해주세요..." required className="w-full bg-stone-50 p-5 h-[350px] outline-none border border-stone-100 focus:bg-white transition-all resize-none text-sm leading-relaxed text-left text-left text-left text-left text-left" value={essayForm.content} onChange={e => setEssayForm({...essayForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-stone-900 text-white py-4 font-bold tracking-widest uppercase hover:bg-[#722F37] text-xs transition-all shadow-md">Register</button>
            </form>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-6 py-24 border-t border-stone-200 text-center font-['Noto_Serif_KR']">
        <div className="flex justify-center mb-10"><img src="/logo.png" className="w-12 h-12 object-contain grayscale opacity-20" alt="footer-logo" /></div>
        <div className="space-y-4 mb-12 text-center text-center text-center text-center text-center">
          <p className="text-[12px] text-stone-600 font-black tracking-[0.2em] uppercase text-center text-center text-center text-center text-center text-center">Copyright Disclaimer</p>
          <p className="text-[13px] md:text-[14px] text-stone-500 leading-relaxed max-w-2xl mx-auto font-light italic text-center text-center text-center text-center text-center text-center">
            This website is a non-profit community for book lovers. <br />
            All book covers and images are the property of their respective copyright owners. <br />
            We will <span className="text-stone-800 font-bold underline decoration-stone-200">promptly remove</span> any content upon request.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 py-2 px-4 bg-stone-100/50 w-fit mx-auto rounded-full text-center text-center text-center text-center text-center"><Mail size={14} className="text-stone-400" /><a href="mailto:yaboo99mung@gmail.com" className="text-[13px] text-[#722F37] font-black">yaboo99mung@gmail.com</a></div>
        </div>
        <p className="text-[9px] tracking-[0.4em] text-stone-300 uppercase font-black text-center text-center text-center text-center text-center text-center text-center">© 2025 NJ·NY Book Club. All rights reserved.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar { -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .fc .fc-daygrid-day-frame { min-height: 140px !important; }
        .fc-event { border: none !important; }
        @media (max-width: 768px) { .fc .fc-daygrid-day-frame { min-height: 110px !important; } }
        .break-keep { word-break: keep-all; }
      `}} />
    </div>
  );
}

export default App;