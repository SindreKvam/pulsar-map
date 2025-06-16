import { useState } from 'react'
import './App.css'


type Pulsar = {
    name: string;
    ra: string;
    dec: string;
    gl: number;
    gb: number;
    period_s: number;
    distance_kpc: number;
    age: number;
}

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
            Active pulsar(s):
            <ul>
                {pulsars.map((p, index) => (
                    <li key={index}>
                        <span>{p.name}</span>
                        <button onClick={() => removePulsar(p)}>x</button>
                    </li>
                ))}
            </ul>
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
        const response = await fetch(`/pulsar?name=${name}`);
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
        distance_kpc: json_data.distance_kpc,
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
