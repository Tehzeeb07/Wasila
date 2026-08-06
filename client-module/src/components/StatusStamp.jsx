const LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const CLASS = {
  open: 'stamp stamp-open',
  in_progress: 'stamp stamp-progress',
  completed: 'stamp stamp-completed',
  cancelled: 'stamp stamp-cancelled',
}

export default function StatusStamp({ status }) {
  return <span className={CLASS[status] || 'stamp'}>{LABELS[status] || status}</span>
}
