import React from 'react'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import './styles/App.css'

import "react-datepicker/dist/react-datepicker.css";

type Pulsar = {
    name: string;
    gl_rad: number;
    gb_rad: number;
    period_s: number;
    period_derivative: number;
    period_epoch: number;
    period_h_transition: number;
    distance_kpc: number;
    distance_relative: number;
    distance_relative_xy_plane: number;
    distance_relative_z_plane: number;
    age: number;
}

type DrawingContext = {
    startX: number;
    startY: number;
    angle_rad: number;
    length: number;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
}

function dateToMJD(date = new Date()): number {
    const unixTimeSeconds = date.getTime() / 1000;
    const jd = unixTimeSeconds / 86400 + 2440587.5; // Convert to Julian Date
    return jd - 2400000.5; // Convert to Modified Julian Date (MJD)
}

interface PulsarTableProps {
    pulsars: Pulsar[];
    removePulsar: Function;
}

const PulsarTable: React.FC<PulsarTableProps> = ({ pulsars, removePulsar }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Galactic Longitude (rad)</th>
                    <th>Galactic Latitude (rad)</th>
                    <th>Period (s)</th>
                    <th>Period derivative (s/s)</th>
                    <th>Period epoch (mjd)</th>
                    <th>Period (Base 10, H transition unit)</th>
                    <th>Distance (kpc)</th>
                    <th>Relative Distance</th>
                    <th>Relative Distance along galactic plane</th>
                    <th>Relative Distance z axis</th>
                    <th>Age (Myr)</th>
                    <th>Remove</th>
                </tr>
            </thead>
            <tbody>
                {pulsars.map((p, index) => (
                    <tr key={index}>
                        <th>{p.name}</th>
                        <td>{p.gl_rad.toFixed(2)}</td>
                        <td>{p.gb_rad.toFixed(2)}</td>
                        <td>{p.period_s.toFixed(2)}</td>
                        <td>{p.period_derivative.toExponential(2)}</td>
                        <td>{p.period_epoch.toFixed(2)}</td>
                        <td>{p.period_h_transition}</td>
                        <td>{p.distance_kpc}</td>
                        <td>{p.distance_relative.toFixed(2)}</td>
                        <td>{p.distance_relative_xy_plane.toFixed(2)}</td>
                        <td>{p.distance_relative_z_plane.toFixed(2)}</td>
                        <td>{p.age.toExponential(2)}</td>
                        {/* Add button to remove pulsar if wanted */}
                        <td><button onClick={() => removePulsar(p)}>x</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

interface SidebarProps {
    pulsars: Pulsar[];
    addPulsar: Function;
    removePulsar: Function;
}

const Sidebar: React.FC<SidebarProps> = ({ pulsars, addPulsar, removePulsar }) => {

    const [input, setInput] = useState("");

    const handleAdd = (name: string) => {
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

            <button onClick={() => handleAdd(input)}>
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

interface PulsarMapProps {
    pulsars: Pulsar[];
    width: number;
    height: number;
    scaleFactor: number;
}

const PulsarMap: React.FC<PulsarMapProps> = ({ pulsars, width, height, scaleFactor }) => {

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [useCalculatedPeriod, setUseCalculatedPeriod] = useState(false);

    const centerX = width / 2 - width / 6;
    const centerY = height / 2;

    const lineThickness = 1; // Thickness of the lines
    const notchLength = scaleFactor * 0.0075; // Length of the notches
    const tickSpacing = notchLength * 0.15; // Spacing between notches
    const spaceBeforeNotch = notchLength * 1.75; // Space before the first notch

    const selectedTimeMJD = dateToMJD(selectedDate);

    return (
        <div>
            <hr></hr>
            <h2>Pulsar Map</h2>
            <DatePicker selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat={"dd/MM/yyyy"} />
            <button onClick={() => setUseCalculatedPeriod(!useCalculatedPeriod)}>
                {useCalculatedPeriod ? "Using calculated period from date" : "Using period from data"}
            </button>
            <div>
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} >

                    {/* Draw line to centre of the milky way, and add a notch at the end. */}
                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={centerX + scaleFactor}
                        y2={centerY}
                        stroke="black"
                        strokeWidth={lineThickness}
                    />
                    <line
                        x1={centerX + scaleFactor}
                        y1={centerY + notchLength / 2}
                        x2={centerX + scaleFactor}
                        y2={centerY - notchLength / 2}
                        stroke="black"
                        strokeWidth={lineThickness}
                    />

                    {pulsars.map((p, index) => {
                        const galacticLongitudeRad = p.gl_rad;
                        const xyDistance = p.distance_relative_xy_plane * scaleFactor;
                        const zDistance = p.distance_relative_z_plane * scaleFactor;

                        const x = centerX + xyDistance * Math.cos(galacticLongitudeRad);
                        const y = centerY + xyDistance * Math.sin(galacticLongitudeRad);

                        // Calculate delta time in seconds from the period epoch to the selected date
                        const periodEpochMJD = p.period_epoch;
                        const deltaTimeMJD = selectedTimeMJD - periodEpochMJD;
                        const deltaTimeMJDSeconds = deltaTimeMJD * 86400; // Convert MJD days to seconds

                        const selectedPeriodSeconds = p.period_s + (p.period_derivative * deltaTimeMJDSeconds);
                        const selectedPeriodHTransition = selectedPeriodSeconds / 7.040241838e-10; // Convert to H transition unit

                        // Binary encoding
                        let binary = '';
                        if (useCalculatedPeriod) {
                            binary = Math.round(selectedPeriodHTransition).toString(2);
                        } else {
                            binary = Math.round(p.period_h_transition).toString(2);
                        }

                        const ticks = [...binary]; // LSB near the end

                        const notchR = xyDistance + zDistance + spaceBeforeNotch;
                        const drawing_context: DrawingContext = {
                            startX: centerX + notchR * Math.cos(galacticLongitudeRad),
                            startY: centerY + notchR * Math.sin(galacticLongitudeRad),
                            angle_rad: galacticLongitudeRad,
                            length: notchLength,
                            strokeWidth: lineThickness,
                        }

                        return (
                            <g key={index}>
                                {/* Draw the pulsar position */}
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
                                    x1={x - notchLength / 2 * Math.cos(galacticLongitudeRad + Math.PI / 2)}
                                    y1={y - notchLength / 2 * Math.sin(galacticLongitudeRad + Math.PI / 2)}
                                    x2={x + notchLength / 2 * Math.cos(galacticLongitudeRad + Math.PI / 2)}
                                    y2={y + notchLength / 2 * Math.sin(galacticLongitudeRad + Math.PI / 2)}
                                    stroke="black"
                                    strokeWidth={lineThickness}
                                />
                                {/* line after notch to indicate relative z-length */}
                                <line
                                    x1={x}
                                    y1={y}
                                    x2={x + zDistance * Math.cos(galacticLongitudeRad)}
                                    y2={y + zDistance * Math.sin(galacticLongitudeRad)}
                                    stroke="black"
                                    strokeWidth={lineThickness}
                                />

                                {/* Draw the ticks indicating the binary representation of pulsar period */}
                                {PulsarMapNotches({ ticks: ticks, drawing_context: drawing_context })}
                                {/* Draw the pulsar name */}
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

interface PulsarMapNotchesProps {
    ticks: string[];
    drawing_context: DrawingContext;
}
const PulsarMapNotches: React.FC<PulsarMapNotchesProps> = ({ ticks, drawing_context }) => {

    let totalNotchLength = 0;
    const tickSpacing = drawing_context.length * 0.15;

    return ticks.map((tick, tickIndex) => {

        let notchBaseX = drawing_context.startX + totalNotchLength * Math.cos(drawing_context.angle_rad);
        let notchBaseY = drawing_context.startY + totalNotchLength * Math.sin(drawing_context.angle_rad);

        console.log(totalNotchLength, drawing_context)

        let dx, dy;
        if (tick === '1') {
            // Perpendicular notch for '1'
            dx = drawing_context.length * Math.cos(drawing_context.angle_rad + Math.PI / 2);
            notchBaseX -= dx / 2;
            dy = drawing_context.length * Math.sin(drawing_context.angle_rad + Math.PI / 2);
            notchBaseY -= dy / 2;
            totalNotchLength += tickSpacing + drawing_context.strokeWidth;
        } else {
            // Parallel notch for '0'
            const parallell_line_scaling = 0.7;
            dx = drawing_context.length * Math.cos(drawing_context.angle_rad) * parallell_line_scaling;
            dy = drawing_context.length * Math.sin(drawing_context.angle_rad) * parallell_line_scaling;
            totalNotchLength += tickSpacing + drawing_context.length * parallell_line_scaling + drawing_context.strokeWidth;
        }

        return (
            <line
                key={tickIndex}
                x1={notchBaseX}
                y1={notchBaseY}
                x2={notchBaseX + dx}
                y2={notchBaseY + dy}
                stroke="black"
                strokeWidth={drawing_context.strokeWidth}
            />
        )
    })
};


function App() {

    const [pulsars, setPulsars] = useState<Pulsar[]>([]);

    const addPulsars = (name: any) => {
        // Check if there is a comma-separated list of pulsars
        let names: Array<string> = name.split(",").map((n: string) => n.trim());

        {
            names.map((n) => {
                addPulsar(n);
            })
        };
    };

    const addPulsar = async (name: any) => {
        if (pulsars.find((p) => p.name === name)) return;

        try {
            const data = await fetchPulsarData(name);
            setPulsars((prevPulsars) => [...prevPulsars, data]);

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
        gl_rad: json_data.galactic_longitude_rad,
        gb_rad: json_data.galactic_latitude_rad,
        period_s: json_data.period_s,
        period_derivative: json_data.period_derivative,
        period_epoch: json_data.period_epoch,
        period_h_transition: json_data.period_h_transition,
        distance_kpc: json_data.distance_kpc,
        distance_relative: json_data.relative_distance,
        distance_relative_xy_plane: json_data.relative_xy_distance,
        distance_relative_z_plane: json_data.relative_z_distance,
        age: json_data.age,
    });

    return (
        <div>
            <Sidebar
                pulsars={pulsars}
                addPulsar={addPulsars}
                removePulsar={removePulsar}
            />
            <PulsarMap
                pulsars={pulsars}
                width={2000}
                height={1500}
                scaleFactor={1000}
            />
        </div>
    )
}


export default App
