import React, { useState } from "react";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("https://localhost:7031/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error("Sai tài khoản hoặc mật khẩu");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            if (data.role === "admin") {
                window.location.href = "/admin";
            } else if (data.role === "staff") {
                window.location.href = "/";
            } else if (data.role === "kitchen") {
                window.location.href = "/kitchenpage";
            } else {
                window.location.href = "/";
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            {/* Nút quay lại trang chủ */}
            <button 
                style={styles.backButton} 
                onClick={() => window.location.href = "/"}
            >
                ← Trang chủ
            </button>

            <div style={styles.card}>
                <div style={styles.logo}>🍴</div>

                <h1 style={styles.title}>QUẢN LÝ NHÀ HÀNG</h1>
                <p style={styles.subtitle}>Đăng nhập để tiếp tục</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tên đăng nhập</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mật khẩu</label>
                        <div style={{ position: "relative" }}>
                            <input
                                style={styles.input}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                style={styles.showBtn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Ẩn" : "Hiện"}
                            </span>
                        </div>
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <button style={styles.button} disabled={loading}>
                        {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        position: "relative", // Đã thêm position relative để định vị nút Back
        height: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: "20px",
        left: "20px",
        padding: "10px 16px",
        borderRadius: "10px",
        // border: "2px solid black",
        backgroundColor: "#fff",
        color: "#000",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
    },
    card: {
        width: "420px",
        padding: "50px 40px",
        borderRadius: "20px",
        border: "2px solid black",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        textAlign: "center",
    },
    logo: {
        width: "90px",
        height: "90px",
        borderRadius: "50%",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto 25px",
        fontSize: "36px",
    },
    title: {
        fontSize: "22px",
        fontWeight: "bold",
        marginBottom: "8px",
    },
    subtitle: {
        fontSize: "14px",
        marginBottom: "35px",
    },
    inputGroup: {
        textAlign: "left",
        marginBottom: "25px",
    },
    label: {
        fontWeight: 600,
        fontSize: "14px",
        display: "block",
        marginBottom: "8px",
    },
    input: {
        width: "100%",
        padding: "14px",
        boxSizing: "border-box", // Thêm dòng này để input không bị tràn viền khi có padding
        borderRadius: "12px",
        border: "2px solid black",
        backgroundColor: "#fff",
        fontSize: "14px",
        outline: "none",
    },
    showBtn: {
        position: "absolute",
        right: "15px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 600,
    },
    button: {
        width: "100%",
        padding: "15px",
        borderRadius: "14px",
        border: "2px solid black",
        backgroundColor: "#000",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
    },
    error: {
        color: "red", 
        marginBottom: "15px",
        fontWeight: "bold",
        fontSize: "13px",
    },
};

export default Login;