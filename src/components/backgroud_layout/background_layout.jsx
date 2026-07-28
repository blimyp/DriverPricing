import './background_layout.css';

function BackgroundLayout({ children }) {
    return (
        <div className="layout">
            <div className="backgroundCircle backgroundCircleOne" />

            {children}
        </div>
    );
}

export default BackgroundLayout;