import React from 'react';
import { Drawer, List, Typography } from 'antd';
import moment from 'moment';

const { Text } = Typography;

interface HistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  history: any[];
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ visible, onClose, history }) => {
  return (
    <Drawer
      title="Lịch sử thao tác"
      placement="right"
      width={400}
      onClose={onClose}
      visible={visible}
    >
      <List
        dataSource={history}
        renderItem={item => (
          <List.Item>
            <div>
              <div><Text strong>{moment(item.timestamp).format('HH:mm DD/MM/YYYY')}</Text></div>
              <div>{item.details}</div>
            </div>
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default HistoryDrawer;
