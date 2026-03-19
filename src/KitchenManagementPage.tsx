import axios from "axios";
import { useEffect, useState } from "react";

type KitchenStaff = {
    id: number;
    username: string;
    fullname: string;
};

export default function KitchenManagementPage() {
    const [kitchens, setKitchens] = useState<KitchenStaff[]>([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");

    const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

    const fetchKitchens = async () => {
        try {
            const res = await axios.get("https://localhost:7031/api/admin/kitchen", getAuthConfig());
            setKitchens(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách bếp:", error);
        }
    };

    useEffect(() => { fetchKitchens(); }, []);

    const resetForm = () => {
        setUsername("");
        setPassword("");
        setFullname("");
    };

    const saveKitchen = async () => {
        if (!username.trim() || !password.trim() || !fullname.trim()) return alert("Vui lòng nhập đủ thông tin!");

        try {
            await axios.post("https://localhost:7031/api/admin/kitchen", {
                username: username,
                password: password,
                fullname: fullname,
                role: "kitchen"
            }, getAuthConfig());
            alert("Tạo mới tài khoản Bếp thành công!");
            resetForm();
            fetchKitchens();
        } catch (error) {
            console.error("Lỗi khi lưu bếp:", error);
            alert("Có lỗi xảy ra khi lưu!");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Quản Lý Nhà Bếp (Kitchen)</h1>
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
                <input value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Họ tên..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" />
                
                <button onClick={saveKitchen} className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800">
                    Tạo mới Bếp
                </button>
            </div>

            <div className="overflow-hidden border rounded-lg shadow-sm">
                <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fullname</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                        {kitchens.map(k => (
                            <tr key={k.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">#{k.id}</td>
                                <td className="px-6 py-4 text-sm font-medium">{k.username}</td>
                                <td className="px-6 py-4 text-sm">{k.fullname}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
