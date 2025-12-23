import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Book, Lock, Calendar as CalendarIcon } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Supabase 설정
const SUPABASE_URL = 'https://psdrakjfbumzmwbpzwkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IWQriti-EmIH4ekLRuLfmg_16fLyZY0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); 
  
  const [newComment, setNewComment] = useState({ author: '', content: '', rating: 5 });
  const [formData, setFormData] = useState({ title: '', author: '', image_url: '', region: 'NY' });
  const [newEvent, setNewEvent] = useState({ title: '', start: '', description: '', region: 'NY', image_url: '' });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const CORRECT_PASSWORD = "5557";

  useEffect(() => { 
    if (isLoggedIn) {
      fetchPosts();
      fetchEvents();
    }
  }, [isLoggedIn]);

  async function fetchPosts() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  async function fetchComments(postId) {
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (data) setComments(data);
  }

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*');
    if (data) {
      const formatted = data.map(ev => ({
        title: `${ev.region === 'NY' ? '🍎' : '🌳'} ${ev.title}`,
        start: ev.start,
        extendedProps: { 
          description: ev.description, 
          region: ev.region,
          image_url: ev.image_url 
        },
        backgroundColor: ev.region === 'NY' ? '#D32F2F' : '#388E3C',
        borderColor: 'transparent'
      }));
      setEvents(formatted);
    }
  }

  async function handleEventSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.from('events').insert([newEvent]);
    if (error) alert("일정 저장 실패!");
    else {
      alert("일정이 등록되었습니다.");
      setIsEventModalOpen(false);
      setNewEvent({ title: '', start: '', description: '', region: 'NY', image_url: '' });
      fetchEvents();
    }
  }

  const handleDateClick = (arg) => {
    setNewEvent({ ...newEvent, start: arg.dateStr });
    setIsEventModalOpen(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([formData]);
    if (error) alert("에러 발생!");
    else {
      alert("책이 추가되었습니다.");
      setIsModalOpen(false);
      setFormData({ title: '', author: '', image_url: '', region: 'NY' });
      fetchPosts();
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.author || !newComment.content) return;
    const { error } = await supabase.from('comments').insert([
      { post_id: selectedPost.id, author: newComment.author, content: newComment.content, rating: newComment.rating }
    ]);
    if (error) alert("저장 실패!");
    else {
      setNewComment({ author: '', content: '', rating: 5 });
      fetchComments(selectedPost.id);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) setIsLoggedIn(true);
    else { alert("비밀번호가 올바르지 않습니다."); setPasswordInput(""); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl max-w-sm w-full border border-orange-100 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D32F2F]"><Lock size={28} /></div>
          <h1 className="text-xl font-black mb-6 text-slate-800 tracking-tight">뉴욕·뉴저지 북클럽</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="password" placeholder="비밀번호" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-center text-lg font-bold border border-transparent focus:border-orange-200 transition-all" />
            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">입장하기</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-800 pb-10">
      {/* Header - 모달 높이 및 여백 조정 */}
      <header className="flex flex-col items-center pt-10 pb-6 px-4">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm mb-6 border border-orange-100 flex flex-row items-center gap-5 md:gap-8">
          <img src="/logo.png" alt="로고" className="w-16 h-16 md:w-24 md:h-24 object-contain" />
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight">
            뉴욕·뉴저지<br/><span className="text-[#D32F2F]">북클럽</span>
          </h1>
        </div>
        <p className="text-slate-500 italic font-serif text-sm md:text-lg mb-6">"마음이 머무는 문장을 기록합니다"</p>

        {/* 필터 버튼 모바일 대응 (가로 스크롤 방지 및 크기 최적화) */}
        <div className="flex justify-center gap-1.5 p-1 bg-white rounded-full border border-orange-50 shadow-sm overflow-hidden">
          {['ALL', 'NY', 'NJ'].map((loc) => (
            <button 
              key={loc} 
              onClick={() => setFilter(loc)} 
              className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all ${
                filter === loc ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'
              }`}
            >
              {loc === 'ALL' && '📚 전체'}
              {loc === 'NY' && '🍎 뉴욕'}
              {loc === 'NJ' && '🌳 뉴저지'}
            </button>
          ))}
        </div>
      </header>

      {/* --- 1. Library Section (반응형 그리드) --- */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold italic flex items-center gap-2"><Book size={20} className="text-[#D32F2F]"/> Library</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#D32F2F] text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-bold shadow-lg flex items-center gap-1 text-sm"><Plus size={18}/> 새 책</button>
        </div>
        
        {/* 모바일 2열, 태블릿 3열, PC 4열 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-10">
          {(filter === 'ALL' ? posts : posts.filter(p => p.region === filter)).map(post => (
            <div key={post.id} onClick={() => { setSelectedPost(post); fetchComments(post.id); }} className="group cursor-pointer">
              <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-xl shadow-sm border border-orange-50">
                <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="cover" />
              </div>
              <h3 className="font-bold text-sm md:text-lg truncate">{post.title}</h3>
              <p className="text-[10px] md:text-sm text-slate-400">{post.author}</p>
            </div>
          ))}
        </div>
      </main>

      {/* --- 2. Calendar Section --- */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-10">
        <h2 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-2 italic">
          <CalendarIcon size={20} className="text-[#D32F2F]"/> Calendar
        </h2>
        <div className="bg-white p-3 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-orange-50 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale="ko"
            height="auto"
            dateClick={handleDateClick}
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: ''
            }}
            eventContent={(eventInfo) => (
              <div className="flex flex-col w-full p-0.5 overflow-hidden cursor-pointer">
                {eventInfo.event.extendedProps.image_url && (
                  <img src={eventInfo.event.extendedProps.image_url} className="hidden md:block w-full h-16 object-cover rounded-md mb-1" />
                )}
                <div className="text-[8px] md:text-[10px] font-bold truncate px-0.5 text-white">
                  {eventInfo.event.title}
                </div>
              </div>
            )}
            eventClick={(info) => {
              setSelectedEvent({
                title: info.event.title,
                start: info.event.startStr,
                description: info.event.extendedProps.description,
                region: info.event.extendedProps.region,
                image_url: info.event.extendedProps.image_url
              });
            }}
          />
        </div>
      </section>

      {/* --- 일정 상세보기 모달 (모바일 최적화) --- */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-[120]" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-t-[2rem] md:rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 bg-black/10 rounded-full z-10"><X size={20}/></button>
            {selectedEvent.image_url && <img src={selectedEvent.image_url} className="w-full h-48 md:h-56 object-cover" />}
            <div className="p-6 md:p-10 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white ${selectedEvent.region === 'NY' ? 'bg-[#D32F2F]' : 'bg-[#388E3C]'}`}>
                  {selectedEvent.region === 'NY' ? '🍎 NY' : '🌳 NJ'}
                </span>
                <span className="text-xs text-slate-400 font-bold">{selectedEvent.start}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4">{selectedEvent.title}</h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">{selectedEvent.description || "상세 내용 없음"}</p>
              <button onClick={() => setSelectedEvent(null)} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 책 상세보기 모달 (전체화면급 대응) --- */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-0 md:p-4 z-[100]" onClick={() => setSelectedPost(null)}>
          <div className="bg-white md:rounded-[2.5rem] w-full max-w-5xl h-full md:h-[85vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="h-2/5 md:h-full md:w-5/12 bg-slate-100 flex items-center justify-center p-6 relative">
                <button onClick={() => setSelectedPost(null)} className="md:hidden absolute top-4 right-4 p-2 bg-black/10 rounded-full text-white"><X/></button>
                <img src={selectedPost.image_url} className="h-full object-contain rounded shadow-lg" alt="cover" />
            </div>
            <div className="h-3/5 md:h-full md:w-7/12 p-6 md:p-10 flex flex-col bg-white relative text-left">
                <button onClick={() => setSelectedPost(null)} className="hidden md:block absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full"><X/></button>
                <h2 className="text-xl md:text-2xl font-bold truncate">{selectedPost.title}</h2>
                <p className="text-sm text-slate-400 mb-4 border-b pb-2">{selectedPost.author}</p>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 custom-scrollbar">
                  {comments.length > 0 ? comments.map(c => (
                    <div key={c.id} className="bg-orange-50/50 p-4 rounded-xl border-l-4 border-red-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 text-[10px]">{"★".repeat(c.rating || 5)}</span>
                        <span className="font-bold text-xs text-slate-700">{c.author}</span>
                      </div>
                      <p className="text-sm text-slate-600 italic">"{c.content}"</p>
                    </div>
                  )) : <p className="text-center text-slate-300 py-10">첫 리뷰를 남겨보세요!</p>}
                </div>

                <form onSubmit={handleAddComment} className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                      <input type="text" placeholder="작성자" required value={newComment.author} onChange={e => setNewComment({...newComment, author: e.target.value})} className="bg-transparent font-bold text-xs outline-none border-b border-slate-200 w-20" />
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button key={num} type="button" onClick={() => setNewComment({...newComment, rating: num})} className={`text-lg ${newComment.rating >= num ? 'text-yellow-400' : 'text-slate-200'}`}>★</button>
                        ))}
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <textarea placeholder="기록하기..." required value={newComment.content} onChange={e => setNewComment({...newComment, content: e.target.value})} className="flex-1 p-2 bg-white rounded-lg text-xs h-16 outline-none resize-none border border-slate-100" />
                      <button type="submit" className="bg-slate-900 text-white px-4 rounded-lg font-bold text-xs">기록</button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* --- 공통 입력 모달 (책 추가 / 일정 추가) --- */}
      {(isModalOpen || isEventModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-[130]">
          <div className="bg-white rounded-t-[2rem] md:rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">{isModalOpen ? '새 책 추가' : '새 일정 추가'}</h3>
              <button onClick={() => { setIsModalOpen(false); setIsEventModalOpen(false); }}><X /></button>
            </div>
            {/* 폼 구성 요소들 (기존 로직 유지) */}
            <form onSubmit={isModalOpen ? handleSubmit : handleEventSubmit} className="space-y-4 text-left">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                {['NY', 'NJ'].map(r => (
                  <button key={r} type="button" 
                    onClick={() => isModalOpen ? setFormData({...formData, region: r}) : setNewEvent({...newEvent, region: r})}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${(isModalOpen ? formData.region : newEvent.region) === r ? 'bg-white shadow-sm' : 'text-slate-400'}`}>
                    {r === 'NY' ? '🍎 뉴욕' : '🌳 뉴저지'}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="제목" required className="w-full p-3 bg-slate-50 rounded-xl outline-none text-sm" 
                value={isModalOpen ? formData.title : newEvent.title}
                onChange={e => isModalOpen ? setFormData({...formData, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})} />
              <textarea placeholder="내용/설명" className="w-full p-3 bg-slate-50 rounded-xl outline-none text-sm h-24" 
                value={isModalOpen ? "" : newEvent.description}
                onChange={e => isModalOpen ? setFormData({...formData, author: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})} />
              <input type="text" placeholder="이미지 URL" required className="w-full p-3 bg-slate-50 rounded-xl outline-none text-sm" 
                value={isModalOpen ? formData.image_url : newEvent.image_url}
                onChange={e => isModalOpen ? setFormData({...formData, image_url: e.target.value}) : setNewEvent({...newEvent, image_url: e.target.value})} />
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg">등록 완료</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;