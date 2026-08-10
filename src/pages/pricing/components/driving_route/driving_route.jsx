import {
    MapPin,
    Navigation,
    Plus,
    Route,
    Trash2,
} from 'lucide-react';
import './driving_route.css'

function DrivingRoute({
    origin,
    destination,
    stops,
    onOriginChange,
    onDestinationChange,
    onStopsChange,
}) {
    function addStop() {
        onStopsChange([...stops, ''])
    }

    function updateStop(index, value) {
        const updatedStops = [...stops]

        updatedStops[index] = value

        onStopsChange(updatedStops)
    }

    function removeStop(index) {
        const updatedStops = stops.filter(
            (_, stopIndex) => stopIndex !== index
        )

        onStopsChange(updatedStops)
    }

    return (
        <div className="tripRoute">
            <div className="routeFields">
                <div className="formField">
                    <label
                        className="formLabel"
                        htmlFor="origin"
                    >
                        מוצא
                    </label>

                    <div className="inputWrapper">
                        <MapPin
                            className="inputIcon"
                            strokeWidth={1.9}
                            aria-hidden="true"
                        />

                        <input
                            className="formControl"
                            id="origin"
                            name="origin"
                            type="text"
                            placeholder="לדוגמה: ירושלים"
                            value={origin}
                            onChange={(event) =>
                                onOriginChange(event.target.value)
                            }
                        />
                    </div>
                </div>

                {stops.map((stop, index) => (
                    <div
                        className="extraStop"
                        key={index}
                    >
                        <div className="formField">
                            <label
                                className="formLabel"
                                htmlFor={`routeStop-${index}`}
                            >
                                תחנת ביניים {index + 1}
                            </label>

                            <div className="inputWrapper">
                                <Route
                                    className="inputIcon"
                                    strokeWidth={1.9}
                                    aria-hidden="true"
                                />

                                <input
                                    className="formControl stopInput"
                                    id={`routeStop-${index}`}
                                    type="text"
                                    placeholder="הזן תחנה נוספת"
                                    value={stop}
                                    onChange={(event) =>
                                        updateStop(
                                            index,
                                            event.target.value
                                        )
                                    }
                                />

                                <button
                                    className="removeStopButton"
                                    type="button"
                                    onClick={() => removeStop(index)}
                                    aria-label={`מחיקת תחנה ${index + 1}`}
                                >
                                    <Trash2
                                        strokeWidth={1.9}
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="formField">
                    <label
                        className="formLabel"
                        htmlFor="destination"
                    >
                        יעד
                    </label>

                    <div className="inputWrapper">
                        <Navigation
                            className="inputIcon"
                            strokeWidth={1.9}
                            aria-hidden="true"
                        />

                        <input
                            className="formControl"
                            id="destination"
                            name="destination"
                            type="text"
                            placeholder="לדוגמה: תל אביב"
                            value={destination}
                            onChange={(event) =>
                                onDestinationChange(event.target.value)
                            }
                        />
                    </div>
                </div>
            </div>

            <button
                className="addStopButton"
                type="button"
                onClick={addStop}
            >
                <span className="addStopIcon">
                    <Plus
                        strokeWidth={2.2}
                        aria-hidden="true"
                    />
                </span>

                <span>הוספת תחנה למסלול</span>
            </button>
        </div>
    )
}

export default DrivingRoute