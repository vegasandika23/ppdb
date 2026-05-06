// ============================================================
//  PAUD MAHKOTA RAYA — script.js
//  DUAL MODE: bekerja tanpa server (demo) & dengan PHP+MySQL
// ============================================================

const API_BASE = './api';

// Deteksi apakah berjalan di server atau buka langsung sebagai file
const HAS_SERVER = location.protocol === 'http:' || location.protocol === 'https:';

// ============================================================
//  DATABASE LOKAL (demo/offline – disimpan di localStorage)
// ============================================================
const DB = {
  get users()       { return JSON.parse(localStorage.getItem('db_users')       || '[]'); },
  get admins()      { return JSON.parse(localStorage.getItem('db_admins')      || '[]'); },
  get pendaftaran() { return JSON.parse(localStorage.getItem('db_pendaftaran') || '[]'); },

  saveUsers(d)       { localStorage.setItem('db_users',       JSON.stringify(d)); },
  saveAdmins(d)      { localStorage.setItem('db_admins',      JSON.stringify(d)); },
  savePendaftaran(d) { localStorage.setItem('db_pendaftaran', JSON.stringify(d)); },

  init() {
    if (!this.admins.length) {
      this.saveAdmins([{ id:1, username:'admin', password:'admin123', nama:'Administrator' }]);
    }
    if (!this.pendaftaran.length) {
      const now = Date.now();
      this.savePendaftaran([
        { id:1, nomor_daftar:'PAUD-2025-001', nama_anak:'Ahmad Fauzi',    jenis_kelamin:'L', tanggal_lahir:'2020-03-15', tempat_lahir:'Palembang', program:'TK B',            nama_ayah:'Bpk. Hasan',  nama_ibu:'Ibu Sari',  no_hp:'0812-3456-7890', email_ortu:'hasan@gmail.com',  alamat:'Jl. Merdeka No.1',    pekerjaan_ayah:'PNS',       pekerjaan_ibu:'Guru',       riwayat_penyakit:'Tidak ada', status:'diterima', tgl_daftar:'18 Apr 2025', catatan_admin:'', created_at: now-6*86400000 },
        { id:2, nomor_daftar:'PAUD-2025-002', nama_anak:'Siti Rahayu',    jenis_kelamin:'P', tanggal_lahir:'2021-06-20', tempat_lahir:'Lahat',     program:'TK A',            nama_ayah:'Bpk. Wahyu', nama_ibu:'Ibu Yanti', no_hp:'0813-5678-9012', email_ortu:'yanti@gmail.com',  alamat:'Jl. Pahlawan No.5',   pekerjaan_ayah:'Wiraswasta', pekerjaan_ibu:'IRT',        riwayat_penyakit:'Tidak ada', status:'diterima', tgl_daftar:'17 Apr 2025', catatan_admin:'', created_at: now-5*86400000 },
        { id:3, nomor_daftar:'PAUD-2025-003', nama_anak:'Dani Kurniawan', jenis_kelamin:'L', tanggal_lahir:'2022-01-10', tempat_lahir:'OKU',       program:'Kelompok Bermain',nama_ayah:'Bpk. Iwan',  nama_ibu:'Ibu Dewi',  no_hp:'0857-0000-1111', email_ortu:'iwan@gmail.com',   alamat:'Jl. Bunga No.3',      pekerjaan_ayah:'Petani',     pekerjaan_ibu:'IRT',        riwayat_penyakit:'Alergi susu', status:'menunggu', tgl_daftar:'15 Apr 2025', catatan_admin:'', created_at: now-4*86400000 },
        { id:4, nomor_daftar:'PAUD-2025-004', nama_anak:'Nadia Putri S.', jenis_kelamin:'P', tanggal_lahir:'2021-09-05', tempat_lahir:'Palembang', program:'TK B',            nama_ayah:'Bpk. Anton', nama_ibu:'Ibu Rina',  no_hp:'0878-9876-5432', email_ortu:'rina@gmail.com',   alamat:'Jl. Kenanga No.7',    pekerjaan_ayah:'Karyawan',   pekerjaan_ibu:'IRT',        riwayat_penyakit:'Tidak ada', status:'menunggu', tgl_daftar:'14 Apr 2025', catatan_admin:'', created_at: now-3*86400000 },
        { id:5, nomor_daftar:'PAUD-2025-005', nama_anak:'Rizky Ramadhan', jenis_kelamin:'L', tanggal_lahir:'2021-04-22', tempat_lahir:'Muara Enim',program:'TK A',            nama_ayah:'Bpk. Ridwan',nama_ibu:'Ibu Fitri', no_hp:'0857-1234-5678', email_ortu:'ridwan@gmail.com', alamat:'Jl. Melati No.12',    pekerjaan_ayah:'Polisi',     pekerjaan_ibu:'Bidan',      riwayat_penyakit:'Tidak ada', status:'diterima', tgl_daftar:'12 Apr 2025', catatan_admin:'', created_at: now-2*86400000 },
        { id:6, nomor_daftar:'PAUD-2025-006', nama_anak:'Bima Prasetyo',  jenis_kelamin:'L', tanggal_lahir:'2020-12-01', tempat_lahir:'Palembang', program:'TK A',            nama_ayah:'Bpk. Agus',  nama_ibu:'Ibu Lusi',  no_hp:'0812-9999-0000', email_ortu:'agus@gmail.com',   alamat:'Jl. Anggrek No.4',    pekerjaan_ayah:'Buruh',      pekerjaan_ibu:'IRT',        riwayat_penyakit:'Asma',      status:'ditolak',  tgl_daftar:'10 Apr 2025', catatan_admin:'Kuota penuh', created_at: now-1*86400000 },
      ]);
    }
  }
};

