import React, { useEffect, useState } from 'react';
import { Button, Card, Col, InputNumber, Row, Statistic, Alert, Space } from 'antd';

const MAX_ATTEMPTS = 10;

type GameStatus = 'playing' | 'won' | 'lost';

const GameDoanSo: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [currentGuess, setCurrentGuess] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [history, setHistory] = useState<number[]>([]);

  const startNewGame = () => {
    const random = Math.floor(Math.random() * 100) + 1; 
    setTargetNumber(random);
    setCurrentGuess(null);
    setAttemptsLeft(MAX_ATTEMPTS);
    setMessage('Hãy nhập số bạn đoán (1 - 100). Bạn có 10 lượt!');
    setStatus('playing');
    setHistory([]);
  };

  useEffect(() => {startNewGame();}, []);

  const handleGuess = () => {
    if (status !== 'playing') {
      return;
    }
    if (currentGuess === null || Number.isNaN(currentGuess)) {
      setMessage('Vui lòng nhập một số hợp lệ từ 1 đến 100.');
      return;
    }
    if (currentGuess < 1 || currentGuess > 100) {
      setMessage('Số phải nằm trong khoảng 1 đến 100.');
      return;
    }

    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);
    setHistory((prev) => [...prev, currentGuess]);

    if (currentGuess === targetNumber) {
      setStatus('won');
      setMessage('Chúc mừng! Bạn đã đoán đúng!');
      return;
    }

    if (newAttemptsLeft === 0) {
      setStatus('lost');
      setMessage(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
      return;
    }

    if (currentGuess < targetNumber) {
      setMessage('Bạn đoán quá thấp!');
    } else {
      setMessage('Bạn đoán quá cao!');
    }
  };

  const isInputDisabled = status !== 'playing' || attemptsLeft <= 0;

  return (
    <Row justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card title="Trò chơi đoán số (1 - 100)">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Lượt còn lại" value={attemptsLeft} />
            </Col>
            <Col span={12}>
              <Statistic
                title="Trạng thái"
                value={
                  status === 'playing'
                    ? 'Đang chơi'
                    : status === 'won'
                    ? 'Thắng'
                    : 'Thua'
                }
              />
            </Col>
          </Row>

          <Space direction="vertical" size="middle" style={{ marginTop: 24, width: '100%' }}>
            <Space>
              <InputNumber
                min={1}
                max={100}
                value={currentGuess as number | null}
                onChange={(value) => setCurrentGuess(value as number | null)}
                disabled={isInputDisabled}
                placeholder="Nhập số dự đoán"
              />
              <Button type="primary" onClick={handleGuess} disabled={isInputDisabled}>
                Đoán
              </Button>
              <Button onClick={startNewGame}>Chơi lại</Button>
            </Space>

            {message && (
              <Alert
                type={
                  status === 'won'
                    ? 'success'
                    : status === 'lost'
                    ? 'error'
                    : 'info'
                }
                message={message}
              />
            )}

            {history.length > 0 && (
              <div>
                <strong>Các lần đoán trước:</strong>{' '}
                {history.join(', ')}
              </div>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default GameDoanSo;