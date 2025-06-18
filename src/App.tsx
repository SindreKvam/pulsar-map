import { use, useState } from 'react'
import DatePicker from 'react-datepicker'
import './App.css'

import "react-datepicker/dist/react-datepicker.css";

type Pulsar = {
    name: string;
    ra: string;
    dec: string;
    gl: number;
    gb: number;
    angle_rad: number;
    latitude_rad: number;
    period_s: number;
    period_derivative: number;
    period_epoch: number;
    period_h_transition: number;
    distance_kpc: number;
    distance_relative: number;
    age: number;
}

function dateToMJD(date = new Date()): number {
    const unixTimeSeconds = date.getTime() / 1000;
    const jd = unixTimeSeconds / 86400 + 2440587.5; // Convert to Julian Date
    return jd - 2400000.5; // Convert to Modified Julian Date (MJD)
}

const PulsarTable = ({pulsars, removePulsar}) => {
    return (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
                <tr>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
                    {/* <th>RA</th>
                    <th>Dec</th> */}
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Galactic Longitude (deg)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Galactic Latitude (deg)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Galactic Longitude (rad)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Galactic Latitude (rad)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Period (s)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Period derivative (s/s)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Period epoch (mjd)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Period (Base 10, H transition unit)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Distance (kpc)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Relative Distance</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Age (Myr)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Remove</th>
                </tr>
            </thead>
            <tbody>
                {pulsars.map((p, index) => (
                    <tr key={index}>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.name}</td>
                        {/* <td>{p.ra}</td>
                        <td>{p.dec}</td> */}
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.gl.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.gb.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.angle_rad.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.latitude_rad.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.period_s.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.period_derivative.toExponential(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.period_epoch.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.period_h_transition.toFixed(0)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.distance_kpc}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.distance_relative.toFixed(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.age.toExponential(2)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}><button onClick={() => removePulsar(p)}>x</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const Sidebar = ({pulsars, addPulsar, removePulsar}) => {

    const [input, setInput] = useState("");

    const handleAdd = (name) => {
        addPulsar(name)
        setInput("")
    };

    return (
        <aside>
        <h1>Pulsars</h1>
        <input 
            style={{ width: "60%", padding: "8px", marginBottom: "10px" }}
            id="pulsar-search-bar" 
            placeholder="Enter pulsar name" 
            value={input}
            onChange={(val) => setInput(val.target.value)}>
        </input>

        <button onClick={()=> handleAdd(input)}>
            Add Pulsar
        </button>

        <hr></hr>
        <div>
            <h2>Active Pulsars</h2>
            <PulsarTable pulsars={pulsars} removePulsar={removePulsar} />
        </div>
        </aside>
    )
};

const PulsarMap = ({pulsars, width, height, scaleFactor}) => {

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [useCalculatedPeriod, setUseCalculatedPeriod] = useState(false);

    const centerX = width / 2 - width / 6;
    const centerY = height / 2;

    const lineThickness = 1; // Thickness of the lines
    const notchLength = scaleFactor * 0.0075; // Length of the notches
    const tickSpacing = notchLength * 0.15; // Spacing between notches
    const spaceBeforeNotch = 2; // Space before the first notch

    const selectedTimeMJD = dateToMJD(selectedDate);
    console.log("Selected MJD: ", selectedTimeMJD);

    return (
        <div>
            <hr></hr>
            <h2>Pulsar Map</h2>
            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat={"dd/MM/yyyy"}/>
            <button onClick={() => setUseCalculatedPeriod(!useCalculatedPeriod)}>
                {useCalculatedPeriod ? "Using calculated data" : "Using period from data" }
            </button>
            <div>
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: "2px solid #ccc", backgroundColor: "white" }}>

                    {/* Draw line to centre of the milky way, and add a notch at the end. */}
                    <line x1={centerX} y1={centerY} x2={centerX + scaleFactor} y2={centerY} stroke="black" strokeWidth={lineThickness} />
                    <line x1={centerX + scaleFactor} y1={centerY + notchLength/2} x2={centerX + scaleFactor} y2={centerY - notchLength/2} stroke="black" strokeWidth={lineThickness} />

                    {pulsars.map((p, index) => {
                        const angle = p.angle_rad;
                        const radius = p.distance_relative * scaleFactor;

                        const x = centerX + radius * Math.cos(angle);
                        const y = centerY + radius * Math.sin(angle);

                        // Calculate z-coordinate
                        const z_kpc = p.distance_kpc * Math.abs(Math.sin(p.latitude_rad));
                        const z_relative = z_kpc / 8 * scaleFactor; // Relative distance in kpc

                        // Calculate delta time in seconds from the period epoch to the selected date
                        const periodEpochMJD = p.period_epoch;
                        const deltaTimeMJD = selectedTimeMJD - periodEpochMJD;
                        const deltaTimeMJDSeconds = deltaTimeMJD * 86400; // Convert MJD days to seconds

                        const selectedPeriodSeconds = p.period_s + (p.period_derivative * deltaTimeMJDSeconds);
                        const selectedPeriodHTransition = selectedPeriodSeconds / 7.04225e-10; // Convert to H transition unit
                        console.log(`Selected period for ${p.name}: ${selectedPeriodSeconds} seconds, H transition unit: ${selectedPeriodHTransition}`);

                        // Binary encoding
                        let binary = '';
                        if (useCalculatedPeriod) {
                            binary = Math.round(selectedPeriodHTransition).toString(2);
                        } else {
                            binary = Math.round(p.period_h_transition).toString(2);
                        } 
                        
                        console.log(`Binary representation for ${p.name}: ${binary}`);
                        const ticks = [...binary]; // LSB near the end

                        let totalNotchLength = spaceBeforeNotch;

                        return (
                            <g key={index}>
                                <line
                                    x1={centerX}
                                    y1={centerY}
                                    x2={x}
                                    y2={y}
                                    stroke="black"
                                    strokeWidth={lineThickness}
                                />
                                {/* Notch to separate distance along plane, to distance from plane */}
                                <line
                                    x1={x - notchLength / 2 * Math.cos(angle + Math.PI / 2)}
                                    y1={y - notchLength / 2 * Math.sin(angle + Math.PI / 2)}
                                    x2={x + notchLength / 2 * Math.cos(angle + Math.PI / 2)}
                                    y2={y + notchLength / 2 * Math.sin(angle + Math.PI / 2)}
                                    stroke="black"
                                    strokeWidth={lineThickness}
                                />
                                {/* line after notch to indicate relative z-length */}
                                <line
                                    x1={x}
                                    y1={y}
                                    x2={x + z_relative * Math.cos(angle)}
                                    y2={y + z_relative * Math.sin(angle)}
                                    stroke="black"
                                    strokeWidth={lineThickness}
                                />

                                {ticks.map((tick, tickIndex) => {

                                    const notchR = radius + z_relative + totalNotchLength;
                                    let notchBaseX = centerX + notchR * Math.cos(angle);
                                    let notchBaseY = centerY + notchR * Math.sin(angle);

                                    let dx, dy;
                                    if (tick === '1') {
                                        // Perpendicular notch for '1'
                                        dx = notchLength * Math.cos(angle + Math.PI / 2);
                                        notchBaseX -= dx/2;
                                        dy = notchLength * Math.sin(angle + Math.PI / 2);
                                        notchBaseY -= dy/2;
                                        totalNotchLength += tickSpacing + lineThickness;
                                    } else {
                                        // Parallel notch for '0'
                                        dx = notchLength * Math.cos(angle);
                                        dy = notchLength * Math.sin(angle);
                                        totalNotchLength += tickSpacing + notchLength;
                                    }

                                    return (
                                        <line
                                            key={tickIndex}
                                            x1={notchBaseX}
                                            y1={notchBaseY}
                                            x2={notchBaseX + dx}
                                            y2={notchBaseY + dy}
                                            stroke="black"
                                            strokeWidth={lineThickness}
                                        />
                                    )
                                })};
                                {/* <text
                                    x={x}
                                    y={y}
                                    fontSize="12"
                                    textAnchor="middle"
                                    fill="black">{p.name}
                                </text> */}
                            </g>
                        )
                    })};
                </svg>
            </div>
        </div>
    );
};

function App() {

    const [pulsars, setPulsars] = useState<Pulsar[]>([]);

    const addPulsar = async (name: any) => {
        if (pulsars.find((p) => p.name === name)) return;

        try {
            const data = await fetchPulsarData(name);
            console.log("Data to put in pulsar array",data)
            setPulsars([...pulsars, data]);

        } catch (err) {
            console.error("Error fetching pulsar data: ", err);
        }
    };

    const removePulsar = (name: any) => {
        setPulsars(pulsars.filter(p => p !== name));
    };

    const fetchPulsarData = async (name: any) => {
        const response = await fetch(`/pulsar?name=${encodeURIComponent(name)}`);
        const data = await response.json();

        if (!response.ok) {
            alert(`Error fetching pulsar data: ${data.message}`);
        }

        const parsed_data = parsePulsarData(data);

        return parsed_data;
    };

    const parsePulsarData = (json_data: any): Pulsar => ({
        name: json_data.name,
        ra: json_data.position.ra,
        dec: json_data.position.dec,
        gl: json_data.galactic_position.gl,
        gb: json_data.galactic_position.gb,
        angle_rad: json_data.galactic_position.gl * Math.PI / 180,
        latitude_rad: json_data.galactic_position.gb * Math.PI / 180,
        period_s: json_data.period_s,
        period_derivative: json_data.period_derivative,
        period_epoch: json_data.period_epoch,
        period_h_transition: json_data.period_s / 7.04225e-10, // p.period_s / 7.04225e-10
        distance_kpc: json_data.distance_kpc,
        distance_relative: json_data.distance_kpc / 8, // p.distance_kpcs / 8
        age: json_data.characteristics.age,
    });

    return (
        <div>
            <Sidebar
                pulsars={pulsars}
                addPulsar={addPulsar}
                removePulsar={removePulsar}
            />
            <PulsarMap
                pulsars={pulsars}
                width={1200}
                height={600}
                scaleFactor={600}
            />
        </div>
    )
}


export default App
