# Hướng Dẫn Tác Nhân AI (AI Agent Instructions - Template)

Đây là bộ luật lõi (Core Rules) cho Hệ sinh thái Đa tác nhân (Virtual IT Department). Mọi tác nhân (PM, BA, Dev, QA, Ops...) ĐỀU PHẢI tuân thủ các nguyên tắc này.

## Bắt Đầu Tại Đây (Start Here)
1. Đọc `agent-progress.md` để hiểu trạng thái hiện tại của phiên làm việc.
2. Đọc `features.json` để xác định tính năng đang ở trạng thái `IN_PROGRESS`.
3. Chỉ làm việc trên MỘT tính năng tại một thời điểm.

## Lớp 1: Quy Tắc Tối Ưu Ngữ Cảnh & Chi Phí (Cost & Context Rules)
- **Kỷ luật Đầu ra (Cắt Output):** Tuyệt đối không giải thích dài dòng (no explanations). Phản hồi cực kỳ ngắn gọn (concise). Trả về dữ liệu JSON phải tối giản key nhất có thể.
- **Quy Hoạch 30s:** (Dành cho TechLead/Planner) Luôn phác thảo kế hoạch 3 bước trước khi viết code cho một module mới. Yêu cầu phê duyệt (Request Approval) trước khi tiến hành code diện rộng.
- **Dọn dẹp phiên:** Sau khi hoàn thành một module logic, yêu cầu user clear context để tránh phình bộ nhớ.
- **Giới hạn tham chiếu:** Chỉ đọc những file thực sự cần thiết, nên yêu cầu AST hoặc Repo-map thay vì đọc toàn bộ file bừa bãi.

## Lớp 2: Ranh Giới Phạm Vi & Trạng Thái (Scope & State Rules)
- Trước khi sửa bất kỳ tệp nào (với các tác nhân Dev/Ops), phải kiểm tra xem tệp đó có nằm trong mảng `scope` của tính năng hiện tại trong `features.json` hay không.
- Nếu tệp NẰM NGOÀI phạm vi: KHÔNG ĐƯỢC tự ý sửa. Hãy ghi chú vào phần "Observations" trong `agent-progress.md`.
- Trạng thái công việc luôn được lưu trữ liên tục qua `agent-progress.md` để bàn giao giữa các tác nhân (Handoff).

## Lớp 3: Kỷ Luật Đa Tác Nhân (Multi-Agent Protocol)
- **Sự cách ly:** Các tác nhân không làm thay việc của nhau. 
  - *TechLead* chỉ đọc và ra `SessionBrief.md`. Không viết code.
  - *Dev* chỉ viết code theo `SessionBrief.md`. Không tự khám phá scope.
  - *QA* chỉ chạy test và chấm điểm Rubric. Không sửa lỗi.
- **Giao Thức Xác Minh (Verification Protocol):**
  - Một tính năng chỉ được đánh dấu COMPLETE khi QA đánh giá PASS 10/10.
  - Test runner exit code phải là 0.
  - Thỏa mãn 100% `definition_of_done` trong `features.json`.
