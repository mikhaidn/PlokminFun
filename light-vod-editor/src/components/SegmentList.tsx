import { useState } from 'react';
import type { Segment } from '../types';
import { formatTime } from '../utils/formatters';

interface SegmentListProps {
  segments: Segment[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onPreview: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, updates: Partial<Segment>) => void;
}

export function SegmentList({
  segments,
  selectedIndex,
  onSelect,
  onPreview,
  onDelete,
  onUpdate,
}: SegmentListProps) {
  const [editingField, setEditingField] = useState<{
    index: number;
    field: 'name' | 'start' | 'end' | 'duration';
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  if (segments.length === 0) {
    return (
      <div className="segment-list">
        <p style={{ color: '#8b949e', textAlign: 'center', padding: '20px' }}>
          No segments added yet. Mark start and end points above.
        </p>
      </div>
    );
  }

  const startEdit = (
    index: number,
    field: 'name' | 'start' | 'end' | 'duration',
    currentValue: string
  ) => {
    setEditingField({ index, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingField) return;

    const { index, field } = editingField;
    const segment = segments[index];

    if (field === 'name') {
      onUpdate(index, { name: editValue || undefined });
    } else if (field === 'start') {
      const newStart = parseFloat(editValue);
      if (!isNaN(newStart) && newStart >= 0 && newStart < segment.end) {
        onUpdate(index, { start: newStart });
      }
    } else if (field === 'end') {
      const newEnd = parseFloat(editValue);
      if (!isNaN(newEnd) && newEnd > segment.start) {
        onUpdate(index, { end: newEnd });
      }
    } else if (field === 'duration') {
      const newDuration = parseFloat(editValue);
      if (!isNaN(newDuration) && newDuration > 0) {
        onUpdate(index, { end: segment.start + newDuration });
      }
    }

    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="segment-list">
      {segments.map((seg, i) => {
        const duration = seg.end - seg.start;
        const isSelected = selectedIndex === i;

        return (
          <div
            key={i}
            className={`segment-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className="segment-number">{i + 1}</div>
            <div className="segment-info">
              {/* Name field */}
              <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                {editingField?.index === i && editingField.field === 'name' ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder="Segment name"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      background: '#0d1117',
                      border: '1px solid #4a9eff',
                      borderRadius: '4px',
                      color: '#e0e0e0',
                      fontSize: '14px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(i, 'name', seg.name || '');
                    }}
                    style={{
                      cursor: 'text',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      background: seg.name ? '#161b22' : 'transparent',
                      border: '1px solid transparent',
                      color: seg.name ? '#c9d1d9' : '#8b949e',
                      fontWeight: seg.name ? 600 : 400,
                      fontStyle: seg.name ? 'normal' : 'italic',
                    }}
                    title="Click to edit name"
                  >
                    {seg.name || 'Click to add name...'}
                  </div>
                )}
              </div>

              {/* Start time */}
              <div>
                <div className="segment-time">Start: {formatTime(seg.start)}</div>
                {editingField?.index === i && editingField.field === 'start' ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#0d1117',
                      border: '1px solid #4a9eff',
                      borderRadius: '3px',
                      color: '#58a6ff',
                      fontSize: '13px',
                      fontFamily: 'Monaco, monospace',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <small
                    className="segment-duration"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(i, 'start', seg.start.toFixed(2));
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                    title="Click to edit"
                  >
                    {seg.start.toFixed(2)}s
                  </small>
                )}
              </div>

              {/* End time */}
              <div>
                <div className="segment-time">End: {formatTime(seg.end)}</div>
                {editingField?.index === i && editingField.field === 'end' ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#0d1117',
                      border: '1px solid #4a9eff',
                      borderRadius: '3px',
                      color: '#58a6ff',
                      fontSize: '13px',
                      fontFamily: 'Monaco, monospace',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <small
                    className="segment-duration"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(i, 'end', seg.end.toFixed(2));
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                    title="Click to edit"
                  >
                    {seg.end.toFixed(2)}s
                  </small>
                )}
              </div>

              {/* Duration */}
              <div>
                <div className="segment-time">Duration: {formatTime(duration)}</div>
                {editingField?.index === i && editingField.field === 'duration' ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '4px',
                      background: '#0d1117',
                      border: '1px solid #4a9eff',
                      borderRadius: '3px',
                      color: '#58a6ff',
                      fontSize: '13px',
                      fontFamily: 'Monaco, monospace',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <small
                    className="segment-duration"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(i, 'duration', duration.toFixed(2));
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                    title="Click to edit"
                  >
                    {duration.toFixed(2)}s
                  </small>
                )}
              </div>
            </div>
            <div className="segment-actions">
              <button
                className="secondary small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(i);
                }}
              >
                ▶️
              </button>
              <button
                className="danger small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(i);
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
