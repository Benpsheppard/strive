// InlineSpinner.jsx
// Loading indicator inside a card or section

const InlineSpinner = () => (
    <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
        <div className="loadingSpinner !h-10 !w-10 !border-4" aria-hidden="true"></div>
        <span className="sr-only">Loading</span>
    </div>
)

export default InlineSpinner
