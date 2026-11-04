// Spinner.jsx
// Full-screen loading indicator

const Spinner = () => (
    <div className="loadingSpinnerContainer" role="status" aria-live="polite">
        <div className="loadingSpinner" aria-hidden="true"></div>
        <span className="sr-only">Loading</span>
    </div>
)

export default Spinner
