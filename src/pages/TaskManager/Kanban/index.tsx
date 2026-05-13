import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, Typography, Tag } from 'antd';
import { useTasks } from '@/hooks/useTasks';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

const COLUMNS = [
  { id: 'To Do', title: 'Cần làm' },
  { id: 'Doing', title: 'Đang làm' },
  { id: 'Done', title: 'Hoàn thành' },
] as const;

type ColumnId = typeof COLUMNS[number]['id'];

const priorityColors: Record<string, string> = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

const KanbanBoard: React.FC = () => {
  const { tasks, migrateTaskStatus } = useTasks();

  const groupedTasks = useMemo(() => {
    return {
      'To Do': tasks.filter((t) => t.status === 'To Do'),
      'Doing': tasks.filter((t) => t.status === 'Doing'),
      'Done': tasks.filter((t) => t.status === 'Done'),
    };
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      migrateTaskStatus(draggableId, destination.droppableId as ColumnId);
    }
  };

  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: 24 }}>Kanban Board</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, height: '100%', overflowX: 'auto', paddingBottom: 16 }}>
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              style={{
                flex: 1,
                minWidth: 300,
                backgroundColor: '#f0f2f5',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>{column.title}</Title>
                <Tag color="blue" style={{ borderRadius: 10 }}>{groupedTasks[column.id].length}</Tag>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      flex: 1,
                      minHeight: 100,
                      backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                      transition: 'background-color 0.2s ease',
                      borderRadius: 4,
                    }}
                  >
                    {groupedTasks[column.id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: 'none',
                              marginBottom: 12,
                              ...provided.draggableProps.style,
                            }}
                          >
                            <Card
                              size="small"
                              bordered={false}
                              style={{
                                borderRadius: 6,
                                boxShadow: snapshot.isDragging
                                  ? '0 4px 12px rgba(0,0,0,0.15)'
                                  : '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'box-shadow 0.2s ease',
                              }}
                            >
                              <div style={{ marginBottom: 8 }}>
                                <Text strong>{task.name}</Text>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
                                <span style={{ fontSize: 12, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <ClockCircleOutlined />
                                  {moment(task.deadline).format('DD/MM/YYYY')}
                                </span>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
