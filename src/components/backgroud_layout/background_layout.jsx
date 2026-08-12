import './background_layout.css';

function BackgroundLayout({ children }) {
    return (
        <div className="layout">
            <div className="backgroundCircle" />

            {children}
        </div>
    );
}

export default BackgroundLayout;