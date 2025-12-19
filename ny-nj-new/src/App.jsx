import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Book, User, Lock, Star, Calendar as CalendarIcon } from 'lucide-react';
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
  
  // 새 일정 데이터 상태 (초기 지역 NY)
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
        // 달력 목록 제목 앞에 🍎/🌳 추가
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
    if (error) {
      alert("일정 저장 실패! Supabase 구성을 확인하세요.");
    } else {
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
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full border border-orange-100">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D32F2F]"><Lock size={32} /></div>
          <h1 className="text-2xl font-black mb-2 text-slate-800">뉴욕·뉴저지 북클럽</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="비밀번호 입력" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl outline-none text-center text-lg font-bold" />
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg text-lg">입장하기</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-800 pb-20">
      <header className="flex flex-col items-center py-16 px-4">
        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm mb-6 border border-orange-100 flex flex-row items-center gap-8">
          <img src="/logo.png" alt="로고" className="w-28 h-28 md:w-32 md:h-32 object-contain" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight text-left">
            뉴욕·뉴저지<br/><span className="text-[#D32F2F]">북클럽</span>
          </h1>
        </div>
        
        {/* 사라졌던 감성 문구 복구 */}
        <p className="text-slate-500 italic font-serif text-lg mb-2">
          "마음이 머무는 문장을 기록합니다"
        </p>

        {/* 필터 버튼 영역 수정 */}
        <div className="flex justify-center gap-3 mt-8 p-1.5 bg-white rounded-full border border-orange-50 shadow-sm">
          {['ALL', 'NY', 'NJ'].map((loc) => (
            <button 
              key={loc} 
              onClick={() => setFilter(loc)} 
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                filter === loc ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'
              }`}
            >
              {/* 버튼 텍스트 앞에 아이콘 추가 */}
              {loc === 'ALL' && '📚 전체 서재'}
              {loc === 'NY' && '🍎 뉴욕'}
              {loc === 'NJ' && '🌳 뉴저지'}
            </button>
          ))}
        </div>
      </header>

      {/* --- 1. Our Library --- */}
      <main className="max-w-6xl mx-auto px-6 mb-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-2xl font-bold italic flex items-center gap-2"><Book size={24} className="text-[#D32F2F]"/> Our Library</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#D32F2F] text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:bg-red-700 transition-all"><Plus size={20}/> 새 책 추가</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-left">
          {(filter === 'ALL' ? posts : posts.filter(p => p.region === filter)).map(post => (
            <div key={post.id} onClick={() => { setSelectedPost(post); fetchComments(post.id); }} className="group cursor-pointer">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl shadow-md"><img src={post.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="cover" /></div>
              <h3 className="font-bold text-lg truncate group-hover:text-[#D32F2F] transition-colors">{post.title}</h3>
              <p className="text-sm text-slate-400">{post.author}</p>
            </div>
          ))}
        </div>
      </main>

      {/* --- 2. Club Calendar --- */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 italic">
          <CalendarIcon size={24} className="text-[#D32F2F]"/> Club Calendar
        </h2>
        <p className="text-sm text-slate-400 mb-4">* 날짜를 클릭하면 해당 날짜에 새 일정을 추가할 수 있습니다.</p>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-orange-50">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale="ko"
            height="auto"
            dateClick={handleDateClick}
            eventContent={(eventInfo) => (
              <div className="flex flex-col w-full p-0.5 overflow-hidden cursor-pointer">
                {eventInfo.event.extendedProps.image_url && (
                  <img 
                    src={eventInfo.event.extendedProps.image_url} 
                    className="w-full h-16 md:h-20 object-cover rounded-xl mb-1 shadow-sm border border-white/20"
                    alt="event"
                  />
                )}
                <div className="text-[10px] font-bold truncate px-1 text-white">
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

      {/* --- 일정 상세보기 모달 --- */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[120]" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 bg-white/80 hover:bg-white rounded-full transition z-10 shadow-sm"><X/></button>
            
            {selectedEvent.image_url && (
              <div className="w-full h-56 overflow-hidden bg-slate-100">
                <img src={selectedEvent.image_url} className="w-full h-full object-cover" alt="event" />
              </div>
            )}
            
            <div className="p-10 text-left">
              <div className="flex items-center gap-2 mb-4">
                {/* 🍎/🌳 아이콘이 포함된 지역 배지 */}
                <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black text-white flex items-center gap-1.5 ${selectedEvent.region === 'NY' ? 'bg-[#D32F2F]' : 'bg-[#388E3C]'}`}>
                  {selectedEvent.region === 'NY' ? '🍎 NY' : '🌳 NJ'}
                </span>
                <span className="text-sm font-bold text-slate-400">{selectedEvent.start}</span>
              </div>
              
              <h3 className="text-2xl font-black mb-6 leading-tight">{selectedEvent.title}</h3>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description || "상세 내용이 없습니다."}
                </p>
              </div>
              
              <button onClick={() => setSelectedEvent(null)} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 일정 추가 모달 --- */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden text-left">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">새 일정 추가</h3>
                <p className="text-sm text-[#D32F2F] font-bold">{newEvent.start}</p>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} className="p-2 hover:bg-white rounded-full transition"><X /></button>
            </div>
            <form onSubmit={handleEventSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 ml-1">지역 선택</label>
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl font-bold">
                  {['NY', 'NJ'].map(r => (
                    <button key={r} type="button" onClick={() => setNewEvent({...newEvent, region: r})}
                      className={`flex-1 py-3 rounded-xl transition-all ${newEvent.region === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                    >{r === 'NY' ? '🍎 뉴욕' : '🌳 뉴저지'}</button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="일정 제목" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea placeholder="상세 내용" className="w-full p-4 bg-slate-50 rounded-2xl outline-none h-32 resize-none" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              
              <div>
                <label className="block text-sm font-bold mb-2 ml-1">이미지 URL (선택)</label>
                <input type="text" placeholder="사진 주소를 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all">일정 등록하기</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 책 추가 모달 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden text-left">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-2xl font-black">새 책 추가하기</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl font-bold">
                {['NY', 'NJ'].map(r => (
                  <button key={r} type="button" onClick={() => setFormData({...formData, region: r})}
                    className={`flex-1 py-3 rounded-xl transition-all ${formData.region === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                  >{r === 'NY' ? '🍎 뉴욕' : '🌳 뉴저지'}</button>
                ))}
              </div>
              <input type="text" placeholder="책 제목" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="작가명" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, author: e.target.value})} />
              <input type="text" placeholder="이미지 URL" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl">책장에 추가하기</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 책 상세보기 모달 --- */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="md:w-5/12 bg-slate-100 flex items-center justify-center p-12">
                <img src={selectedPost.image_url} className="max-h-full rounded-lg shadow-2xl" alt="cover" />
            </div>
            <div className="md:w-7/12 p-10 flex flex-col h-full bg-white relative text-left">
                <button onClick={() => setSelectedPost(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full"><X/></button>
                <h2 className="text-3xl font-bold mb-1">{selectedPost.title}</h2>
                <p className="text-lg text-slate-400 mb-8 font-medium border-b pb-4">{selectedPost.author}</p>
                <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6">
                  {comments.map(c => (
                    <div key={c.id} className="bg-orange-50/50 p-6 rounded-2xl border-l-4 border-red-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex text-yellow-400 text-xs">{"★".repeat(c.rating || 5)}{"☆".repeat(5 - (c.rating || 5))}</div>
                        <span className="font-bold text-sm text-slate-700">{c.author}</span>
                      </div>
                      <p className="text-slate-600 italic">"{c.content}"</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddComment} className="bg-slate-50 p-6 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center px-1">
                      <input type="text" placeholder="작성자" required value={newComment.author} onChange={e => setNewComment({...newComment, author: e.target.value})} className="bg-transparent font-bold text-sm outline-none border-b border-slate-200" />
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button key={num} type="button" onClick={() => setNewComment({...newComment, rating: num})} className={`text-xl ${newComment.rating >= num ? 'text-yellow-400' : 'text-slate-200'}`}>★</button>
                        ))}
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <textarea placeholder="기록하기..." required value={newComment.content} onChange={e => setNewComment({...newComment, content: e.target.value})} className="flex-1 p-3 bg-white rounded-xl text-sm h-20 outline-none resize-none" />
                      <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-bold">기록</button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;