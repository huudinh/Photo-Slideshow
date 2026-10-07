# Gom các file cần tải lên hosting vào thư mục build\
#
# Ứng dụng không có bước biên dịch — script này chỉ chép file và kèm .htaccess.
# Chạy: powershell -ExecutionPolicy Bypass -File tao-build.ps1

$ErrorActionPreference = 'Stop'
$goc = $PSScriptRoot
$dich = Join-Path $goc 'build'

# Đúng những gì cần nằm trên hosting. README.md và chính script này KHÔNG nằm trong.
$canCo = @('index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'public')

# --- Chặn trước: thiếu file thì dừng, đừng tạo ra bản build hỏng ---
$thieu = $canCo | Where-Object { -not (Test-Path (Join-Path $goc $_)) }
if ($thieu) {
    throw "Thiếu: $($thieu -join ', ')"
}

# css\tailwind.css là file đã dựng sẵn, không sinh ra lúc build. Thiếu nó thì
# trang lên hình nhưng mất sạch bố cục — kiểm tra riêng cho chắc.
$twCss = Join-Path $goc 'css\tailwind.css'
if ((Get-Item $twCss).Length -lt 10KB) {
    throw "css\tailwind.css chỉ có $((Get-Item $twCss).Length) byte — nhiều khả năng dựng hỏng."
}

# --- Dọn bản cũ rồi chép ---
if (Test-Path $dich) { Remove-Item $dich -Recurse -Force }
New-Item -ItemType Directory -Path $dich | Out-Null

foreach ($m in $canCo) {
    Copy-Item (Join-Path $goc $m) -Destination $dich -Recurse -Force
}

# css\tailwind.src.css chỉ dùng khi dựng lại CSS, không cần trên hosting.
$src = Join-Path $dich 'css\tailwind.src.css'
if (Test-Path $src) { Remove-Item $src -Force }

# --- .htaccess ---
# Lý do phải khai rõ Cache-Control: hosting dùng LiteSpeed thường tự gắn thêm
# cache dài ngày cho file tĩnh. Nếu để vậy, sửa mã xong tải lên mà máy khách
# vẫn chạy bản cũ cả tuần.
$htaccess = @'
# Khung Tranh Kỹ Thuật Số — cấu hình cho cPanel / LiteSpeed

DirectoryIndex index.html

AddType application/manifest+json .webmanifest
AddType image/svg+xml            .svg
AddType text/javascript          .js

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/manifest+json image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  # Ảnh và icon hầu như không đổi — cho cache 7 ngày.
  <FilesMatch "\.(png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>

  # Mã nguồn không gắn mã băm vào tên file, nên bắt trình duyệt hỏi lại mỗi lần.
  # File không đổi thì máy chủ trả 304, gần như không tốn băng thông.
  <FilesMatch "\.(js|css|webmanifest)$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>

  # Hai file này quyết định bản nào được chạy — tuyệt đối không cache.
  # Khối này để CUỐI để ghi đè các khối ở trên.
  <FilesMatch "^(sw\.js|index\.html)$">
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
  </FilesMatch>
</IfModule>
'@
# UTF-8 không BOM — Apache không đọc được dòng đầu nếu có BOM.
[System.IO.File]::WriteAllText(
    (Join-Path $dich '.htaccess'),
    ($htaccess -replace "`r`n", "`n"),
    (New-Object System.Text.UTF8Encoding $false)
)

# --- Báo kết quả ---
$files = Get-ChildItem $dich -Recurse -File -Force
$kb = [math]::Round(($files | Measure-Object Length -Sum).Sum / 1KB, 1)
Write-Host ""
Write-Host "build\  —  $($files.Count) file, $kb KB" -ForegroundColor Green
Write-Host ""
$files | ForEach-Object {
    $rel = $_.FullName.Substring($dich.Length + 1)
    '{0,-42} {1,8:N0} byte' -f $rel, $_.Length
}
Write-Host ""
Write-Host "Tải toàn bộ nội dung bên trong build\ lên public_html (không tải chính thư mục build)."
