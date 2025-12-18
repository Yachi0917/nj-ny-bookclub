import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, MapPin, Book, Heart, MessageSquare, User } from 'lucide-react';

// Supabase 설정
const SUPABASE_URL = 'https://psdrakjfbumzmwbpzwkd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IWQriti-EmIH4ekLRuLfmg_16fLyZY0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]); // 댓글(독후감) 목록
  const [filter, setFilter] = useState('ALL'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [newComment, setNewComment] = useState({ author: '', content: '' }); // 새 독후감 입력값
  const [formData, setFormData] = useState({ title: '', author: '', image_url: '', region: 'NY' });

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
  }

  // 책을 클릭했을 때 해당 책의 독후감들만 가져오기
  async function fetchComments(postId) {
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (data) setComments(data);
  }

  // 책 등록 (지역 정보 포함)
  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([formData]);
    if (error) {
      console.error(error);
      alert("에러 발생! Supabase 테이블 설정을 확인하세요.");
    } else {
      alert("책이 추가되었습니다.");
      setIsModalOpen(false);
      setFormData({ title: '', author: '', image_url: '', region: 'NY' });
      fetchPosts();
    }
  }

  // 독후감(댓글) 등록
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.author || !newComment.content) return;

    const { error } = await supabase.from('comments').insert([
      { post_id: selectedPost.id, author: newComment.author, content: newComment.content }
    ]);

    if (error) alert("저장 실패!");
    else {
      setNewComment({ author: '', content: '' });
      fetchComments(selectedPost.id); // 목록 새로고침
    }
  }

  const filteredPosts = filter === 'ALL' ? posts : posts.filter(p => p.region === filter);

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-800 pb-20">

      {/* --- 헤더 영역: 로고와 제목 가로 배치 --- */}
      <header className="flex flex-col items-center py-16 px-4">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm mb-6 border border-orange-100 rotate-1 flex flex-row items-center gap-6">
          <img 
            src="/logo.png" 
            alt="북클럽 로고" 
            className="w-20 h-20 md:w-24 md:h-24 object-contain" 
          />
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-left">
            뉴욕·뉴저지<br/>
            <span className="text-[#D32F2F]">북클럽</span>
          </h1>
        </div>
        
        <p className="text-slate-500 italic font-serif">"마음이 머무는 문장을 기록합니다"</p>
        
        {/* 지역 필터 버튼 */}
        <div className="flex justify-center gap-3 mt-12 p-1.5 bg-white rounded-full border border-orange-50 shadow-sm">
          {['ALL', 'NY', 'NJ'].map((loc) => (
            <button key={loc} onClick={() => setFilter(loc)}
              className={`px-10 py-3 rounded-full text-sm font-bold transition-all ${
                filter === loc ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {loc === 'ALL' ? '전체 서재' : loc === 'NY' ? '뉴욕' : '뉴저지'}
            </button>
          ))}
        </div>
      </header>

      {/* --- 메인 책장 영역 --- */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-2xl font-bold italic flex items-center gap-2">
            <Book size={24} className="text-[#D32F2F]"/> Our Library
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#D32F2F] text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 hover:bg-red-700 transition-all">
            <Plus size={20}/> 새 책 추가
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {filteredPosts.map(post => (
            <div key={post.id} onClick={() => { setSelectedPost(post); fetchComments(post.id); }} className="group cursor-pointer">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-2xl shadow-md group-hover:shadow-2xl transition-all">
                <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="cover" />
                <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-[10px] font-black uppercase shadow-sm">{post.region}</div>
              </div>
              <h3 className="font-bold text-lg truncate group-hover:text-[#D32F2F] transition-colors">{post.title}</h3>
              <p className="text-sm text-slate-400">{post.author}</p>
            </div>
          ))}
        </div>
      </main>

      {/* --- 상세 보기 및 다중 독후감 모달 --- */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="md:w-5/12 bg-slate-100 flex items-center justify-center p-12">
              <img src={selectedPost.image_url} className="max-h-full rounded-lg shadow-2xl border-4 border-white" alt="cover" />
            </div>

            <div className="md:w-7/12 p-10 flex flex-col h-full bg-white relative">
              <button onClick={() => setSelectedPost(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition"><X/></button>
              <h2 className="text-3xl font-bold mb-1">{selectedPost.title}</h2>
              <p className="text-lg text-slate-400 mb-8 font-medium border-b pb-4">{selectedPost.author}</p>
              
              <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6 custom-scrollbar text-left">
                {comments.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 italic">아직 기록이 없습니다. 첫 독후감을 남겨주세요!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-orange-50/50 p-6 rounded-2xl border-l-4 border-red-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-red-400"/>
                        <span className="font-bold text-sm text-slate-700">{c.author}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic">"{c.content}"</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="bg-slate-50 p-6 rounded-3xl space-y-3 border border-slate-100">
                <input type="text" placeholder="작성자 이름" required value={newComment.author} onChange={e => setNewComment({...newComment, author: e.target.value})} className="w-full p-3 bg-white rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-red-100" />
                <div className="flex gap-2">
                  <textarea placeholder="마음을 울린 문장을 기록하세요..." required value={newComment.content} onChange={e => setNewComment({...newComment, content: e.target.value})} className="flex-1 p-3 bg-white rounded-xl text-sm h-20 outline-none focus:ring-2 focus:ring-red-100 resize-none" />
                  <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-black transition shrink-0">기록</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- 새 책 추가 모달 (지역 선택 버튼 포함) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-2xl font-black">새 책 추가하기</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 text-left">
              
              {/* 지역 선택 버튼 */}
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl font-bold">
                {['NY', 'NJ'].map(r => (
                  <button 
                    key={r} 
                    type="button" 
                    onClick={() => setFormData({...formData, region: r})}
                    className={`flex-1 py-3 rounded-xl transition-all ${
                      formData.region === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {r === 'NY' ? '🍎 뉴욕' : '🌳 뉴저지'}
                  </button>
                ))}
              </div>

              <input type="text" placeholder="책 제목" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all" onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="작가명" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all" onChange={e => setFormData({...formData, author: e.target.value})} />
              <input type="text" placeholder="이미지 URL" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-100 transition-all" onChange={e => setFormData({...formData, image_url: e.target.value})} />
              
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all">
                책장에 추가하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;