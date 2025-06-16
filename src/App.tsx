import { useState } from 'react'
import './App.css'


type Pulsar = {
    name: string;
    ra: string;
    dec: string;
    gl: number;
    gb: number;
    period_s: number;
    period_h_transition: number;
    distance_kpc: number;
    distance_relative: number;
    age: number;
}

const PulsarTable = ({pulsars, removePulsar}) => {
    return (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
                <tr>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
                    {/* <th>RA</th>
                    <th>Dec</th> */}
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Galactic Longitude</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Galactic Latitude</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Period (s)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Period (Base 10, H transition unit)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Distance (kpc)</th>
                    <th style={{ border: "1px solid #ccc", padding: "8px" }}>Relative Distance (%)</th>
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
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{p.period_s.toFixed(2)}</td>
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
        <h2>Pulsars</h2>
        <input 
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

const PulsarMap = ({pulsars}) => {
    return (
        <div>
            <h2>Pulsar Map</h2>
            <div>
                {pulsars.length === 0 ? "No pulsars added yet." : "[Map visualization placeholder]"}
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
        period_s: json_data.period_s,
        period_h_transition: json_data.period_s / 7.04225e-10, // p.period_s / 7.04225e-10
        distance_kpc: json_data.distance_kpc,
        distance_relative: json_data.distance_kpc * 100 / 8, // p.distance_kpc * 100 / 8
        age: json_data.characteristics.age,
    });

    return (
        <div>
            <Sidebar pulsars={pulsars} addPulsar={addPulsar} removePulsar={removePulsar}/>
            <PulsarMap pulsars={pulsars}/>
        </div>
    )
}


export default App