// ============================================================
//  LOCAL API (offline mode)
// ============================================================
const LocalAPI = {
  loginUser(email, password) {
    if (!email || !password) return { success:false, message:'Email dan password wajib diisi.' };
    const u = DB.users.find(u => u.email===email && u.password===password);
    if (!u) return { success:false, message:'Email atau password salah.' };
    return { success:true, message:'Login berhasil.', user:{ id:u.id, email:u.email, nama:u.nama } };
  },

  loginAdmin(username, password) {
    const a = DB.admins.find(a => a.username===username && a.password===password);
    if (!a) return { success:false, message:'Username atau password salah.<br>Gunakan: <b>admin</b> / <b>admin123</b>' };
    return { success:true, message:'Login berhasil.', admin:{ id:a.id, nama:a.nama } };
  },

  submitPendaftaran(data) {
    const list   = DB.pendaftaran;
    const newId  = list.length ? Math.max(...list.map(x=>x.id))+1 : 1;
    const nomor  = 'PAUD-2025-' + String(Math.floor(Math.random()*900)+100);
    const now    = new Date();
    const bulan  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const tgl    = now.getDate()+' '+bulan[now.getMonth()]+' '+now.getFullYear();
    list.push({ ...data, id:newId, nomor_daftar:nomor, status:'menunggu', tgl_daftar:tgl, catatan_admin:'', created_at:Date.now() });
    DB.savePendaftaran(list);
    return { success:true, nomor_daftar:nomor };
  },

  getPendaftaran(search, status) {
    let list = [...DB.pendaftaran].sort((a,b)=>b.created_at-a.created_at);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.nama_anak||'').toLowerCase().includes(q) ||
        (d.nomor_daftar||'').toLowerCase().includes(q) ||
        (d.nama_ayah||'').toLowerCase().includes(q) ||
        (d.nama_ibu||'').toLowerCase().includes(q)
      );
    }
    if (status) list = list.filter(d=>d.status===status);
    return { success:true, total:list.length, data:list };
  },

  getStatistik() {
    const list     = DB.pendaftaran;
    const diterima = list.filter(d=>d.status==='diterima').length;
    const menunggu = list.filter(d=>d.status==='menunggu').length;
    const ditolak  = list.filter(d=>d.status==='ditolak').length;
    const programs = ['TK A','TK B','Kelompok Bermain'];
    const perProgram = programs.map(p=>({
      program:  p,
      total:    list.filter(d=>d.program===p).length,
      diterima: list.filter(d=>d.program===p&&d.status==='diterima').length,
      ditolak:  list.filter(d=>d.program===p&&d.status==='ditolak').length,
      menunggu: list.filter(d=>d.program===p&&d.status==='menunggu').length,
    }));
    const terbaru = [...list].sort((a,b)=>b.created_at-a.created_at).slice(0,5);
    return { success:true, total:list.length, diterima, menunggu, ditolak,
             kuota_tersisa:Math.max(0,24-diterima), per_program:perProgram, terbaru };
  },

  updateStatus(id, status) {
    const list = DB.pendaftaran;
    const idx  = list.findIndex(d=>d.id===id);
    if (idx===-1) return { success:false, message:'Data tidak ditemukan.' };
    list[idx].status = status;
    DB.savePendaftaran(list);
    return { success:true };
  },

  cekStatus(nomor) {
    const d = DB.pendaftaran.find(d=>d.nomor_daftar.toUpperCase()===nomor.toUpperCase());
    if (!d) return { success:false, message:'Data tidak ditemukan.' };
    return { success:true, data:[d] };
  },

  getDetail(id) {
    const d = DB.pendaftaran.find(d=>d.id===id);
    return d ? { success:true, data:[d] } : { success:false, data:[] };
  }
};

