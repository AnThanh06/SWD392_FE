import axios from "axios";
import { useEffect, useState } from "react";

type Staff = {
    id: number;
    username: string;
    fullname: string;
    isActive: boolean;
};

export default function StaffManagementPage() {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

    const fetchStaffs = async () => {
        try {
            const res = await axios.get("https://localhost:7031/api/admin/staff", getAuthConfig());
            setStaffs(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách staff:", error);
        }
    };

    useEffect(() => { fetchStaffs(); }, []);

    const resetForm = () => {
        setUsername("");
        setPassword("");
        setFullname("");
        setIsActive(true);
        setEditingStaffId(null);
    };

    const saveStaff = async () => {
        if (!username.trim() || !fullname.trim()) return alert("Vui lòng nhập Username và Fullname!");

        try {
            if (editingStaffId) {
                await axios.put(`https://localhost:7031/api/admin/staff/${editingStaffId}`, {
                    fullname: fullname,
                    isActive: isActive
                }, getAuthConfig());
                alert("Cập nhật thành công!");
            } else {
                if (!password.trim()) return alert("Vui lòng nhập Mật khẩu cho tài khoản mới!");
                await axios.post("https://localhost:7031/api/admin/staff", {
                    username: username,
                    password: password,
                    fullname: fullname,
                    role: "staff"
                }, getAuthConfig());
                alert("Tạo mới thành công!");
            }
            resetForm();
            fetchStaffs();
        } catch (error) {
            console.error("Lỗi khi lưu staff:", error);
            alert("Có lỗi xảy ra khi lưu!");
        }
    };

    const editStaff = (staff: Staff) => {
        setUsername(staff.username);
        setFullname(staff.fullname);
        setIsActive(staff.isActive);
        setPassword("***"); // Mật khẩu không trả về nên để placeholder
        setEditingStaffId(staff.id);
    };

    const deleteStaff = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn vô hiệu hóa/xóa Staff này không?")) return;
        try {
            await axios.delete(`https://localhost:7031/api/admin/staff/${id}`, getAuthConfig());
            alert("Xóa/Vô hiệu hóa thành công!");
            fetchStaffs();
        } catch (error) {
            console.error("Lỗi khi xóa staff:", error);
            alert("Lỗi khi xóa!");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Quản Lý Nhân Viên (Staff)</h1>
            <div className="flex flex-col gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-wrap gap-4">
                    <input value={username} onChange={e => setUsername(e.target.value)} disabled={!!editingStaffId} placeholder="Username..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={!!editingStaffId} placeholder="Password..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <input value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Họ tên..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
                    {editingStaffId && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5" />
                            <span className="font-medium">Đang hoạt động (Active)</span>
                        </label>
                    )}
                    <button onClick={saveStaff} className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800">
                        {editingStaffId ? "Cập nhật" : "Tạo mới"}
                    </button>
                    {editingStaffId && <button onClick={resetForm} className="px-6 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg">Hủy</button>}
                </div>
            </div>

            <div className="overflow-hidden border rounded-lg shadow-sm">
                <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fullname</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                        {staffs.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">#{s.id}</td>
                                <td className="px-6 py-4 text-sm font-medium">{s.username}</td>
                                <td className="px-6 py-4 text-sm">{s.fullname}</td>
                                <td className="px-6 py-4 text-sm">{s.isActive !== false ? <span className="text-green-600 font-bold">Active</span> : <span className="text-red-500 font-bold">Inactive</span>}</td>
                                <td className="px-6 py-4 text-sm text-center">
                                    <button onClick={() => editStaff(s)} className="text-blue-600 mr-3">Sửa</button>
                                    <button onClick={() => deleteStaff(s.id)} className="text-red-600">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
