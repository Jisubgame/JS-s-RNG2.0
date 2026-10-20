/* =========================================================
   🎧 JS RNG 2.0 뮤직 플레이어
   - 기본 곡은 BGM_TRACKS 에 추가하면 됨 (mp3 파일을 레포에 넣고 한 줄 추가)
   - '내 음악 추가'로 폰에 있는 곡을 넣으면 IndexedDB 에 저장돼서 다음에도 남음
   - 유튜브 / 유튜브 뮤직 링크를 넣으면 공식 유튜브 플레이어(작은 화면)로 재생
     (링크 목록은 게임 저장에 들어가서 로그인하면 다른 기기에서도 그대로)
   ========================================================= */

/* ---------- 유튜브 링크 해석 ---------- */
export function parseYouTube(text) {
    const s = String(text || '').trim();
    let u;
    try { u = new URL(/^https?:/i.test(s) ? s : 'https://' + s); } catch (e) { return null; }
    const host = u.hostname.replace(/^www\.|^m\./, '');
    const ok = ['youtube.com', 'music.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host);
    if (!ok) return null;
    const idOk = id => /^[\w-]{11}$/.test(id || '');
    let v = u.searchParams.get('v');
    if (host === 'youtu.be') v = u.pathname.slice(1, 12);
    const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
    if (m) v = m[2];
    const list = u.searchParams.get('list');
    if (idOk(v)) return { video: v, list };
    if (list) return { list };
    return null;
}
const ytThumb = id => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
async function ytTitle(id) {
    try {
        const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}`);
        const j = await r.json();
        if (j && j.title) return { title: j.title, author: j.author_name || 'YouTube' };
    } catch (e) {}
    return null;
}

export const BGM_TRACKS = [
    { id: 'main', title: 'Abyss Drift', artist: 'JS RNG OST', src: 'main_bgm.mp3' },
    { id: 'lobby', title: 'Lobby Signal', artist: 'JS RNG OST', src: 'lobby_bgm.mp3' },
    { id: 'ut_start', title: 'Start Menu', artist: 'Toby Fox · UNDERTALE', src: 'bgm/start_menu.mp3' },
    { id: 'ut_ruins', title: 'Ruins', artist: 'Toby Fox · UNDERTALE', src: 'bgm/ruins.mp3' },
    { id: 'ut_ghost', title: 'Ghost Fight', artist: 'Toby Fox · UNDERTALE', src: 'bgm/ghost_fight.mp3' },
    { id: 'ut_sans', title: 'sans.', artist: 'Toby Fox · UNDERTALE', src: 'bgm/sans.mp3' },
    { id: 'ut_snowy', title: 'Snowy', artist: 'Toby Fox · UNDERTALE', src: 'bgm/snowy.mp3' }
];

const STATE_KEY = 'js_rng_music';
const DB_NAME = 'js_rng_music_db';
const STORE = 'tracks';

/* ---------- IndexedDB (내 음악) ---------- */
function openDb() {
    return new Promise((res, rej) => {
        if (!('indexedDB' in window)) return rej(new Error('no idb'));
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    });
}
async function dbAll() {
    try {
        const db = await openDb();
        return await new Promise((res, rej) => {
            const r = db.transaction(STORE).objectStore(STORE).getAll();
            r.onsuccess = () => res(r.result || []);
            r.onerror = () => rej(r.error);
        });
    } catch (e) { return []; }
}
async function dbPut(rec) {
    const db = await openDb();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(rec);
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
}
async function dbDel(id) {
    const db = await openDb();
    return new Promise((res, rej) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
}

/* ---------- 네모 픽셀 커버아트 (곡마다 고유) ---------- */
const coverCache = new Map();
function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
export function coverArt(track) {
    if (track.yt) return ytThumb(track.yt);
    if (coverCache.has(track.id)) return coverCache.get(track.id);
    let seed = hash(track.id + track.title);
    const rnd = () => { seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0; seed ^= seed >>> 13; return (seed % 10000) / 10000; };
    const hue = Math.floor(rnd() * 360), hue2 = (hue + 40 + rnd() * 140) % 360;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 128, 128);
    bg.addColorStop(0, `hsl(${hue},55%,10%)`); bg.addColorStop(1, `hsl(${hue2},60%,16%)`);
    g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
    const n = 8, s = 128 / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n / 2; x++) {
        if (rnd() < 0.45) {
            const l = 35 + rnd() * 35, h = rnd() < 0.5 ? hue : hue2;
            g.fillStyle = `hsla(${h},85%,${l}%,${0.35 + rnd() * 0.6})`;
            g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
            g.fillRect((n - 1 - x) * s + 1, y * s + 1, s - 2, s - 2); // 좌우 대칭
        }
    }
    g.strokeStyle = `hsla(${hue2},90%,75%,0.8)`; g.lineWidth = 3;
    g.strokeRect(36, 36, 56, 56);
    const url = c.toDataURL('image/png');
    coverCache.set(track.id, url);
    return url;
}

/* ---------- 플레이어 ---------- */
export function createMusicPlayer({ getVolume, isEnabled, onYtChange, onYtError, pip }) {
    const el = new Audio();
    el.preload = 'auto';
    const listeners = new Set();
    const emit = () => listeners.forEach(fn => fn());

    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch (e) {}

    const st = {
        tracks: BGM_TRACKS.map(t => ({ ...t, builtin: true })),
        currentId: saved.currentId || 'main',
        shuffle: !!saved.shuffle,
        repeat: saved.repeat || 'all',      // 'all' | 'one' | 'off'
        context: null,                      // 'lobby' | 'main'
        userPaused: false,
        ducked: false
    };
    const persist = () => {
        try { localStorage.setItem(STATE_KEY, JSON.stringify({ currentId: st.currentId, shuffle: st.shuffle, repeat: st.repeat })); } catch (e) {}
    };

    const cur = () => st.tracks.find(t => t.id === st.currentId) || st.tracks[0];
    const volume = () => {
        const v = isEnabled() ? Math.max(0, Math.min(1, getVolume())) : 0;
        el.volume = v;
        try { yt?.setVolume(Math.round(v * 100)); } catch (e) {}
    };

    /* ---------- 유튜브 플레이어 (공식 IFrame API) ---------- */
    let yt = null, ytReady = null, ytState = -1, ytWant = null;
    const isYtCur = () => !!cur()?.yt;
    function ensureYt() {
        if (ytReady) return ytReady;
        ytReady = new Promise(res => {
            const make = () => {
                yt = new window.YT.Player(pip.host, {
                    width: '100%', height: '100%',
                    playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, origin: location.origin },
                    events: {
                        onReady: () => { volume(); res(yt); },
                        onStateChange: e => {
                            ytState = e.data;
                            if (e.data === 0 && isYtCur()) step(1, true);
                            if (e.data === 1) { const d = yt.getVideoData?.(); const t = cur(); if (t?.yt && d?.title && t.title.startsWith('YouTube')) { t.title = d.title; t.artist = d.author || 'YouTube'; saveYt(); } }
                            showPip(); emit();
                        },
                        onError: e => { onYtError?.(e.data, cur()); if (isYtCur()) setTimeout(() => step(1, false), 400); }
                    }
                });
            };
            if (window.YT?.Player) return make();
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => { prev?.(); make(); };
            const sc = document.createElement('script'); sc.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(sc);
        });
        return ytReady;
    }
    // 유튜브 곡이 재생 중일 때만 작은 영상 창을 보여 줌 (가려진 채로 재생하지 않음)
    // 영상 창은 투명하게 숨겨 두고 소리만 (display:none 이면 재생이 막힐 수 있어서 항상 깔아 둠)
    function showPip() { pip.box.classList.remove('hidden'); }
    const ytTracks = () => st.tracks.filter(t => t.yt);
    const saveYt = () => onYtChange?.(ytTracks().map(t => ({ v: t.yt, t: t.title, a: t.artist })));
    setInterval(() => { if (isYtCur() && ytState === 1) listeners.forEach(fn => fn('time')); }, 500);

    function load(track, autoplay) {
        st.currentId = track.id;
        if (track.yt) {
            el.pause(); el.dataset.id = '';
            const go = autoplay && isEnabled() && !st.ducked;
            if (go) st.userPaused = false;
            ensureYt().then(p => { volume(); go ? p.loadVideoById(track.yt) : p.cueVideoById(track.yt); });
            if (st.context === 'main') persist();
            updateMediaSession(); emit();
            return;
        }
        try { yt?.pauseVideo(); } catch (e) {}
        showPip();
        if (el.dataset.id !== track.id) {
            el.dataset.id = track.id;
            el.src = track.src;
        }
        volume();
        if (autoplay && isEnabled() && !st.ducked) { st.userPaused = false; el.play().catch(() => {}); }
        if (st.context === 'main') persist();
        updateMediaSession();
        emit();
    }

    function order() {
        // 로비에서도 큐는 전체 곡
        return st.tracks;
    }
    function step(dir, fromEnded) {
        const list = order();
        if (!list.length) return;
        if (fromEnded && st.repeat === 'one') { if (isYtCur()) { yt.seekTo(0, true); yt.playVideo(); } else { el.currentTime = 0; el.play().catch(() => {}); } return; }
        let i = list.findIndex(t => t.id === st.currentId);
        if (st.shuffle && list.length > 1) {
            let j;
            do { j = Math.floor(Math.random() * list.length); } while (j === i);
            i = j;
        } else {
            i += dir;
            if (i >= list.length) { if (fromEnded && st.repeat === 'off') { el.pause(); try { yt?.pauseVideo(); } catch (e) {} emit(); return; } i = 0; }
            if (i < 0) i = list.length - 1;
        }
        load(list[i], true);
    }

    el.addEventListener('ended', () => step(1, true));
    ['play', 'pause', 'loadedmetadata'].forEach(ev => el.addEventListener(ev, emit));
    el.addEventListener('timeupdate', () => listeners.forEach(fn => fn('time')));

    function updateMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const t = cur();
        try {
            navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: 'JS RNG 2.0', artwork: [{ src: coverArt(t), sizes: '128x128', type: 'image/png' }] });
            navigator.mediaSession.setActionHandler('play', () => api.toggle(true));
            navigator.mediaSession.setActionHandler('pause', () => api.toggle(false));
            navigator.mediaSession.setActionHandler('nexttrack', () => api.next());
            navigator.mediaSession.setActionHandler('previoustrack', () => api.prev());
        } catch (e) {}
    }

    const api = {
        el,
        get state() { return st; },
        get current() { return cur(); },
        get playing() { return isYtCur() ? ytState === 1 || ytState === 3 : !el.paused; },
        time() {
            if (isYtCur() && yt?.getDuration) return { cur: yt.getCurrentTime() || 0, dur: yt.getDuration() || 0 };
            return { cur: el.currentTime || 0, dur: el.duration || 0 };
        },
        on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

        // 로비/메인 전환
        start(context) {
            st.context = context;
            st.userPaused = false;
            if (context === 'lobby') load(st.tracks.find(t => t.id === 'lobby') || cur(), true);
            else {
                let saved2 = {};
                try { saved2 = JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch (e) {}
                const want = st.tracks.find(t => t.id === (saved2.currentId || 'main')) || st.tracks[0];
                load(want, true);
            }
        },
        stop() { el.pause(); try { yt?.pauseVideo(); } catch (e) {} emit(); },
        // 컷씬 동안 잠깐 꺼두기
        duck() { st.ducked = true; el.pause(); try { yt?.pauseVideo(); } catch (e) {} },
        unduck() {
            st.ducked = false;
            volume();
            if (st.userPaused || !isEnabled()) return;
            if (isYtCur()) { try { yt?.playVideo(); } catch (e) {} }
            else if (el.src) el.play().catch(() => {});
        },
        unlock() {
            if (st.userPaused || st.ducked || !isEnabled()) return;
            if (isYtCur()) { if (ytState !== 1) ensureYt().then(p => { if (p.getVideoData?.()?.video_id !== cur().yt) p.loadVideoById(cur().yt); else p.playVideo(); }); }
            else if (el.src && el.paused) el.play().catch(() => {});
        },
        updateVolume: volume,

        play(id) {
            const t = st.tracks.find(x => x.id === id);
            if (!t) return;
            if (t.id === st.currentId && el.src) { api.toggle(true); return; }
            load(t, true);
        },
        toggle(force) {
            if (isYtCur()) {
                const want = force ?? !api.playing;
                st.userPaused = !want;
                ensureYt().then(p => {
                    if (!want) { p.pauseVideo(); return; }
                    if (p.getVideoData?.()?.video_id !== cur().yt) p.loadVideoById(cur().yt); else p.playVideo();
                });
                emit();
                return;
            }
            const want = force ?? el.paused;
            if (want) {
                st.userPaused = false;
                if (!el.src) load(cur(), true);
                else if (isEnabled()) el.play().catch(() => {});
            } else { st.userPaused = true; el.pause(); }
            emit();
        },
        next() { step(1, false); },
        prev() {
            if (api.time().cur > 3) { api.seek(0); return; }
            if (st.shuffle) { step(1, false); return; }
            step(-1, false);
        },
        seek(frac) {
            frac = Math.max(0, Math.min(1, frac));
            if (isYtCur()) { const d = yt?.getDuration?.(); if (d) yt.seekTo(frac * d, true); return; }
            if (isFinite(el.duration)) el.currentTime = frac * el.duration;
        },
        setShuffle(v) { st.shuffle = v ?? !st.shuffle; persist(); emit(); },
        cycleRepeat() { st.repeat = st.repeat === 'all' ? 'one' : st.repeat === 'one' ? 'off' : 'all'; persist(); emit(); },

        async addFiles(files) {
            let added = 0;
            for (const f of files) {
                if (!f.type.startsWith('audio/') && !/\.(mp3|m4a|aac|ogg|wav|flac)$/i.test(f.name)) continue;
                const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                const title = f.name.replace(/\.[^.]+$/, '');
                const rec = { id, title, artist: '내 음악', blob: f, added: Date.now() };
                try { await dbPut(rec); } catch (e) { /* 저장 실패해도 이번 세션엔 재생 */ }
                st.tracks.push({ id, title, artist: '내 음악', src: URL.createObjectURL(f), builtin: false });
                added++;
            }
            emit();
            return added;
        },
        // 유튜브 링크 추가 (영상 하나 또는 재생목록) → 추가된 곡 수
        async addYouTube(text) {
            const info = parseYouTube(text);
            if (!info) return { added: 0, error: 'bad' };
            let ids = [];
            if (info.video) ids = [info.video];
            else {
                // 재생목록: 플레이어에 목록을 올려서 영상 번호들을 받아옴
                const p = await ensureYt();
                ids = await new Promise(res => {
                    let done = false;
                    const finish = v => { if (!done) { done = true; res(v); } };
                    const check = () => { const l = p.getPlaylist?.(); if (l && l.length) finish(l); };
                    p.addEventListener('onStateChange', check);
                    try { p.cuePlaylist({ list: info.list, listType: 'playlist' }); } catch (e) { finish([]); }
                    const iv = setInterval(check, 500);
                    setTimeout(() => { clearInterval(iv); finish(p.getPlaylist?.() || []); }, 9000);
                });
                ids = ids.slice(0, 60);
            }
            const have = new Set(ytTracks().map(t => t.yt));
            const fresh = ids.filter(id => !have.has(id));
            const added = fresh.map((id, k) => {
                const tr = { id: 'yt_' + id, yt: id, title: `YouTube 영상${fresh.length > 1 ? ' ' + (k + 1) : ''}`, artist: 'YouTube', builtin: false };
                st.tracks.push(tr);
                return tr;
            });
            saveYt(); emit();
            // 제목은 천천히 채움
            (async () => {
                for (const tr of added) {
                    const meta = await ytTitle(tr.yt);
                    if (meta) { tr.title = meta.title; tr.artist = meta.author; emit(); }
                }
                saveYt();
            })();
            return { added: added.length, dup: ids.length - fresh.length };
        },
        // 저장된 유튜브 목록으로 바꿔 끼움 (불러오기/로그인/로그아웃)
        importYt(list) {
            const keep = st.tracks.filter(t => !t.yt);
            const yts = (list || []).filter(x => x && /^[\w-]{11}$/.test(x.v)).map(x => ({ id: 'yt_' + x.v, yt: x.v, title: x.t || 'YouTube 영상', artist: x.a || 'YouTube', builtin: false }));
            const curWasYt = isYtCur();
            st.tracks = [...keep, ...yts];
            if (curWasYt && !st.tracks.some(t => t.id === st.currentId)) load(st.tracks[0], api.playing);
            emit();
        },
        async remove(id) {
            const t = st.tracks.find(x => x.id === id);
            if (!t || t.builtin) return;
            const wasCurrent = st.currentId === id;
            if (wasCurrent) step(1, false);
            st.tracks = st.tracks.filter(x => x.id !== id);
            if (t.yt) { saveYt(); emit(); return; }
            try { URL.revokeObjectURL(t.src); await dbDel(id); } catch (e) {}
            if (st.currentId === id) load(st.tracks[0], !el.paused);
            emit();
        }
    };

    // 저장해둔 내 음악 불러오기
    dbAll().then(recs => {
        recs.sort((a, b) => a.added - b.added).forEach(r => {
            st.tracks.push({ id: r.id, title: r.title, artist: r.artist || '내 음악', src: URL.createObjectURL(r.blob), builtin: false });
        });
        if (recs.length) emit();
    });

    return api;
}