// ============================================================
//  FUNGSI UTAMA PEMANGGIL API
// ============================================================
async function callAPI(localFn, args, phpEndpoint, phpMethod, phpPayload) {
  if (!HAS_SERVER) {
    return localFn(...args);
  }
  try {
    let url  = `${API_BASE}/${phpEndpoint}`;
    const opts = { method: phpMethod, headers:{'Content-Type':'application/json'} };
    if (phpMethod === 'GET') {
      const q = new URLSearchParams(phpPayload).toString();
      if (q) url += '?'+q;
    } else {
      opts.body = JSON.stringify(phpPayload);
    }
    const res = await fetch(url, opts);
    return await res.json();
  } catch (e) {
    // fallback ke local jika server error
    console.warn('Server tidak tersedia, fallback ke mode lokal:', e);
    return localFn(...args);
  }
}

// ============================================================
//  NAVIGASI HALAMAN
// ============================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); window.scrollTo(0,0); }
}

// ============================================================
//  SWITCH TAB LOGIN
// ============================================================
function switchLoginTab(role, btn) {
  document.querySelectorAll('.tab-row .tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-user').style.display  = role==='user'  ? 'block' : 'none';
  document.getElementById('panel-admin').style.display = role==='admin' ? 'block' : 'none';
  hideErr('user-err'); hideErr('admin-err');
}

// ============================================================
//  HELPERS
// ============================================================
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = msg;
  el.style.display = 'block';
}
function hideErr(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setBtn(id, loading, label) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled  = loading;
  btn.innerHTML = loading ? '⏳ Memproses...' : label;
}
function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}
function badgeHTML(status) {
  return { diterima:'<span class="badge approved">Diterima</span>', menunggu:'<span class="badge pending">Menunggu</span>', ditolak:'<span class="badge rejected">Ditolak</span>' }[status] || `<span class="badge">${status}</span>`;
}
function setUserNav(nama) {
  setText('user-name-display', nama);
  const av = document.getElementById('user-avatar-nav');
  if (av) av.textContent = nama.charAt(0).toUpperCase();
}

