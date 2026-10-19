/* =========================================================
   Món Quà 20/10 — config.js
   Cấu hình cho khu vực người gửi (admin).
   ========================================================= */
window.GIFT_CONFIG = {
  /*
   * Mật khẩu đăng nhập của người gửi, lưu dưới dạng mã SHA-256
   * (để người xem mã nguồn không đọc được mật khẩu gốc).
   * Mặc định mật khẩu là:  yeuthuong2010
   *
   * Đổi mật khẩu: mở trang web, nhấn F12 → tab Console, gõ
   *     hashPassword('mật khẩu mới')
   * rồi dán chuỗi kết quả vào đây.
   */
  ADMIN_PASSWORD_HASH: '8c12396008259384b23a1130ab5417d37aa53bf483fdb9dc5a363a338afce453',

  /*
   * Địa chỉ trang web khi đã đưa lên mạng, ví dụ:
   *     'https://mon-qua-2010.netlify.app/'
   * Để trống thì link gửi người nhận dùng đúng địa chỉ trang đang mở.
   */
  SHARE_BASE_URL: '',

  /*
   * Thư viện nhạc có sẵn cho bản tự đưa lên mạng (Netlify, GitHub Pages…).
   * Bỏ file nhạc vào thư mục "music" cạnh index.html rồi khai báo ở đây:
   *     { name: 'Tên hiển thị', url: 'music/ten-file.mp3' },
   * Khi chạy trên Claude, bạn tải nhạc lên ngay trong trang nên không cần mục này.
   */
  MUSIC_LIBRARY: [
    // { name: 'Bài hát của chúng mình', url: 'music/bai-hat.mp3' },
  ]
};
