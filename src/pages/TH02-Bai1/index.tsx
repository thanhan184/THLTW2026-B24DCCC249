import { useState } from "react";
import { Typography, Button, Card, List, Space, Divider } from "antd";

const { Title, Text } = Typography;

const chon = ["Búa", "Kéo", "Bao"];

const TH02Bai1 = () => {
    const [ketQua, setKetQua] = useState("");
    const [nguoiChon, setNguoiChon] = useState(null);
    const [mayChon, setMayChon] = useState(null);
    const [lichSu, setLichSu] = useState([]);

    const winner = (nguoi, may) => {
        if (nguoi === may) return "Hoà";

        if (
            (nguoi === 0 && may === 1) ||
            (nguoi === 1 && may === 2) ||
            (nguoi === 2 && may === 0)
        ) {
            return "Bạn thắng";
        }

        return "Máy thắng";
    };

    const handleChon = (luaChon) => {
        const mayLuaChon = Math.floor(Math.random() * 3);

        const result = winner(luaChon, mayLuaChon);

        setNguoiChon(luaChon);
        setMayChon(mayLuaChon);
        setKetQua(result);

        const vanMoi = {
            nguoi: chon[luaChon],
            may: chon[mayLuaChon],
            ketQua: result
        };

        setLichSu([vanMoi, ...lichSu]);
    };

    const resetGame = () => {
        setLichSu([]);
        setNguoiChon(null);
        setMayChon(null);
        setKetQua("");
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
            <Card
                style={{ width: 500, textAlign: "center", borderRadius: 12 }}
                title={<Title level={3}>Kéo - Búa - Bao</Title>}
            >

                <Text>Hãy chọn một trong ba lựa chọn bên dưới</Text>

                <Divider />

                <Space size="large">
                    {chon.map((item, index) => (
                        <Button
                            key={index}
                            type="primary"
                            size="large"
                            style={{ width: 100 }}
                            onClick={() => handleChon(index)}
                        >
                            {item}
                        </Button>
                    ))}
                </Space>

                {nguoiChon !== null && (
                    <>
                        <Divider />

                        <Space direction="vertical">
                            <Title level={4}>Bạn: {chon[nguoiChon]}</Title>
                            <Title level={4}>Máy: {chon[mayChon]}</Title>

                            <Title level={3} style={{ color: "#1677ff" }}>
                                {ketQua}
                            </Title>
                        </Space>
                    </>
                )}

                <Divider />

                <Card
                    size="small"
                    title="Lịch sử các ván đấu"
                    style={{ marginTop: 10 }}
                >
                    <List
                        dataSource={lichSu}
                        locale={{ emptyText: "Chưa có ván đấu nào" }}
                        renderItem={(item, index) => (
                            <List.Item>
                                Ván {lichSu.length - index}: {item.nguoi} vs {item.may} → {item.ketQua}
                            </List.Item>
                        )}
                    />
                </Card>

                <Button
                    danger
                    style={{ marginTop: 15 }}
                    onClick={resetGame}
                >
                    Reset lịch sử
                </Button>

            </Card>
        </div>
    );
};

export default TH02Bai1;