// ============================================================
//  LOGIN USER
// ============================================================
async function loginUser() {
  const email    = val('user-email');
  const password = val('user-pass');
  hideErr('user-err');
  if (!email || !password) { showErr('user-err','Email dan password wajib diisi.'); return; }

  setBtn('btn-login-user', true, 'Masuk');
  const res = await callAPI(
    LocalAPI.loginUser.bind(LocalAPI), [email, password],
    'login_user.php', 'POST', { email, password }
  );
  setBtn('btn-login-user', false, 'Masuk');

  if (res.success) {
    localStorage.setItem('paud_user', JSON.stringify(res.user));
    setUserNav(res.user.nama || email.split('@')[0]);
    showPage('page-home');
  } else {
    showErr('user-err', res.message || 'Login gagal.');
  }
}

// ============================================================
//  LOGIN GOOGLE (simulasi)
// ============================================================
function loginGoogle() {
  const u = { id:0, nama:'Pengguna Google', email:'google@gmail.com' };
  localStorage.setItem('paud_user', JSON.stringify(u));
  setUserNav('Pengguna Google');
  showPage('page-home');
}

// ============================================================
//  LOGIN ADMIN
// ============================================================
async function loginAdmin() {
  const username = val('admin-user');
  const password = val('admin-pass');
  hideErr('admin-err');
  if (!username || !password) { showErr('admin-err','Username dan password wajib diisi.'); return; }

  setBtn('btn-login-admin', true, 'Masuk sebagai Admin');
  const res = await callAPI(
    LocalAPI.loginAdmin.bind(LocalAPI), [username, password],
    'login_admin.php', 'POST', { username, password }
  );
  setBtn('btn-login-admin', false, 'Masuk sebagai Admin');

  if (res.success) {
    localStorage.setItem('paud_admin', JSON.stringify(res.admin));
    showPage('page-dashboard');
    loadDashboard();
  } else {
    showErr('admin-err', res.message || 'Login gagal.');
  }
}

// ============================================================
//  LOGOUT
// ============================================================
function logoutUser() {
  localStorage.removeItem('paud_user');
  document.getElementById('user-email').value = '';
  document.getElementById('user-pass').value  = '';
  showPage('page-login');
}
function logoutAdmin() {
  localStorage.removeItem('paud_admin');
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
  showPage('page-login');
}

// ============================================================
//  STEP FORM
// ============================================================
function nextStep(step) {
  [1,2,3].forEach(i => {
    document.getElementById('step-'+i).style.display = 'none';
    const s = document.getElementById('s'+i);
    s.classList.remove('active','done');
  });
  for (let i=1; i<step; i++) {
    document.getElementById('s'+i).classList.add('done');
    const ln = document.getElementById('sl'+i);
    if (ln) ln.classList.add('done');
  }
  document.getElementById('step-'+step).style.display = 'block';
  document.getElementById('s'+step).classList.add('active');
}

