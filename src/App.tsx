import { useState } from 'react'
import './App.css'


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
                        <span>{p}</span>
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

    const [pulsars, setPulsars] = useState([])

    const addPulsar = (name) => {
        if (!pulsars.includes(name)) {
            setPulsars([...pulsars, name]);
        }
    };

    const removePulsar = (name) => {
        setPulsars(pulsars.filter(p => p !== name));
    };

    return (
        <div>
            <Sidebar pulsars={pulsars} addPulsar={addPulsar} removePulsar={removePulsar}/>
            <PulsarMap pulsars={pulsars}/>
        </div>
    )
}


const fetchPulsarData = async (name) => {
  const response = await fetch(`https://example.com/api/pulsars/${name}`);
  const data = await response.json();
  return data;
};


export default App
