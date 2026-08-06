interface BulkActionBarProps {
    selectedCount: number;
    onDownload: () => void;
    onDelete: () => void;
    onClearSelection: () => void;
}

export function BulkActionBar({ selectedCount, onDownload, onDelete, onClearSelection }: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#181b22',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            zIndex: 9999,
            border: '1px solid rgba(255, 122, 0, 0.3)',
            fontFamily: 'inherit'
        }}>
            <span style={{
                fontWeight: 600,
                color: '#ff7a00',
                fontSize: '13px'
            }}>
                {selectedCount} فایل انتخاب شده
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onDownload} style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                }}>
                    📥 دانلود گروهی
                </button>

                <button onClick={onDelete} style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500
                }}>
                    🗑️ حذف گروهی
                </button>

                <button onClick={onClearSelection} style={{
                    background: 'none',
                    border: 'none',
                    color: '#a0a0a0',
                    cursor: 'pointer',
                    fontSize: '14px'
                }}>
                    ✕
                </button>
            </div>
        </div>
    );
}