// ============================================================
//  SUBMIT FORM PENDAFTARAN
// ============================================================
async function submitForm() {
  // Validasi
  if (!val('f-nama-anak'))    { alert('Nama anak wajib diisi!');     nextStep(1); return; }
  if (!val('f-tgl-lahir'))    { alert('Tanggal lahir wajib diisi!'); nextStep(1); return; }
  if (!val('f-tempat-lahir')) { alert('Tempat lahir wajib diisi!');  nextStep(1); return; }
  if (!val('f-nama-ayah'))    { alert('Nama ayah wajib diisi!');     nextStep(2); return; }
  if (!val('f-nama-ibu'))     { alert('Nama ibu wajib diisi!');      nextStep(2); return; }
  if (!val('f-no-hp'))        { alert('No. HP wajib diisi!');        nextStep(2); return; }
  if (!val('f-alamat'))       { alert('Alamat wajib diisi!');        nextStep(2); return; }

  const user    = JSON.parse(localStorage.getItem('paud_user') || '{}');
  const payload = {
    user_id:          user.id || null,
    nama_anak:        val('f-nama-anak'),
    jenis_kelamin:    document.getElementById('f-jk')?.value || 'L',
    tanggal_lahir:    val('f-tgl-lahir'),
    tempat_lahir:     val('f-tempat-lahir'),
    anak_ke:          document.getElementById('f-anak-ke')?.value || 1,
    program:          document.getElementById('f-program')?.value || 'TK A',
    tahun_ajaran:     document.getElementById('f-tahun-ajaran')?.value || '2025/2026',
    riwayat_penyakit: val('f-riwayat') || 'Tidak ada',
    nama_ayah:        val('f-nama-ayah'),
    nama_ibu:         val('f-nama-ibu'),
    pekerjaan_ayah:   val('f-pkj-ayah'),
    pekerjaan_ibu:    val('f-pkj-ibu'),
    no_hp:            val('f-no-hp'),
    email_ortu:       val('f-email-ortu'),
    alamat:           val('f-alamat'),
  };

  setBtn('btn-submit-form', true, '✅ Kirim Pendaftaran');
  const res = await callAPI(
    LocalAPI.submitPendaftaran.bind(LocalAPI), [payload],
    'submit_pendaftaran.php', 'POST', payload
  );
  setBtn('btn-submit-form', false, '✅ Kirim Pendaftaran');

  if (res.success) {
    setText('reg-number', res.nomor_daftar);
    showPage('page-success');
    // Reset form
    ['f-nama-anak','f-tgl-lahir','f-tempat-lahir','f-nama-ayah','f-nama-ibu','f-pkj-ayah',
     'f-pkj-ibu','f-no-hp','f-email-ortu','f-alamat','f-riwayat'].forEach(id=>{
      const el = document.getElementById(id); if (el) el.value='';
    });
    nextStep(1);
  } else {
    alert('Pendaftaran gagal: ' + (res.message||'Terjadi kesalahan.'));
  }
}

  // ============================================================
  //  CEK STATUS PENDAFTARAN
  // ============================================================

  // Data pendaftaran simulasi
  const dataPendaftar = [
    { nomor: 'PAUD-2025-001', nama: 'Ahmad Fauzi',     program: 'TK B',           ortu: 'Bpk. Hasan',   tanggal: '03 Jan 2025', status: 'approved' },
    { nomor: 'PAUD-2025-002', nama: 'Siti Rahayu',     program: 'TK A',           ortu: 'Ibu Yanti',    tanggal: '04 Jan 2025', status: 'approved' },
    { nomor: 'PAUD-2025-003', nama: 'Dani Kurniawan',  program: 'Kelompok Bermain', ortu: 'Bpk. Iwan',  tanggal: '05 Jan 2025', status: 'pending'  },
    { nomor: 'PAUD-2025-004', nama: 'Nadia Putri S.',  program: 'TK B',           ortu: 'Ibu Rina',     tanggal: '18 Apr 2025', status: 'pending'  },
    { nomor: 'PAUD-2025-005', nama: 'Rizky Ramadhan',  program: 'TK A',           ortu: 'Bpk. Ridwan',  tanggal: '17 Apr 2025', status: 'approved' },
    { nomor: 'PAUD-2025-006', nama: 'Bima Prasetyo',   program: 'TK A',           ortu: 'Bpk. Agus',    tanggal: '14 Apr 2025', status: 'rejected' },
    { nomor: 'PAUD-2025-022', nama: 'Salwa Hasanah',   program: 'Kelompok Bermain', ortu: 'Ibu Dewi',   tanggal: '15 Apr 2025', status: 'approved' },
    { nomor: 'PAUD-2025-023', nama: 'Rizky Ramadhan',  program: 'TK A',           ortu: 'Bpk. Ridwan',  tanggal: '17 Apr 2025', status: 'approved' },
    { nomor: 'PAUD-2025-024', nama: 'Nadia Putri S.',  program: 'TK B',           ortu: 'Ibu Rina',     tanggal: '18 Apr 2025', status: 'pending'  },
  ];

  function cekStatus() {
    showPage('page-status');
    resetCekStatus();
  }

  function cariStatus() {
    const inputNomor = document.getElementById('input-nomor').value.trim().toUpperCase();
    const inputNama  = document.getElementById('input-nama').value.trim().toLowerCase();
    const errEl      = document.getElementById('status-err');

    if (!inputNomor) {
      errEl.textContent = 'Nomor pendaftaran wajib diisi.';
      errEl.classList.add('show');
      return;
    }

    // Cari di data
    let hasil = dataPendaftar.find(d => d.nomor === inputNomor);

    // Jika nama diisi, cocokkan juga
    if (hasil && inputNama && !hasil.nama.toLowerCase().includes(inputNama)) {
      hasil = null;
    }

    if (!hasil) {
      errEl.textContent = 'Data tidak ditemukan. Periksa kembali nomor pendaftaran Anda.';
      errEl.classList.add('show');
      document.getElementById('status-result').style.display = 'none';
      return;
    }

    errEl.classList.remove('show');
    tampilkanHasil(hasil);
  }

  function tampilkanHasil(data) {
    const card    = document.getElementById('result-card');
    const iconEl  = document.getElementById('result-icon');
    const stText  = document.getElementById('result-status-text');
    const pesanEl = document.getElementById('result-pesan');
    const infoBox = document.getElementById('result-info-box');

    // Isi data detail
    document.getElementById('res-nomor').textContent   = data.nomor;
    document.getElementById('res-nama').textContent    = data.nama;
    document.getElementById('res-program').textContent = data.program;
    document.getElementById('res-ortu').textContent    = data.ortu;
    document.getElementById('res-tanggal').textContent = data.tanggal;

    // Badge status
    const badgeMap = {
      approved: '<span class="badge approved">Diterima</span>',
      pending:  '<span class="badge pending">Menunggu Verifikasi</span>',
      rejected: '<span class="badge rejected">Tidak Diterima</span>',
    };
    document.getElementById('res-badge').innerHTML = badgeMap[data.status];

    // Tampilan card sesuai status
    if (data.status === 'approved') {
      card.className    = 'status-result-card result-approved';
      iconEl.textContent = '✅';
      stText.textContent = 'Selamat, Diterima!';
      pesanEl.textContent = 'Anak Anda berhasil diterima di PAUD Mahkota Raya. Segera lakukan daftar ulang.';
      infoBox.innerHTML  = '<div class="result-info approved-info">📋 <b>Langkah selanjutnya:</b> Harap datang ke sekolah untuk daftar ulang membawa fotokopi Akta Kelahiran, KK, dan pas foto 3×4. Hubungi kami di <b>(0711) 123-4567</b> untuk info lebih lanjut.</div>';
    } else if (data.status === 'pending') {
      card.className    = 'status-result-card result-pending';
      iconEl.textContent = '⏳';
      stText.textContent = 'Sedang Diproses';
      pesanEl.textContent = 'Pendaftaran Anda sedang dalam proses verifikasi oleh tim kami.';
      infoBox.innerHTML  = '<div class="result-info pending-info">📞 <b>Info:</b> Proses verifikasi memerlukan 1–3 hari kerja. Kami akan menghubungi Anda melalui nomor telepon yang didaftarkan. Pastikan nomor aktif.</div>';
    } else {
      card.className    = 'status-result-card result-rejected';
      iconEl.textContent = '❌';
      stText.textContent = 'Mohon Maaf, Belum Diterima';
      pesanEl.textContent = 'Kuota untuk program yang dipilih telah terpenuhi pada tahap ini.';
      infoBox.innerHTML  = '<div class="result-info rejected-info">💬 <b>Informasi:</b> Anda dapat mendaftar kembali pada tahun ajaran berikutnya atau menghubungi kami di <b>paudmahkotaraya@gmail.com</b> untuk informasi lebih lanjut.</div>';
    }

    document.getElementById('status-search-box').style.display = 'none';
    document.getElementById('status-result').style.display = 'block';
  }

  function resetCekStatus() {
    document.getElementById('input-nomor').value = '';
    document.getElementById('input-nama').value  = '';
    document.getElementById('status-err').classList.remove('show');
    document.getElementById('status-search-box').style.display = 'block';
    document.getElementById('status-result').style.display = 'none';
  }

