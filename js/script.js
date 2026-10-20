/* ============================================================
   script.js — JavaScript dùng chung cho toàn dự án
   Mỗi module được bảo vệ (chỉ chạy khi element tương ứng tồn tại)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Navigation: highlight trang đang active ---------- */
  function initNav() {
    var path = location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav-menu a');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
    });
  }

  /* ============================================================
     BÀI TẬP 01 — Danh sách sản phẩm & tìm kiếm
     ============================================================ */
  function initBaiTap01() {
    var grid = document.getElementById('productGrid');
    if (!grid) return; // chỉ chạy trên trang baitap01.html

    var searchInput = document.getElementById('searchInput');
    var searchBtn = document.getElementById('searchBtn');
    var resetBtn = document.getElementById('resetBtn');
    var errorMsg = document.getElementById('errorMsg');
    var stats = document.getElementById('stats');

    // Mảng sản phẩm — chuẩn hóa sẵn tên thường để tối ưu tìm kiếm
    var products = [
      { id: 1, name: 'Điện thoại iPhone 15',   price: 25990000, category: 'Điện thoại', icon: '📱' },
      { id: 2, name: 'Laptop MacBook Air M2',  price: 28990000, category: 'Máy tính',   icon: '💻' },
      { id: 3, name: 'Tai nghe AirPods Pro',    price: 6490000,  category: 'Phụ kiện',   icon: '🎧' },
      { id: 4, name: 'Đồng hồ Apple Watch S9',  price: 11990000, category: 'Đồng hồ',    icon: '⌚' },
      { id: 5, name: 'Máy ảnh Canon EOS R50',   price: 18500000, category: 'Máy ảnh',    icon: '📷' },
      { id: 6, name: 'Bàn phím cơ Keychron K2', price: 2190000,  category: 'Phụ kiện',   icon: '⌨️' },
      { id: 7, name: 'Loa JBL Charge 5',        price: 3490000,  category: 'Âm thanh',   icon: '🔊' }
    ].map(function (p) { p.nameLower = p.name.toLowerCase(); return p; });

    var fmt = function (n) { return n.toLocaleString('vi-VN') + ' ₫'; };

    // Render — dùng DocumentFragment để tối ưu DOM (1 lần reflow)
    function renderProducts(list) {
      grid.innerHTML = '';
      var fragment = document.createDocumentFragment();
      list.forEach(function (p) {
        var card = document.createElement('div');
        card.className = 'product-card';
        // icon là tĩnh → innerHTML an toàn; tên/giá dùng textContent chống XSS
        var icon = document.createElement('div');
        icon.className = 'product-icon';
        icon.textContent = p.icon;
        var name = document.createElement('div');
        name.className = 'product-name';
        name.textContent = p.name;
        var price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = fmt(p.price);
        var cat = document.createElement('div');
        cat.className = 'product-category';
        cat.textContent = p.category;
        card.append(icon, name, price, cat);
        fragment.appendChild(card);
      });
      grid.appendChild(fragment);
      stats.textContent = 'Hiển thị ' + list.length + ' / ' + products.length + ' sản phẩm';
    }

    function filterProducts(keyword) {
      var kw = keyword.trim().toLowerCase();
      if (!kw) return products;
      return products.filter(function (p) { return p.nameLower.indexOf(kw) !== -1; });
    }

    function doSearch() {
      var result = filterProducts(searchInput.value);
      if (result.length === 0) {
        errorMsg.classList.add('show');
        grid.innerHTML = '';
        stats.textContent = '0 kết quả';
      } else {
        errorMsg.classList.remove('show');
        renderProducts(result);
      }
    }

    // Debounce 300ms: chỉ lọc khi người dùng ngừng gõ
    var debounceTimer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doSearch, 300);
    });
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
    resetBtn.addEventListener('click', function () {
      searchInput.value = '';
      errorMsg.classList.remove('show');
      renderProducts(products);
    });

    renderProducts(products);
  }

  /* ============================================================
     BÀI TẬP 02 — Form đăng ký & Validation + LocalStorage
     ============================================================ */
  function initBaiTap02() {
    var form = document.getElementById('registerForm');
    if (!form) return;

    var nameInp = document.getElementById('name');
    var emailInp = document.getElementById('email');
    var passInp = document.getElementById('password');
    var agreeChk = document.getElementById('agree');
    var successMsg = document.getElementById('successMsg');
    var userList = document.getElementById('userList');
    var strengthFill = document.getElementById('strengthFill');
    var strengthLabel = document.getElementById('strengthLabel');

    var STORAGE_KEY = 'app_users_v1';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    function setError(input, errEl, msg) {
      errEl.textContent = msg;
      input.classList.add('invalid');
      input.classList.remove('valid');
    }
    function setValid(input, errEl) {
      errEl.textContent = '';
      input.classList.remove('invalid');
      input.classList.add('valid');
    }
    function validateName() {
      var v = nameInp.value.trim();
      var err = document.getElementById('nameErr');
      if (!v) { setError(nameInp, err, 'Vui lòng nhập họ tên.'); return false; }
      if (v.length < 2) { setError(nameInp, err, 'Họ tên tối thiểu 2 ký tự.'); return false; }
      setValid(nameInp, err); return true;
    }
    function validateEmail() {
      var v = emailInp.value.trim();
      var err = document.getElementById('emailErr');
      if (!v) { setError(emailInp, err, 'Vui lòng nhập email.'); return false; }
      if (!emailRegex.test(v)) { setError(emailInp, err, 'Email không hợp lệ.'); return false; }
      setValid(emailInp, err); return true;
    }
    function validatePass() {
      var v = passInp.value;
      var err = document.getElementById('passErr');
      if (!v) { setError(passInp, err, 'Vui lòng nhập mật khẩu.'); return false; }
      if (!passRegex.test(v)) { setError(passInp, err, 'Mật khẩu phải ≥ 8 ký tự, có chữ hoa, thường và số.'); return false; }
      setValid(passInp, err); return true;
    }
    function validateAgree() {
      var err = document.getElementById('agreeErr');
      if (!agreeChk.checked) { err.textContent = 'Bạn phải đồng ý điều khoản.'; return false; }
      err.textContent = ''; return true;
    }

    // Thanh độ mạnh mật khẩu realtime
    passInp.addEventListener('input', function () {
      var v = passInp.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      strengthFill.style.width = (score * 25) + '%';
      var colors = ['#dc2626', '#f59e0b', '#eab308', '#10b981'];
      var labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh'];
      strengthFill.style.background = colors[Math.max(0, score - 1)] || '#dc2626';
      strengthLabel.textContent = v ? 'Độ mạnh: ' + (labels[score - 1] || 'Rất yếu') : 'Độ mạnh mật khẩu';
    });

    nameInp.addEventListener('blur', validateName);
    emailInp.addEventListener('blur', validateEmail);
    passInp.addEventListener('blur', validatePass);
    agreeChk.addEventListener('change', validateAgree);

    function getUsers() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch (e) { return []; }
    }
    function saveUser(user) {
      try {
        var users = getUsers();
        users.push(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return true;
      } catch (e) {
        alert('Lỗi lưu dữ liệu: ' + e.message);
        return false;
      }
    }
    function renderUserList() {
      var users = getUsers();
      if (!users.length) { userList.innerHTML = '<li>Chưa có người dùng nào.</li>'; return; }
      userList.innerHTML = users.map(function (u) {
        return '<li>' + u.name + ' — ' + u.email + ' (lúc ' + u.createdAt + ')</li>';
      }).join('');
    }

    // Xử lý submit: preventDefault chặn reload, validate toàn bộ
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      successMsg.classList.remove('show');
      var ok = validateName() && validateEmail() && validatePass() && validateAgree();
      if (!ok) return;

      var user = {
        name: nameInp.value.trim(),
        email: emailInp.value.trim(),
        // Base64 chỉ che mặt, KHÔNG phải mã hóa bảo mật — chỉ dùng cho bài tập
        passwordHash: btoa(passInp.value),
        createdAt: new Date().toLocaleString('vi-VN')
      };
      if (saveUser(user)) {
        successMsg.classList.add('show');
        form.reset();
        [nameInp, emailInp, passInp].forEach(function (i) { i.classList.remove('valid'); });
        strengthFill.style.width = '0%';
        strengthLabel.textContent = 'Độ mạnh mật khẩu';
        renderUserList();
        setTimeout(function () { successMsg.classList.remove('show'); }, 5000);
      }
    });

    renderUserList();
  }

  /* ============================================================
     BÀI TẬP 03 — Đồng hồ đếm ngược 10 phút
     ============================================================ */
  function initBaiTap03() {
    var timeText = document.getElementById('timeText');
    if (!timeText) return;

    var TOTAL_MS = 10 * 60 * 1000;
    var CIRCUMFERENCE = 2 * Math.PI * 120;
    var ringFg = document.getElementById('ringFg');
    var timerRing = document.getElementById('timerRing');
    var startBtn = document.getElementById('startBtn');
    var pauseBtn = document.getElementById('pauseBtn');
    var resetBtn = document.getElementById('resetBtn');
    var modalOverlay = document.getElementById('modalOverlay');
    var modalClose = document.getElementById('modalClose');

    var timerId = null;
    var remaining = TOTAL_MS;
    var endTime = 0;

    ringFg.style.strokeDasharray = CIRCUMFERENCE;

    function format(ms) {
      var totalSec = Math.max(0, Math.ceil(ms / 1000));
      var m = String(Math.floor(totalSec / 60)).padStart(2, '0');
      var s = String(totalSec % 60).padStart(2, '0');
      return m + ':' + s;
    }

    function updateUI() {
      timeText.textContent = format(remaining);
      var ratio = remaining / TOTAL_MS;
      ringFg.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
      if (remaining <= 60000 && remaining > 0) timerRing.classList.add('warning');
      else timerRing.classList.remove('warning');
    }

    function beep() {
      try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.start(); osc.stop(ctx.currentTime + 1);
      } catch (e) { /* trình duyệt chặn audio */ }
    }

    function tick() {
      remaining = endTime - Date.now(); // dựa trên Date.now() → không bị trôi lệch
      if (remaining <= 0) {
        remaining = 0;
        updateUI();
        stopTimer();
        beep();
        modalOverlay.classList.add('show');
        return;
      }
      updateUI();
    }

    function startTimer() {
      if (timerId !== null) return; // tránh tạo nhiều interval cùng lúc
      endTime = Date.now() + remaining;
      timerId = setInterval(tick, 250);
      startBtn.disabled = true;
      pauseBtn.disabled = false;
    }

    function stopTimer() {
      if (timerId !== null) {
        clearInterval(timerId); // quan trọng: tránh memory leak
        timerId = null;
      }
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }

    function pauseTimer() {
      if (timerId === null) return;
      remaining = endTime - Date.now();
      stopTimer();
    }

    function resetTimer() {
      stopTimer();
      remaining = TOTAL_MS;
      modalOverlay.classList.remove('show');
      updateUI();
    }

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    modalClose.addEventListener('click', resetTimer);
    // Dọn dẹp khi rời trang
    window.addEventListener('beforeunload', stopTimer);

    updateUI();
  }

  /* ---------- Trang Contact: form liên hệ ---------- */
  function initContact() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contactName').value.trim();
      var email = document.getElementById('contactEmail').value.trim();
      var msg = document.getElementById('contactMessage').value.trim();
      var notice = document.getElementById('contactNotice');
      if (!name || !email || !msg) {
        notice.textContent = '⚠️ Vui lòng điền đầy đủ thông tin.';
        notice.style.color = '#dc2626';
        return;
      }
      notice.textContent = '✅ Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.';
      notice.style.color = '#059669';
      form.reset();
    });
  }

  /* ---------- Khởi tạo tất cả module ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initBaiTap01();
    initBaiTap02();
    initBaiTap03();
    initContact();
  });
})();