// ============================================================
//  DASHBOARD
// ============================================================
async function loadDashboard() {
  const res = await callAPI(
    LocalAPI.getStatistik.bind(LocalAPI), [],
    'get_statistik.php', 'GET', {}
  );
  if (!res.success) return;
  setText('stat-total',    res.total);
  setText('stat-diterima', res.diterima);
  setText('stat-menunggu', res.menunggu);
  setText('stat-tersisa',  res.kuota_tersisa);
  renderTabelOverview(res.terbaru || []);
  renderLaporan(res.per_program || []);
  loadTabelPendaftar();
}

function renderTabelOverview(data) {
  const tb = document.getElementById('tbody-overview');
  if (!tb) return;
  tb.innerHTML = data.length
    ? data.map(d=>`<tr><td>${d.nomor_daftar}</td><td>${d.nama_anak}</td><td>${d.program}</td><td>${d.tgl_daftar||'-'}</td><td>${badgeHTML(d.status)}</td></tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:16px">Belum ada data</td></tr>';
}

async function loadTabelPendaftar(search='') {
  const tb = document.getElementById('table-body');
  if (!tb) return;
  tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:20px">⏳ Memuat data...</td></tr>';

  const res = await callAPI(
    LocalAPI.getPendaftaran.bind(LocalAPI), [search, ''],
    'get_pendaftaran.php', 'GET', search ? { search } : {}
  );

  if (!res.success) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;padding:16px">Gagal memuat data.</td></tr>';
    return;
  }
  tb.innerHTML = res.data.length
    ? res.data.map(d=>`
        <tr>
          <td>${d.nomor_daftar}</td>
          <td>${d.nama_anak}</td>
          <td>${d.jenis_kelamin}</td>
          <td>${d.program}</td>
          <td>${d.nama_ayah||d.nama_ibu||'-'}</td>
          <td>${badgeHTML(d.status)}</td>
          <td>
            <button class="action-btn" onclick="showDetail(${d.id})">Detail</button>
            ${d.status==='menunggu' ? `<button class="action-btn success" onclick="ubahStatus(${d.id},'diterima',this)">Terima</button>` : ''}
            ${d.status!=='ditolak'  ? `<button class="action-btn danger"  onclick="ubahStatus(${d.id},'ditolak',this)">Tolak</button>`   : ''}
          </td>
        </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:16px">Tidak ada data ditemukan</td></tr>';

  renderTabelDiterima(res.data.filter(d=>d.status==='diterima'));
}

function renderTabelDiterima(data) {
  const tb = document.getElementById('tbody-diterima');
  if (!tb) return;
  tb.innerHTML = data.length
    ? data.map((d,i)=>`<tr><td>${i+1}</td><td>${d.nama_anak}</td><td>${d.program}</td><td>${d.tgl_daftar||'-'}</td><td>${d.no_hp||'-'}</td></tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:16px">Belum ada siswa diterima</td></tr>';
}

function renderLaporan(data) {
  const tb = document.getElementById('tbody-laporan');
  if (!tb) return;
  const kuota = {'TK B':10,'TK A':10,'Kelompok Bermain':4};
  let tot = {total:0,diterima:0,ditolak:0,menunggu:0};
  const rows = data.map(d => {
    const pct = kuota[d.program] ? Math.round((+d.diterima/kuota[d.program])*100)+'%' : '-';
    tot.total+=+d.total; tot.diterima+=+d.diterima; tot.ditolak+=+d.ditolak; tot.menunggu+=+d.menunggu;
    return `<tr><td>${d.program}</td><td>${d.total}</td><td>${d.diterima}</td><td>${d.ditolak}</td><td>${d.menunggu}</td><td>${pct}</td></tr>`;
  }).join('');
  tb.innerHTML = rows + `<tr style="font-weight:700;background:#f8fbff;"><td>Total</td><td>${tot.total}</td><td>${tot.diterima}</td><td>${tot.ditolak}</td><td>${tot.menunggu}</td><td>-</td></tr>`;
  const map = {'TK B':'stat-tkb','TK A':'stat-tka','Kelompok Bermain':'stat-kb'};
  data.forEach(d => { if (map[d.program]) setText(map[d.program], d.diterima); });
  setText('stat-total-lap', tot.total);
}

async function ubahStatus(id, status, btn) {
  if (!confirm('Yakin ingin '+(status==='diterima'?'menerima':'menolak')+' pendaftar ini?')) return;
  btn.disabled=true; btn.textContent='⏳';
  const res = await callAPI(
    LocalAPI.updateStatus.bind(LocalAPI), [id, status],
    'update_status.php', 'POST', { id, status }
  );
  if (res.success) {
    loadDashboard();
  } else {
    alert('Gagal: '+(res.message||'Error'));
    btn.disabled=false;
  }
}

async function showDetail(id) {
  const res = await callAPI(
    LocalAPI.getDetail.bind(LocalAPI), [id],
    'get_pendaftaran.php', 'GET', { id }
  );
  const d = res.data?.[0];
  if (!d) { alert('Data tidak ditemukan.'); return; }
  alert(
    '📋 DETAIL PENDAFTAR\n────────────────────────────\n'+
    'No. Daftar   : '+d.nomor_daftar+'\n'+
    'Nama Anak    : '+d.nama_anak+' ('+d.jenis_kelamin+')\n'+
    'Tgl. Lahir   : '+(d.tanggal_lahir||'-')+'\n'+
    'Tempat Lahir : '+(d.tempat_lahir||'-')+'\n'+
    'Program      : '+d.program+'\n'+
    '────────────────────────────\n'+
    'Ayah         : '+(d.nama_ayah||'-')+'\n'+
    'Ibu          : '+(d.nama_ibu||'-')+'\n'+
    'Pekerjaan    : '+(d.pekerjaan_ayah||'-')+' / '+(d.pekerjaan_ibu||'-')+'\n'+
    'No. HP       : '+(d.no_hp||'-')+'\n'+
    'Email        : '+(d.email_ortu||'-')+'\n'+
    'Alamat       : '+(d.alamat||'-')+'\n'+
    '────────────────────────────\n'+
    'Status       : '+d.status.toUpperCase()+
    (d.riwayat_penyakit&&d.riwayat_penyakit!=='Tidak ada' ? '\nRiwayat      : '+d.riwayat_penyakit : '')+
    (d.catatan_admin ? '\nCatatan Admin: '+d.catatan_admin : '')
  );
}

// ============================================================
//  TAB DASHBOARD
// ============================================================
function showDashTab(tabId, menuEl) {
  ['tab-overview','tab-pendaftar','tab-terima','tab-laporan'].forEach(id=>{
    document.getElementById(id).style.display='none';
  });
  document.getElementById(tabId).style.display='block';
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active'));
  menuEl.classList.add('active');
  if (tabId==='tab-pendaftar') loadTabelPendaftar();
  if (tabId==='tab-laporan')   loadDashboard();
}

let filterTimer;
function filterTable(input) {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(()=>loadTabelPendaftar(input.value.trim()), 350);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  DB.init();

  const admin = JSON.parse(localStorage.getItem('paud_admin') || 'null');
  const user  = JSON.parse(localStorage.getItem('paud_user')  || 'null');

  if (admin) {
    showPage('page-dashboard');
    loadDashboard();
  } else if (user) {
    setUserNav(user.nama || user.email?.split('@')[0] || 'Pengguna');
    showPage('page-home');
  } else {
    showPage('page-login');
  }

  // Banner mode demo jika bukan server
  if (!HAS_SERVER) {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1565c0;color:#fff;text-align:center;padding:8px 16px;font-size:12px;z-index:9999;font-family:Nunito,sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;';
    banner.innerHTML = '🖥️ <b>Mode Demo</b> — Data tersimpan di browser lokal. Pasang di server PHP+MySQL untuk fitur penuh. <button onclick="this.parentNode.remove()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:12px;">Tutup ✕</button>';
    document.body.appendChild(banner);
  }
});
